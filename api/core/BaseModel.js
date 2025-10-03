/**
 * Abstract Base Model Class
 * Provides common functionality for all domain models
 */
class BaseModel {
    constructor(data = {}) {
        this.id = data._id || data.id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this._data = data;
    }

    /**
     * Get the raw data object
     */
    toObject() {
        return { ...this._data };
    }

    /**
     * Get JSON representation
     */
    toJSON() {
        return this.toObject();
    }

    /**
     * Update model data
     */
    update(data) {
        this._data = { ...this._data, ...data };
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Validate model data - to be implemented by subclasses
     */
    validate() {
        throw new Error('validate() method must be implemented by subclass');
    }

    /**
     * Get model name - to be implemented by subclasses
     */
    static getModelName() {
        throw new Error('getModelName() method must be implemented by subclass');
    }
}

export default BaseModel;
