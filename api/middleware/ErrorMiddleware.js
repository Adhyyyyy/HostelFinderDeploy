import ErrorHandler from '../utils/classes/ErrorHandler.js';
import Logger from '../utils/classes/Logger.js';

/**
 * Error Middleware Class
 * Handles error processing and responses
 */
class ErrorMiddleware {
    constructor() {
        this.logger = Logger;
    }

    /**
     * Global error handler middleware
     */
    globalErrorHandler = (err, req, res, next) => {
        let error = { ...err };
        error.message = err.message;

        // Log the error
        this.logger.logError(error, req);

        // Handle specific error types
        error = this._handleSpecificErrors(error);

        // Determine status code
        const statusCode = error.status || error.statusCode || 500;

        // Build error response
        const response = this._buildErrorResponse(error, req);

        // Send response
        res.status(statusCode).json(response);
    };

    /**
     * Handle 404 errors for undefined routes
     */
    notFoundHandler = (req, res, next) => {
        const error = ErrorHandler.createNotFoundError(`Route ${req.originalUrl} not found`);
        next(error);
    };

    /**
     * Async error wrapper
     */
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    /**
     * Handle specific error types
     */
    _handleSpecificErrors(error) {
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return ErrorHandler.createValidationError(message);
        }

        // Mongoose bad ObjectId
        if (error.name === 'CastError') {
            const message = 'Invalid ID format';
            return ErrorHandler.createValidationError(message);
        }

        // Mongoose duplicate key
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already exists`;
            return ErrorHandler.createConflictError(message);
        }

        // JWT errors
        if (error.name === 'JsonWebTokenError') {
            return ErrorHandler.createAuthError('Invalid token');
        }

        if (error.name === 'TokenExpiredError') {
            return ErrorHandler.createAuthError('Token expired');
        }

        if (error.name === 'NotBeforeError') {
            return ErrorHandler.createAuthError('Token not active yet');
        }

        // Multer errors (file upload)
        if (error.code === 'LIMIT_FILE_SIZE') {
            return ErrorHandler.createValidationError('File too large');
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return ErrorHandler.createValidationError('Too many files');
        }

        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return ErrorHandler.createValidationError('Unexpected file field');
        }

        // CORS errors
        if (error.message && error.message.includes('CORS')) {
            return ErrorHandler.createError(403, 'CORS policy violation');
        }

        // Rate limiting errors
        if (error.status === 429) {
            return ErrorHandler.createError(429, 'Too many requests');
        }

        return error;
    }

    /**
     * Build error response object
     */
    _buildErrorResponse(error, req) {
        const response = {
            success: false,
            message: error.message || 'Internal server error',
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        };

        // Add error type if available
        if (error.type) {
            response.type = error.type;
        }

        // Add field if it's a validation error
        if (error.field) {
            response.field = error.field;
        }

        // Add details if available
        if (error.details) {
            response.details = error.details;
        }

        // Add stack trace in development
        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
            
            if (error.originalError) {
                response.originalError = {
                    message: error.originalError.message,
                    stack: error.originalError.stack
                };
            }
        }

        // Add request ID if available
        if (req.requestId) {
            response.requestId = req.requestId;
        }

        return response;
    }

    /**
     * Handle unhandled promise rejections
     */
    static handleUnhandledRejection() {
        process.on('unhandledRejection', (err, promise) => {
            console.error('Unhandled Promise Rejection:', err);
            
            // Log the error
            Logger.error('Unhandled Promise Rejection', {
                error: err.message,
                stack: err.stack,
                promise: promise
            });

            // Close server gracefully
            process.exit(1);
        });
    }

    /**
     * Handle uncaught exceptions
     */
    static handleUncaughtException() {
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            
            // Log the error
            Logger.error('Uncaught Exception', {
                error: err.message,
                stack: err.stack
            });

            // Close server gracefully
            process.exit(1);
        });
    }

    /**
     * Validation error handler
     */
    validationErrorHandler = (err, req, res, next) => {
        if (err.type === 'VALIDATION_ERROR') {
            const response = {
                success: false,
                message: err.message,
                type: 'VALIDATION_ERROR',
                field: err.field,
                timestamp: new Date().toISOString()
            };

            return res.status(400).json(response);
        }

        next(err);
    };

    /**
     * Authentication error handler
     */
    authErrorHandler = (err, req, res, next) => {
        if (err.type === 'AUTH_ERROR' || err.type === 'AUTHORIZATION_ERROR') {
            // Clear invalid token cookie
            if (req.cookies && req.cookies.access_token) {
                res.clearCookie('access_token');
            }

            const response = {
                success: false,
                message: err.message,
                type: err.type,
                timestamp: new Date().toISOString()
            };

            const statusCode = err.type === 'AUTH_ERROR' ? 401 : 403;
            return res.status(statusCode).json(response);
        }

        next(err);
    };

    /**
     * Database error handler
     */
    databaseErrorHandler = (err, req, res, next) => {
        if (err.type === 'DATABASE_ERROR' || err.name === 'MongoError') {
            this.logger.error('Database error', {
                error: err.message,
                operation: err.operation,
                stack: err.stack
            });

            const response = {
                success: false,
                message: 'Database operation failed',
                type: 'DATABASE_ERROR',
                timestamp: new Date().toISOString()
            };

            return res.status(500).json(response);
        }

        next(err);
    };

    /**
     * Rate limit error handler
     */
    rateLimitErrorHandler = (err, req, res, next) => {
        if (err.status === 429) {
            const response = {
                success: false,
                message: err.message || 'Too many requests',
                type: 'RATE_LIMIT_ERROR',
                retryAfter: err.retryAfter,
                timestamp: new Date().toISOString()
            };

            return res.status(429).json(response);
        }

        next(err);
    };

    /**
     * Create error handling middleware chain
     */
    createErrorChain() {
        return [
            this.validationErrorHandler,
            this.authErrorHandler,
            this.databaseErrorHandler,
            this.rateLimitErrorHandler,
            this.globalErrorHandler
        ];
    }

    /**
     * Log error details for monitoring
     */
    logErrorForMonitoring(error, req) {
        const errorData = {
            message: error.message,
            type: error.type,
            status: error.status || error.statusCode,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        };

        // In production, you might want to send this to an external monitoring service
        // like Sentry, LogRocket, or custom monitoring solution
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error, { extra: errorData });
            console.error('Production Error:', errorData);
        }

        return errorData;
    }

    /**
     * Check if error should be reported to monitoring
     */
    shouldReportError(error) {
        // Don't report client errors (4xx) except for authentication issues
        if (error.status >= 400 && error.status < 500) {
            return error.type === 'AUTH_ERROR' || error.type === 'AUTHORIZATION_ERROR';
        }

        // Report all server errors (5xx)
        return error.status >= 500 || !error.status;
    }

    /**
     * Format error for different environments
     */
    formatErrorForEnvironment(error, req) {
        const baseError = {
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
        };

        if (process.env.NODE_ENV === 'development') {
            return {
                ...baseError,
                type: error.type,
                status: error.status,
                stack: error.stack,
                request: {
                    method: req.method,
                    url: req.originalUrl,
                    headers: req.headers,
                    body: req.body,
                    params: req.params,
                    query: req.query
                }
            };
        }

        if (process.env.NODE_ENV === 'production') {
            return {
                ...baseError,
                type: error.type,
                ...(error.field && { field: error.field }),
                ...(req.requestId && { requestId: req.requestId })
            };
        }

        return baseError;
    }
}

export default ErrorMiddleware;
