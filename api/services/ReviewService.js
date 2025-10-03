import BaseService from '../core/BaseService.js';
import ReviewRepository from '../repositories/ReviewRepository.js';

/**
 * Review Service
 * Handles review business logic
 */
class ReviewService extends BaseService {
    constructor() {
        const reviewRepository = new ReviewRepository();
        super(reviewRepository);
        this.reviewRepository = reviewRepository;
    }

    /**
     * Create a new review
     */
    async create(reviewData) {
        try {
            await this._validateCreate(reviewData);
            return await super.create(reviewData);
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Get reviews by entity ID
     */
    async getReviewsByEntityId(entityId) {
        try {
            this._validateId(entityId);
            const reviews = await this.reviewRepository.findByEntityId(entityId);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getReviewsByEntityId');
        }
    }

    /**
     * Get reviews by entity type
     */
    async getReviewsByEntityType(entityType) {
        try {
            this._validateEntityType(entityType);
            const reviews = await this.reviewRepository.findByEntityType(entityType);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getReviewsByEntityType');
        }
    }

    /**
     * Get reviews by rating
     */
    async getReviewsByRating(rating) {
        try {
            this._validateRating(rating);
            const reviews = await this.reviewRepository.findByRating(rating);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getReviewsByRating');
        }
    }

    /**
     * Get reviews by rating range
     */
    async getReviewsByRatingRange(minRating, maxRating) {
        try {
            this._validateRating(minRating);
            this._validateRating(maxRating);
            
            if (minRating > maxRating) {
                throw new Error('Minimum rating cannot be greater than maximum rating');
            }

            const reviews = await this.reviewRepository.findByRatingRange(minRating, maxRating);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getReviewsByRatingRange');
        }
    }

    /**
     * Get reviews by user name
     */
    async getReviewsByUserName(userName) {
        try {
            if (!userName || userName.trim().length === 0) {
                throw new Error('User name is required');
            }

            const reviews = await this.reviewRepository.findByUserName(userName);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getReviewsByUserName');
        }
    }

    /**
     * Get average rating for entity
     */
    async getAverageRating(entityId) {
        try {
            this._validateId(entityId);
            return await this.reviewRepository.getAverageRating(entityId);
        } catch (error) {
            throw this._handleError(error, 'getAverageRating');
        }
    }

    /**
     * Get rating distribution for entity
     */
    async getRatingDistribution(entityId) {
        try {
            this._validateId(entityId);
            return await this.reviewRepository.getRatingDistribution(entityId);
        } catch (error) {
            throw this._handleError(error, 'getRatingDistribution');
        }
    }

    /**
     * Get recent reviews
     */
    async getRecentReviews(limit = 10) {
        try {
            if (limit <= 0 || limit > 100) {
                throw new Error('Limit must be between 1 and 100');
            }

            const reviews = await this.reviewRepository.getRecentReviews(limit);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getRecentReviews');
        }
    }

    /**
     * Get top rated entities by type
     */
    async getTopRatedEntities(entityType, limit = 10) {
        try {
            this._validateEntityType(entityType);
            
            if (limit <= 0 || limit > 50) {
                throw new Error('Limit must be between 1 and 50');
            }

            return await this.reviewRepository.getTopRatedEntities(entityType, limit);
        } catch (error) {
            throw this._handleError(error, 'getTopRatedEntities');
        }
    }

    /**
     * Search reviews by content
     */
    async searchReviews(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new Error('Search term is required');
            }

            if (searchTerm.trim().length < 2) {
                throw new Error('Search term must be at least 2 characters long');
            }

            const reviews = await this.reviewRepository.searchReviews(searchTerm);
            return reviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'searchReviews');
        }
    }

    /**
     * Get review statistics
     */
    async getReviewStatistics() {
        try {
            return await this.reviewRepository.getReviewStatistics();
        } catch (error) {
            throw this._handleError(error, 'getReviewStatistics');
        }
    }

    /**
     * Get entity review summary
     */
    async getEntityReviewSummary(entityId) {
        try {
            this._validateId(entityId);

            const [averageRating, ratingDistribution, reviews] = await Promise.all([
                this.reviewRepository.getAverageRating(entityId),
                this.reviewRepository.getRatingDistribution(entityId),
                this.reviewRepository.findByEntityId(entityId)
            ]);

            const recentReviews = reviews.slice(0, 5).map(review => this._formatResponse(review));

            return {
                averageRating: averageRating.averageRating,
                totalReviews: averageRating.totalReviews,
                ratingDistribution,
                recentReviews
            };
        } catch (error) {
            throw this._handleError(error, 'getEntityReviewSummary');
        }
    }

    /**
     * Get high-rated reviews for entity
     */
    async getHighRatedReviews(entityId, minRating = 4) {
        try {
            this._validateId(entityId);
            this._validateRating(minRating);

            const allReviews = await this.reviewRepository.findByEntityId(entityId);
            const highRatedReviews = allReviews.filter(review => review.rating >= minRating);
            
            return highRatedReviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getHighRatedReviews');
        }
    }

    /**
     * Get low-rated reviews for entity
     */
    async getLowRatedReviews(entityId, maxRating = 2) {
        try {
            this._validateId(entityId);
            this._validateRating(maxRating);

            const allReviews = await this.reviewRepository.findByEntityId(entityId);
            const lowRatedReviews = allReviews.filter(review => review.rating <= maxRating);
            
            return lowRatedReviews.map(review => this._formatResponse(review));
        } catch (error) {
            throw this._handleError(error, 'getLowRatedReviews');
        }
    }

    /**
     * Validate review creation data
     */
    async _validateCreate(data) {
        const { entityId, entityType, entityName, rating, review, userName } = data;

        if (!entityId) {
            throw new Error('Entity ID is required');
        }

        this._validateEntityType(entityType);

        if (!entityName || entityName.trim().length === 0) {
            throw new Error('Entity name is required');
        }

        this._validateRating(rating);

        if (!review || review.trim().length === 0) {
            throw new Error('Review content is required');
        }

        if (review.trim().length < 1) {
            throw new Error('Review must be at least 1 character long');
        }

        if (review.trim().length > 500) {
            throw new Error('Review cannot exceed 500 characters');
        }

        if (!userName || userName.trim().length === 0) {
            throw new Error('User name is required');
        }

        if (userName.trim().length < 2) {
            throw new Error('User name must be at least 2 characters long');
        }
    }

    /**
     * Validate review update data
     */
    async _validateUpdate(data) {
        if (data.entityType) {
            this._validateEntityType(data.entityType);
        }

        if (data.rating !== undefined) {
            this._validateRating(data.rating);
        }

        if (data.review !== undefined) {
            if (data.review.trim().length === 0) {
                throw new Error('Review content cannot be empty');
            }

            if (data.review.trim().length > 500) {
                throw new Error('Review cannot exceed 500 characters');
            }
        }

        if (data.userName && data.userName.trim().length < 2) {
            throw new Error('User name must be at least 2 characters long');
        }

        if (data.entityName && data.entityName.trim().length === 0) {
            throw new Error('Entity name cannot be empty');
        }
    }

    /**
     * Validate entity type
     */
    _validateEntityType(entityType) {
        const validEntityTypes = ['Hostel', 'Restaurant'];
        if (!validEntityTypes.includes(entityType)) {
            throw new Error('Entity type must be either Hostel or Restaurant');
        }
    }

    /**
     * Validate rating
     */
    _validateRating(rating) {
        if (typeof rating !== 'number') {
            throw new Error('Rating must be a number');
        }

        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        if (!Number.isInteger(rating)) {
            throw new Error('Rating must be a whole number');
        }
    }
}

export default ReviewService;
