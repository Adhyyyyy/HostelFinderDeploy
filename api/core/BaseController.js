/**
 * Abstract Base Controller Class
 * Provides common HTTP handling operations for all controllers
 */
class BaseController {
    constructor(service) {
        if (!service) {
            throw new Error('Service is required for controller');
        }
        this.service = service;
    }

    /**
     * Create new entity
     */
    async create(req, res, next) {
        try {
            const result = await this.service.create(req.body);
            this.sendResponse(res, 201, result, 'Created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get entity by ID
     */
    async getById(req, res, next) {
        try {
            const result = await this.service.getById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all entities
     */
    async getAll(req, res, next) {
        try {
            const { limit, skip, sort, ...filter } = req.query;
            const options = {
                limit: limit ? parseInt(limit) : undefined,
                skip: skip ? parseInt(skip) : undefined,
                sort: sort ? JSON.parse(sort) : undefined
            };
            
            const results = await this.service.getAll(filter, options);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update entity by ID
     */
    async updateById(req, res, next) {
        try {
            const result = await this.service.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete entity by ID
     */
    async deleteById(req, res, next) {
        try {
            const result = await this.service.deleteById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Send standardized response
     */
    sendResponse(res, statusCode, data, message = null) {
        const response = {
            success: statusCode < 400,
            ...(message && { message }),
            ...(data && { data })
        };
        res.status(statusCode).json(response);
    }

    /**
     * Send error response
     */
    sendError(res, statusCode, message, error = null) {
        const response = {
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && error && { error: error.stack })
        };
        res.status(statusCode).json(response);
    }

    /**
     * Handle controller errors
     */
    handleError(error, next) {
        console.error(`${this.constructor.name} error:`, error);
        
        // Pass to Express error handler
        if (next) {
            next(error);
        }
    }

    /**
     * Validate request parameters
     */
    validateParams(req, requiredParams = []) {
        const missing = requiredParams.filter(param => 
            req.params[param] === undefined || req.params[param] === null || req.params[param] === ''
        );
        if (missing.length > 0) {
            throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
    }

    /**
     * Validate request body
     */
    validateBody(req, requiredFields = []) {
        const missing = requiredFields.filter(field => 
            req.body[field] === undefined || req.body[field] === null
        );
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    /**
     * Extract pagination options from query
     */
    getPaginationOptions(req) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        return { page, limit, skip };
    }
}

export default BaseController;
