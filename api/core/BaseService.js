import mongoose from 'mongoose';

/**
 * Abstract Base Service Class
 * Provides common business logic operations for all services
 */
class BaseService {
    constructor(repository) {
        if (!repository) {
            throw new Error('Repository is required for service');
        }
        this.repository = repository;
    }

    /**
     * Create a new entity
     */
    async create(data) {
        try {
            await this._validateCreate(data);
            const result = await this.repository.create(data);
            return this._formatResponse(result);
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Get entity by ID
     */
    async getById(id) {
        try {
            this._validateId(id);
            const result = await this.repository.findById(id);
            if (!result) {
                throw new Error(`${this.constructor.name.replace('Service', '')} not found`);
            }
            return this._formatResponse(result);
        } catch (error) {
            throw this._handleError(error, 'getById');
        }
    }

    /**
     * Get all entities with optional filtering
     */
    async getAll(filter = {}, options = {}) {
        try {
            const results = await this.repository.findAll(filter, options);
            return results.map(result => this._formatResponse(result));
        } catch (error) {
            throw this._handleError(error, 'getAll');
        }
    }

    /**
     * Update entity by ID
     */
    async updateById(id, data) {
        try {
            this._validateId(id);
            await this._validateUpdate(data);
            const result = await this.repository.updateById(id, data);
            if (!result) {
                throw new Error(`${this.constructor.name.replace('Service', '')} not found`);
            }
            return this._formatResponse(result);
        } catch (error) {
            throw this._handleError(error, 'updateById');
        }
    }

    /**
     * Delete entity by ID
     */
    async deleteById(id) {
        try {
            this._validateId(id);
            const result = await this.repository.deleteById(id);
            if (!result) {
                throw new Error(`${this.constructor.name.replace('Service', '')} not found`);
            }
            return { success: true, message: 'Deleted successfully' };
        } catch (error) {
            throw this._handleError(error, 'deleteById');
        }
    }

    /**
     * Check if entity exists
     */
    async exists(filter) {
        try {
            return await this.repository.exists(filter);
        } catch (error) {
            throw this._handleError(error, 'exists');
        }
    }

    /**
     * Get count of entities
     */
    async getCount(filter = {}) {
        try {
            return await this.repository.count(filter);
        } catch (error) {
            throw this._handleError(error, 'getCount');
        }
    }

    /**
     * Validate ID format
     */
    _validateId(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Valid ID is required');
        }
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
    }

    /**
     * Validate data for creation - to be implemented by subclasses
     */
    async _validateCreate(data) {
        // Override in subclasses for specific validation
        return true;
    }

    /**
     * Validate data for update - to be implemented by subclasses
     */
    async _validateUpdate(data) {
        // Override in subclasses for specific validation
        return true;
    }

    /**
     * Format response data - can be overridden by subclasses
     */
    _formatResponse(data) {
        return data;
    }

    /**
     * Handle service errors
     */
    _handleError(error, operation) {
        const serviceName = this.constructor.name;
        console.error(`${serviceName}.${operation} error:`, error);
        return error;
    }
}

export default BaseService;
