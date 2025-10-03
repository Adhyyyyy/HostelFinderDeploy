import BaseService from '../core/BaseService.js';
import UserRepository from '../repositories/UserRepository.js';

/**
 * User Service
 * Handles user business logic
 */
class UserService extends BaseService {
    constructor() {
        const userRepository = new UserRepository();
        super(userRepository);
        this.userRepository = userRepository;
    }

    /**
     * Create a new user
     */
    async create(userData) {
        try {
            await this._validateCreate(userData);
            
            // Check if email already exists
            const emailExists = await this.userRepository.emailExists(userData.email);
            if (emailExists) {
                throw new Error('Email already exists');
            }

            // Normalize email
            userData.email = userData.email.toLowerCase();

            return await super.create(userData);
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Update user by ID
     */
    async updateById(id, userData) {
        try {
            await this._validateUpdate(userData);

            // If email is being updated, check if it already exists
            if (userData.email) {
                const emailExists = await this.userRepository.emailExists(userData.email, id);
                if (emailExists) {
                    throw new Error('Email already exists');
                }
                userData.email = userData.email.toLowerCase();
            }

            return await super.updateById(id, userData);
        } catch (error) {
            throw this._handleError(error, 'updateById');
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            return this._formatResponse(user);
        } catch (error) {
            throw this._handleError(error, 'getUserByEmail');
        }
    }

    /**
     * Get all admin users
     */
    async getAdminUsers() {
        try {
            const adminUsers = await this.userRepository.findByAdminStatus(true);
            return adminUsers.map(user => this._formatResponse(user));
        } catch (error) {
            throw this._handleError(error, 'getAdminUsers');
        }
    }

    /**
     * Get all regular users
     */
    async getRegularUsers() {
        try {
            const regularUsers = await this.userRepository.findByAdminStatus(false);
            return regularUsers.map(user => this._formatResponse(user));
        } catch (error) {
            throw this._handleError(error, 'getRegularUsers');
        }
    }

    /**
     * Search users by name or email
     */
    async searchUsers(searchTerm, options = {}) {
        try {
            const users = await this.userRepository.search(searchTerm, options);
            return users.map(user => this._formatResponse(user));
        } catch (error) {
            throw this._handleError(error, 'searchUsers');
        }
    }

    /**
     * Get users with bookings
     */
    async getUsersWithBookings() {
        try {
            const users = await this.userRepository.findUsersWithBookings();
            return users.map(user => this._formatResponse(user));
        } catch (error) {
            throw this._handleError(error, 'getUsersWithBookings');
        }
    }

    /**
     * Add booking to user
     */
    async addBookingToUser(userId, bookingData) {
        try {
            // Validate booking data
            this._validateBookingData(bookingData);

            const user = await this.userRepository.addBooking(userId, bookingData);
            if (!user) {
                throw new Error('User not found');
            }

            return this._formatResponse(user);
        } catch (error) {
            throw this._handleError(error, 'addBookingToUser');
        }
    }

    /**
     * Remove booking from user
     */
    async removeBookingFromUser(userId, bookingId) {
        try {
            const user = await this.userRepository.removeBooking(userId, bookingId);
            if (!user) {
                throw new Error('User not found');
            }

            return this._formatResponse(user);
        } catch (error) {
            throw this._handleError(error, 'removeBookingFromUser');
        }
    }

    /**
     * Toggle admin status
     */
    async toggleAdminStatus(userId) {
        try {
            const user = await this.repository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const updatedUser = await this.repository.updateById(userId, {
                isAdmin: !user.isAdmin
            });

            return this._formatResponse(updatedUser);
        } catch (error) {
            throw this._handleError(error, 'toggleAdminStatus');
        }
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        try {
            const totalUsers = await this.repository.count();
            const adminUsers = await this.repository.count({ isAdmin: true });
            const regularUsers = totalUsers - adminUsers;
            const usersWithBookings = await this.userRepository.findUsersWithBookings();

            return {
                totalUsers,
                adminUsers,
                regularUsers,
                usersWithBookings: usersWithBookings.length,
                adminPercentage: totalUsers > 0 ? (adminUsers / totalUsers) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getUserStatistics');
        }
    }

    /**
     * Validate user creation data
     */
    async _validateCreate(data) {
        const { name, email, password, phone } = data;

        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!email || !this._isValidEmail(email)) {
            throw new Error('Valid email is required');
        }

        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (!phone || phone.trim().length < 10) {
            throw new Error('Valid phone number is required');
        }
    }

    /**
     * Validate user update data
     */
    async _validateUpdate(data) {
        if (data.name && data.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (data.email && !this._isValidEmail(data.email)) {
            throw new Error('Valid email is required');
        }

        if (data.password && data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (data.phone && data.phone.trim().length < 10) {
            throw new Error('Valid phone number is required');
        }
    }

    /**
     * Validate booking data
     */
    _validateBookingData(bookingData) {
        const { room, durationInMonths } = bookingData;

        if (!room) {
            throw new Error('Room ID is required');
        }

        if (!durationInMonths || durationInMonths < 1) {
            throw new Error('Duration must be at least 1 month');
        }
    }

    /**
     * Validate email format
     */
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Format user response (remove sensitive data)
     */
    _formatResponse(user) {
        if (!user) return null;
        
        const userObj = user.toObject ? user.toObject() : user;
        const { password, ...safeUser } = userObj;
        return safeUser;
    }
}

export default UserService;
