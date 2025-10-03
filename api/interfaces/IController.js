/**
 * Controller Interface
 * Defines the contract that all controllers must implement
 */
class IController {
    /**
     * Create new entity
     */
    async create(req, res, next) {
        throw new Error('create method must be implemented');
    }

    /**
     * Get entity by ID
     */
    async getById(req, res, next) {
        throw new Error('getById method must be implemented');
    }

    /**
     * Get all entities
     */
    async getAll(req, res, next) {
        throw new Error('getAll method must be implemented');
    }

    /**
     * Update entity by ID
     */
    async updateById(req, res, next) {
        throw new Error('updateById method must be implemented');
    }

    /**
     * Delete entity by ID
     */
    async deleteById(req, res, next) {
        throw new Error('deleteById method must be implemented');
    }
}

export default IController;
