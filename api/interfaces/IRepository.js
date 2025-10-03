/**
 * Repository Interface
 * Defines the contract that all repositories must implement
 */
class IRepository {
    /**
     * Create a new document
     */
    async create(data) {
        throw new Error('create method must be implemented');
    }

    /**
     * Find document by ID
     */
    async findById(id) {
        throw new Error('findById method must be implemented');
    }

    /**
     * Find all documents with optional filter
     */
    async findAll(filter = {}, options = {}) {
        throw new Error('findAll method must be implemented');
    }

    /**
     * Find one document by filter
     */
    async findOne(filter) {
        throw new Error('findOne method must be implemented');
    }

    /**
     * Update document by ID
     */
    async updateById(id, data, options = {}) {
        throw new Error('updateById method must be implemented');
    }

    /**
     * Delete document by ID
     */
    async deleteById(id) {
        throw new Error('deleteById method must be implemented');
    }

    /**
     * Count documents
     */
    async count(filter = {}) {
        throw new Error('count method must be implemented');
    }

    /**
     * Check if document exists
     */
    async exists(filter) {
        throw new Error('exists method must be implemented');
    }
}

export default IRepository;
