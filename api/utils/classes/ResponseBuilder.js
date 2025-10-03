/**
 * Response Builder Class
 * Standardizes API response format
 */
class ResponseBuilder {
    constructor() {
        this.response = {
            success: true,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create a new response builder instance
     */
    static create() {
        return new ResponseBuilder();
    }

    /**
     * Set success status
     */
    setSuccess(success = true) {
        this.response.success = success;
        return this;
    }

    /**
     * Set response message
     */
    setMessage(message) {
        this.response.message = message;
        return this;
    }

    /**
     * Set response data
     */
    setData(data) {
        this.response.data = data;
        return this;
    }

    /**
     * Set error details
     */
    setError(error, includeStack = false) {
        this.response.success = false;
        this.response.error = {
            message: error.message,
            type: error.type || 'UNKNOWN_ERROR',
            status: error.status || error.statusCode || 500
        };

        if (error.field) {
            this.response.error.field = error.field;
        }

        if (error.details) {
            this.response.error.details = error.details;
        }

        if (includeStack && error.stack) {
            this.response.error.stack = error.stack;
        }

        return this;
    }

    /**
     * Set pagination metadata
     */
    setPagination(pagination) {
        this.response.pagination = {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasNext: pagination.page < Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasPrev: pagination.page > 1
        };
        return this;
    }

    /**
     * Set metadata
     */
    setMetadata(metadata) {
        this.response.metadata = metadata;
        return this;
    }

    /**
     * Add custom field
     */
    addField(key, value) {
        this.response[key] = value;
        return this;
    }

    /**
     * Build and return the response
     */
    build() {
        return { ...this.response };
    }

    /**
     * Send response using Express res object
     */
    send(res, statusCode = 200) {
        return res.status(statusCode).json(this.build());
    }

    // Static helper methods for common responses

    /**
     * Success response with data
     */
    static success(data = null, message = null, metadata = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(true);

        if (message) builder.setMessage(message);
        if (data) builder.setData(data);
        if (metadata) builder.setMetadata(metadata);

        return builder;
    }

    /**
     * Error response
     */
    static error(error, includeStack = false) {
        return ResponseBuilder.create()
            .setError(error, includeStack);
    }

    /**
     * Validation error response
     */
    static validationError(message, field = null) {
        const error = {
            message,
            type: 'VALIDATION_ERROR',
            status: 400,
            field
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Not found response
     */
    static notFound(resource = 'Resource') {
        const error = {
            message: `${resource} not found`,
            type: 'NOT_FOUND_ERROR',
            status: 404
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Unauthorized response
     */
    static unauthorized(message = 'Authentication required') {
        const error = {
            message,
            type: 'AUTH_ERROR',
            status: 401
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Forbidden response
     */
    static forbidden(message = 'Access denied') {
        const error = {
            message,
            type: 'AUTHORIZATION_ERROR',
            status: 403
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Conflict response
     */
    static conflict(message) {
        const error = {
            message,
            type: 'CONFLICT_ERROR',
            status: 409
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Internal server error response
     */
    static internalError(message = 'Internal server error') {
        const error = {
            message,
            type: 'INTERNAL_ERROR',
            status: 500
        };

        return ResponseBuilder.create()
            .setError(error);
    }

    /**
     * Created response
     */
    static created(data, message = 'Created successfully') {
        return ResponseBuilder.create()
            .setSuccess(true)
            .setMessage(message)
            .setData(data);
    }

    /**
     * Updated response
     */
    static updated(data, message = 'Updated successfully') {
        return ResponseBuilder.create()
            .setSuccess(true)
            .setMessage(message)
            .setData(data);
    }

    /**
     * Deleted response
     */
    static deleted(message = 'Deleted successfully') {
        return ResponseBuilder.create()
            .setSuccess(true)
            .setMessage(message);
    }

    /**
     * Paginated response
     */
    static paginated(data, pagination, message = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(true)
            .setData(data)
            .setPagination(pagination);

        if (message) builder.setMessage(message);

        return builder;
    }

    /**
     * List response with count
     */
    static list(data, total = null, message = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(true)
            .setData(data);

        if (total !== null) {
            builder.addField('total', total);
        }

        if (message) builder.setMessage(message);

        return builder;
    }

    /**
     * Statistics response
     */
    static statistics(stats, message = 'Statistics retrieved successfully') {
        return ResponseBuilder.create()
            .setSuccess(true)
            .setMessage(message)
            .setData(stats);
    }

    /**
     * Health check response
     */
    static health(status = 'healthy', details = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(status === 'healthy')
            .addField('status', status);

        if (details) {
            builder.setData(details);
        }

        return builder;
    }

    /**
     * API version response
     */
    static version(version, details = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(true)
            .addField('version', version);

        if (details) {
            builder.setData(details);
        }

        return builder;
    }

    /**
     * Bulk operation response
     */
    static bulkOperation(results, errors = [], message = 'Bulk operation completed') {
        const successful = results.filter(r => r.success).length;
        const failed = errors.length;
        const total = successful + failed;

        return ResponseBuilder.create()
            .setSuccess(failed === 0)
            .setMessage(message)
            .setData({
                total,
                successful,
                failed,
                results,
                errors
            });
    }

    /**
     * Search results response
     */
    static searchResults(results, query, total = null, message = null) {
        const builder = ResponseBuilder.create()
            .setSuccess(true)
            .setData(results)
            .addField('query', query);

        if (total !== null) {
            builder.addField('total', total);
        }

        if (message) builder.setMessage(message);

        return builder;
    }

    /**
     * File upload response
     */
    static fileUpload(fileInfo, message = 'File uploaded successfully') {
        return ResponseBuilder.create()
            .setSuccess(true)
            .setMessage(message)
            .setData(fileInfo);
    }

    /**
     * Rate limit response
     */
    static rateLimited(retryAfter = null) {
        const error = {
            message: 'Rate limit exceeded',
            type: 'RATE_LIMIT_ERROR',
            status: 429
        };

        const builder = ResponseBuilder.create()
            .setError(error);

        if (retryAfter) {
            builder.addField('retryAfter', retryAfter);
        }

        return builder;
    }

    /**
     * Maintenance mode response
     */
    static maintenance(message = 'Service temporarily unavailable for maintenance') {
        const error = {
            message,
            type: 'MAINTENANCE_ERROR',
            status: 503
        };

        return ResponseBuilder.create()
            .setError(error);
    }
}

export default ResponseBuilder;
