/**
 * Error Handler Class
 * Centralized error handling and creation
 */
class ErrorHandler {
    /**
     * Create a custom error
     */
    static createError(status, message, details = null) {
        const error = new Error(message);
        error.status = status;
        error.statusCode = status;
        error.details = details;
        error.timestamp = new Date().toISOString();
        return error;
    }

    /**
     * Create validation error
     */
    static createValidationError(message, field = null) {
        const error = this.createError(400, message);
        error.type = 'VALIDATION_ERROR';
        error.field = field;
        return error;
    }

    /**
     * Create authentication error
     */
    static createAuthError(message = 'Authentication required') {
        const error = this.createError(401, message);
        error.type = 'AUTH_ERROR';
        return error;
    }

    /**
     * Create authorization error
     */
    static createAuthorizationError(message = 'Access denied') {
        const error = this.createError(403, message);
        error.type = 'AUTHORIZATION_ERROR';
        return error;
    }

    /**
     * Create not found error
     */
    static createNotFoundError(resource = 'Resource') {
        const error = this.createError(404, `${resource} not found`);
        error.type = 'NOT_FOUND_ERROR';
        error.resource = resource;
        return error;
    }

    /**
     * Create conflict error
     */
    static createConflictError(message) {
        const error = this.createError(409, message);
        error.type = 'CONFLICT_ERROR';
        return error;
    }

    /**
     * Create internal server error
     */
    static createInternalError(message = 'Internal server error', originalError = null) {
        const error = this.createError(500, message);
        error.type = 'INTERNAL_ERROR';
        error.originalError = originalError;
        return error;
    }

    /**
     * Create database error
     */
    static createDatabaseError(message, operation = null) {
        const error = this.createError(500, message);
        error.type = 'DATABASE_ERROR';
        error.operation = operation;
        return error;
    }

    /**
     * Handle async errors
     */
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    /**
     * Global error handler middleware
     */
    static globalHandler(err, req, res, next) {
        let error = { ...err };
        error.message = err.message;

        // Log error
        console.error('Error:', {
            message: error.message,
            status: error.status,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = 'Invalid ID format';
            error = this.createValidationError(message);
        }

        // Mongoose duplicate key
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const message = `${field} already exists`;
            error = this.createConflictError(message);
        }

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = this.createValidationError(message);
        }

        // JWT errors
        if (err.name === 'JsonWebTokenError') {
            error = this.createAuthError('Invalid token');
        }

        if (err.name === 'TokenExpiredError') {
            error = this.createAuthError('Token expired');
        }

        // Default to 500 server error
        const statusCode = error.status || error.statusCode || 500;
        const message = error.message || 'Internal server error';

        const response = {
            success: false,
            message,
            ...(error.type && { type: error.type }),
            ...(error.field && { field: error.field }),
            ...(error.details && { details: error.details }),
            ...(process.env.NODE_ENV === 'development' && { 
                stack: error.stack,
                originalError: error.originalError 
            })
        };

        res.status(statusCode).json(response);
    }

    /**
     * Handle 404 errors
     */
    static notFoundHandler(req, res, next) {
        const error = this.createNotFoundError(`Route ${req.originalUrl}`);
        next(error);
    }

    /**
     * Validate error status code
     */
    static isValidStatusCode(status) {
        return Number.isInteger(status) && status >= 100 && status < 600;
    }

    /**
     * Get error type from status code
     */
    static getErrorType(status) {
        if (status >= 400 && status < 500) {
            return 'CLIENT_ERROR';
        } else if (status >= 500) {
            return 'SERVER_ERROR';
        }
        return 'UNKNOWN_ERROR';
    }

    /**
     * Format error for logging
     */
    static formatErrorForLogging(error, req = null) {
        const logData = {
            message: error.message,
            status: error.status || error.statusCode,
            type: error.type,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };

        if (req) {
            logData.request = {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
                params: req.params,
                query: req.query,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            };
        }

        return logData;
    }

    /**
     * Check if error is operational (expected) or programming error
     */
    static isOperationalError(error) {
        const operationalTypes = [
            'VALIDATION_ERROR',
            'AUTH_ERROR',
            'AUTHORIZATION_ERROR',
            'NOT_FOUND_ERROR',
            'CONFLICT_ERROR'
        ];

        return operationalTypes.includes(error.type) || 
               (error.status && error.status >= 400 && error.status < 500);
    }
}

export default ErrorHandler;
