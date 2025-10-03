/**
 * Abstract Base Repository Class
 * Provides common CRUD operations for all repositories
 */
class BaseRepository {
    constructor(model) {
        if (!model) {
            throw new Error('Model is required for repository');
        }
        this.model = model;
    }

    /**
     * Create a new document
     */
    async create(data) {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Find document by ID
     */
    async findById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw this._handleError(error, 'findById');
        }
    }

    /**
     * Find all documents with optional filter
     */
    async findAll(filter = {}, options = {}) {
        try {
            const { limit, skip, sort, populate } = options;
            let query = this.model.find(filter);

            if (limit) query = query.limit(limit);
            if (skip) query = query.skip(skip);
            if (sort) query = query.sort(sort);
            if (populate) query = query.populate(populate);

            return await query.exec();
        } catch (error) {
            throw this._handleError(error, 'findAll');
        }
    }

    /**
     * Find one document by filter
     */
    async findOne(filter) {
        try {
            return await this.model.findOne(filter);
        } catch (error) {
            throw this._handleError(error, 'findOne');
        }
    }

    /**
     * Update document by ID
     */
    async updateById(id, data, options = { new: true }) {
        try {
            return await this.model.findByIdAndUpdate(id, { $set: data }, options);
        } catch (error) {
            throw this._handleError(error, 'updateById');
        }
    }

    /**
     * Delete document by ID
     */
    async deleteById(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            throw this._handleError(error, 'deleteById');
        }
    }

    /**
     * Count documents
     */
    async count(filter = {}) {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            throw this._handleError(error, 'count');
        }
    }

    /**
     * Check if document exists
     */
    async exists(filter) {
        try {
            const count = await this.model.countDocuments(filter);
            return count > 0;
        } catch (error) {
            throw this._handleError(error, 'exists');
        }
    }

    /**
     * Handle repository errors
     */
    _handleError(error, operation) {
        const repositoryName = this.constructor.name;
        console.error(`${repositoryName}.${operation} error:`, error);
        return error;
    }
}

export default BaseRepository;
