import BaseController from '../core/BaseController.js';
import UserService from '../services/UserService.js';

/**
 * User Controller
 * Handles user HTTP requests
 */
class UserController extends BaseController {
    constructor() {
        const userService = new UserService();
        super(userService);
        this.userService = userService;
    }

    /**
     * Create a new user
     */
    async create(req, res, next) {
        try {
            this.validateBody(req, ['name', 'email', 'password', 'phone']);

            const result = await this.userService.create(req.body);
            this.sendResponse(res, 201, result, 'User created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get user by ID
     */
    async getById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.userService.getById(req.params.id);
            // Return raw data for frontend compatibility
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all users
     */
    async getAll(req, res, next) {
        try {
            const { limit, skip, sort, search, isAdmin, ...filter } = req.query;
            
            let results;
            
            if (search) {
                // Search users by name or email
                const options = {
                    limit: limit ? parseInt(limit) : undefined,
                    skip: skip ? parseInt(skip) : undefined,
                    sort: sort ? JSON.parse(sort) : { name: 1 }
                };
                results = await this.userService.searchUsers(search, options);
            } else if (isAdmin !== undefined) {
                // Filter by admin status
                if (isAdmin === 'true') {
                    results = await this.userService.getAdminUsers();
                } else {
                    results = await this.userService.getRegularUsers();
                }
            } else {
                // Get all users with filters
                const options = {
                    limit: limit ? parseInt(limit) : undefined,
                    skip: skip ? parseInt(skip) : undefined,
                    sort: sort ? JSON.parse(sort) : { name: 1 }
                };
                results = await this.userService.getAll(filter, options);
            }

            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update user by ID
     */
    async updateById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.userService.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'User updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete user by ID
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.userService.deleteById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(req, res, next) {
        try {
            this.validateParams(req, ['email']);

            const result = await this.userService.getUserByEmail(req.params.email);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get admin users
     */
    async getAdminUsers(req, res, next) {
        try {
            const results = await this.userService.getAdminUsers();
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get regular users
     */
    async getRegularUsers(req, res, next) {
        try {
            const results = await this.userService.getRegularUsers();
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search users
     */
    async searchUsers(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return this.sendError(res, 400, 'Search term is required');
            }

            const options = this.getPaginationOptions(req);
            const results = await this.userService.searchUsers(searchTerm, options);
            
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get users with bookings
     */
    async getUsersWithBookings(req, res, next) {
        try {
            const results = await this.userService.getUsersWithBookings();
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Add booking to user
     */
    async addBookingToUser(req, res, next) {
        try {
            this.validateParams(req, ['id']);
            this.validateBody(req, ['room', 'durationInMonths']);

            const result = await this.userService.addBookingToUser(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Booking added to user successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Remove booking from user
     */
    async removeBookingFromUser(req, res, next) {
        try {
            this.validateParams(req, ['id', 'bookingId']);

            const result = await this.userService.removeBookingFromUser(
                req.params.id, 
                req.params.bookingId
            );
            this.sendResponse(res, 200, result, 'Booking removed from user successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Toggle admin status
     */
    async toggleAdminStatus(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.userService.toggleAdminStatus(req.params.id);
            this.sendResponse(res, 200, result, 'Admin status toggled successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get user statistics
     */
    async getUserStatistics(req, res, next) {
        try {
            const stats = await this.userService.getUserStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get user profile (for authenticated user)
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return this.sendError(res, 401, 'User not authenticated');
            }

            const result = await this.userService.getById(userId);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update user profile (for authenticated user)
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return this.sendError(res, 401, 'User not authenticated');
            }

            // Remove sensitive fields that shouldn't be updated via profile
            const { password, isAdmin, ...updateData } = req.body;

            const result = await this.userService.updateById(userId, updateData);
            this.sendResponse(res, 200, result, 'Profile updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default UserController;
