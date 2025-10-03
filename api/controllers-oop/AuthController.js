import BaseController from '../core/BaseController.js';
import AuthService from '../services/AuthService.js';

/**
 * Authentication Controller
 * Handles authentication HTTP requests
 */
class AuthController extends BaseController {
    constructor() {
        const authService = new AuthService();
        super(authService);
        this.authService = authService;
    }

    /**
     * Register a new user
     */
    async register(req, res, next) {
        try {
            this.validateBody(req, ['name', 'email', 'password', 'phone']);

            const result = await this.authService.register(req.body);
            this.sendResponse(res, 201, result.user, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            this.validateBody(req, ['email', 'password']);

            const { email, password } = req.body;
            const result = await this.authService.login(email, password);

            // Set HTTP-only cookie
            res.cookie("access_token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            // Send response without token in body (same format as old API)
            const response = {
                details: result.user,
                isAdmin: result.isAdmin
            };

            res.status(200).json(response);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Logout user
     */
    async logout(req, res, next) {
        try {
            // Clear the access token cookie
            res.clearCookie("access_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            this.sendResponse(res, 200, null, 'Logged out successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Verify token
     */
    async verifyToken(req, res, next) {
        try {
            const token = req.cookies.access_token;
            
            if (!token) {
                return this.sendError(res, 401, 'No token provided');
            }

            const result = await this.authService.verifyToken(token);
            this.sendResponse(res, 200, result.user, 'Token is valid');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Change password
     */
    async changePassword(req, res, next) {
        try {
            this.validateBody(req, ['currentPassword', 'newPassword']);

            const userId = req.user?.id;
            if (!userId) {
                return this.sendError(res, 401, 'User not authenticated');
            }

            const { currentPassword, newPassword } = req.body;
            const result = await this.authService.changePassword(userId, currentPassword, newPassword);

            this.sendResponse(res, 200, null, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Reset password (admin only)
     */
    async resetPassword(req, res, next) {
        try {
            this.validateParams(req, ['userId']);
            this.validateBody(req, ['newPassword']);

            const { userId } = req.params;
            const { newPassword } = req.body;

            const result = await this.authService.resetPassword(userId, newPassword);
            this.sendResponse(res, 200, null, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return this.sendError(res, 401, 'User not authenticated');
            }

            const token = req.cookies.access_token;
            const result = await this.authService.verifyToken(token);
            
            this.sendResponse(res, 200, result.user, 'Profile retrieved successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Refresh token
     */
    async refreshToken(req, res, next) {
        try {
            const token = req.cookies.access_token;
            
            if (!token) {
                return this.sendError(res, 401, 'No token provided');
            }

            // Verify current token
            const result = await this.authService.verifyToken(token);
            
            // Generate new token
            const newResult = await this.authService.login(result.user.email, null, true); // Skip password check for refresh
            
            // Set new cookie
            res.cookie("access_token", newResult.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            this.sendResponse(res, 200, result.user, 'Token refreshed successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default AuthController;
