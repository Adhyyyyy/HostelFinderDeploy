/**
 * Service Interface
 * Defines the contract that all services must implement
 */
class IService {
    /**
     * Create a new entity
     */
    async create(data) {
        throw new Error('create method must be implemented');
    }

    /**
     * Get entity by ID
     */
    async getById(id) {
        throw new Error('getById method must be implemented');
    }

    /**
     * Get all entities with optional filtering
     */
    async getAll(filter = {}, options = {}) {
        throw new Error('getAll method must be implemented');
    }

    /**
     * Update entity by ID
     */
    async updateById(id, data) {
        throw new Error('updateById method must be implemented');
    }

    /**
     * Delete entity by ID
     */
    async deleteById(id) {
        throw new Error('deleteById method must be implemented');
    }

    /**
     * Check if entity exists
     */
    async exists(filter) {
        throw new Error('exists method must be implemented');
    }

    /**
     * Get count of entities
     */
    async getCount(filter = {}) {
        throw new Error('getCount method must be implemented');
    }
}

export default IService;
