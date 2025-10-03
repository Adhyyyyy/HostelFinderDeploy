import TokenManager from '../utils/classes/TokenManager.js';
import ErrorHandler from '../utils/classes/ErrorHandler.js';
import UserService from '../services/UserService.js';

/**
 * Authentication Middleware Class
 * Handles authentication and authorization
 */
class AuthMiddleware {
    constructor() {
        this.tokenManager = new TokenManager();
        this.userService = new UserService();
    }

    /**
     * Verify JWT token from cookie or header
     */
    verifyToken = async (req, res, next) => {
        try {
            let token;

            // Try to get token from cookie first
            if (req.cookies && req.cookies.access_token) {
                token = req.cookies.access_token;
            }
            // Fallback to Authorization header
            else if (req.headers.authorization) {
                token = this.tokenManager.extractTokenFromHeader(req.headers.authorization);
            }

            if (!token) {
                throw ErrorHandler.createAuthError('Authentication token is required');
            }

            // Check if token is blacklisted
            if (this.tokenManager.isTokenBlacklisted(token)) {
                throw ErrorHandler.createAuthError('Token has been revoked');
            }

            // Verify token
            const decoded = this.tokenManager.verifyToken(token);
            
            // Validate token payload
            this.tokenManager.validateTokenPayload(decoded);

            // Attach user info to request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                isAdmin: decoded.isAdmin || false
            };

            next();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify user authorization (user can access their own data or admin can access any)
     */
    verifyUser = async (req, res, next) => {
        try {
            // First verify token
            await new Promise((resolve, reject) => {
                this.verifyToken(req, res, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            const userId = req.params.id || req.params.userId;
            
            // Allow if user is accessing their own data or if user is admin
            if (req.user.id === userId || req.user.isAdmin) {
                next();
            } else {
                throw ErrorHandler.createAuthorizationError('You can only access your own data');
            }
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify admin privileges
     */
    verifyAdmin = async (req, res, next) => {
        try {
            // First verify token
            await new Promise((resolve, reject) => {
                this.verifyToken(req, res, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            if (!req.user.isAdmin) {
                throw ErrorHandler.createAuthorizationError('Admin privileges required');
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Optional authentication (doesn't fail if no token)
     */
    optionalAuth = async (req, res, next) => {
        try {
            let token;

            // Try to get token from cookie or header
            if (req.cookies && req.cookies.access_token) {
                token = req.cookies.access_token;
            } else if (req.headers.authorization) {
                try {
                    token = this.tokenManager.extractTokenFromHeader(req.headers.authorization);
                } catch (error) {
                    // Invalid header format, continue without auth
                    return next();
                }
            }

            if (!token) {
                return next();
            }

            // Verify token if present
            const decoded = this.tokenManager.verifyToken(token);
            
            // Attach user info to request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                isAdmin: decoded.isAdmin || false
            };

            next();
        } catch (error) {
            // Don't fail for optional auth, just continue without user
            next();
        }
    };

    /**
     * Check if user exists in database
     */
    checkUserExists = async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                throw ErrorHandler.createAuthError('User information not found in token');
            }

            // Check if user still exists in database
            const user = await this.userService.getById(req.user.id);
            
            if (!user) {
                throw ErrorHandler.createAuthError('User account no longer exists');
            }

            // Update user info with latest data
            req.user = {
                id: user.id || user._id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin || false,
                phone: user.phone
            };

            next();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Rate limiting for authentication attempts
     */
    authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
        const attempts = new Map();

        return (req, res, next) => {
            const key = req.ip + ':' + (req.body.email || 'unknown');
            const now = Date.now();
            
            // Clean old attempts
            for (const [attemptKey, data] of attempts.entries()) {
                if (now - data.firstAttempt > windowMs) {
                    attempts.delete(attemptKey);
                }
            }

            const userAttempts = attempts.get(key);
            
            if (!userAttempts) {
                attempts.set(key, { count: 1, firstAttempt: now });
                return next();
            }

            if (userAttempts.count >= maxAttempts) {
                const timeLeft = Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60);
                throw ErrorHandler.createError(
                    429, 
                    `Too many authentication attempts. Try again in ${timeLeft} minutes.`
                );
            }

            userAttempts.count++;
            next();
        };
    };

    /**
     * Validate API key (for external API access)
     */
    validateApiKey = (req, res, next) => {
        try {
            const apiKey = req.headers['x-api-key'];
            
            if (!apiKey) {
                throw ErrorHandler.createAuthError('API key is required');
            }

            // In production, validate against database
            const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
            
            if (!validApiKeys.includes(apiKey)) {
                throw ErrorHandler.createAuthError('Invalid API key');
            }

            // Set API client info
            req.apiClient = {
                key: apiKey,
                type: 'external'
            };

            next();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Check permissions for specific resources
     */
    checkPermission = (resource, action = 'read') => {
        return async (req, res, next) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    throw ErrorHandler.createAuthError('Authentication required');
                }

                // Admin has all permissions
                if (req.user.isAdmin) {
                    return next();
                }

                // Define permission rules
                const permissions = {
                    user: {
                        read: (userId) => req.user.id === userId,
                        update: (userId) => req.user.id === userId,
                        delete: (userId) => req.user.id === userId
                    },
                    booking: {
                        create: () => true, // Any authenticated user can create bookings
                        read: (bookingUserId) => req.user.id === bookingUserId,
                        update: () => false, // Only admin can update bookings
                        delete: () => false // Only admin can delete bookings
                    },
                    review: {
                        create: () => true, // Any authenticated user can create reviews
                        read: () => true, // Anyone can read reviews
                        update: (reviewUserId) => req.user.id === reviewUserId,
                        delete: (reviewUserId) => req.user.id === reviewUserId
                    }
                };

                const resourcePermissions = permissions[resource];
                
                if (!resourcePermissions || !resourcePermissions[action]) {
                    throw ErrorHandler.createAuthorizationError('Permission not defined');
                }

                // Get resource identifier from params
                const resourceId = req.params.id || req.params.userId || req.user.id;
                
                // Check permission
                const hasPermission = resourcePermissions[action](resourceId);
                
                if (!hasPermission) {
                    throw ErrorHandler.createAuthorizationError(`Insufficient permissions for ${action} on ${resource}`);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    };

    /**
     * Middleware to refresh token if it's about to expire
     */
    refreshTokenIfNeeded = async (req, res, next) => {
        try {
            if (!req.user) {
                return next();
            }

            const token = req.cookies.access_token;
            if (!token) {
                return next();
            }

            const timeUntilExpiration = this.tokenManager.getTimeUntilExpiration(token);
            
            // Refresh if token expires in less than 30 minutes
            if (timeUntilExpiration < 30 * 60) {
                const newToken = this.tokenManager.generateAccessToken({
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    isAdmin: req.user.isAdmin
                });

                // Set new cookie
                res.cookie('access_token', newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });
            }

            next();
        } catch (error) {
            // Don't fail the request if token refresh fails
            next();
        }
    };
}

export default AuthMiddleware;
