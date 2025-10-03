import BaseService from '../core/BaseService.js';
import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Authentication Service
 * Handles authentication business logic
 */
class AuthService extends BaseService {
    constructor() {
        const userRepository = new UserRepository();
        super(userRepository);
        this.userRepository = userRepository;
    }

    /**
     * Register a new user
     */
    async register(userData) {
        try {
            // Validate registration data
            await this._validateRegistration(userData);

            // Check if email already exists
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already registered');
            }

            // Hash password
            const hashedPassword = await this._hashPassword(userData.password);

            // Create user data
            const newUserData = {
                ...userData,
                password: hashedPassword,
                email: userData.email.toLowerCase(),
                isAdmin: false // Default to non-admin
            };

            // Create user
            const user = await this.userRepository.create(newUserData);

            // Remove password from response
            const { password, ...userResponse } = user.toObject();

            return {
                success: true,
                message: 'User registered successfully',
                user: userResponse
            };
        } catch (error) {
            throw this._handleError(error, 'register');
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            // Validate login data
            this._validateLoginData(email, password);

            // Find user by email
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await this._verifyPassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Check if user is admin (if required)
            if (!user.isAdmin) {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Generate JWT token
            const token = this._generateToken(user);

            // Remove password from response
            const { password: userPassword, ...userDetails } = user.toObject();

            return {
                success: true,
                message: 'Login successful',
                token,
                user: userDetails,
                isAdmin: user.isAdmin
            };
        } catch (error) {
            throw this._handleError(error, 'login');
        }
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('No token provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await this.userRepository.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin
                }
            };
        } catch (error) {
            throw this._handleError(error, 'verifyToken');
        }
    }

    /**
     * Change user password
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Find user
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isCurrentPasswordValid = await this._verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Validate new password
            this._validatePassword(newPassword);

            // Hash new password
            const hashedNewPassword = await this._hashPassword(newPassword);

            // Update password
            await this.userRepository.updateById(userId, { password: hashedNewPassword });

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            throw this._handleError(error, 'changePassword');
        }
    }

    /**
     * Reset password (admin only)
     */
    async resetPassword(userId, newPassword) {
        try {
            // Validate new password
            this._validatePassword(newPassword);

            // Hash new password
            const hashedPassword = await this._hashPassword(newPassword);

            // Update password
            await this.userRepository.updateById(userId, { password: hashedPassword });

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            throw this._handleError(error, 'resetPassword');
        }
    }

    /**
     * Validate registration data
     */
    async _validateRegistration(userData) {
        const { name, email, password, phone } = userData;

        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!email || !this._isValidEmail(email)) {
            throw new Error('Valid email is required');
        }

        if (!phone || phone.trim().length < 10) {
            throw new Error('Valid phone number is required');
        }

        this._validatePassword(password);
    }

    /**
     * Validate login data
     */
    _validateLoginData(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (!this._isValidEmail(email)) {
            throw new Error('Valid email is required');
        }
    }

    /**
     * Validate password strength
     */
    _validatePassword(password) {
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
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
     * Hash password
     */
    async _hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify password
     */
    async _verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate JWT token
     */
    _generateToken(user) {
        const payload = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }
}

export default AuthService;
