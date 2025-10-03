import BaseRepository from '../core/BaseRepository.js';
import Review from '../models/Review.js';

/**
 * Review Repository
 * Handles all database operations for Review entity
 */
class ReviewRepository extends BaseRepository {
    constructor() {
        super(Review);
    }

    /**
     * Find reviews by entity ID
     */
    async findByEntityId(entityId) {
        try {
            return await this.findAll({ entityId }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByEntityId');
        }
    }

    /**
     * Find reviews by entity type
     */
    async findByEntityType(entityType) {
        try {
            return await this.findAll({ entityType }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByEntityType');
        }
    }

    /**
     * Find reviews by rating
     */
    async findByRating(rating) {
        try {
            return await this.findAll({ rating }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByRating');
        }
    }

    /**
     * Find reviews by rating range
     */
    async findByRatingRange(minRating, maxRating) {
        try {
            return await this.findAll({
                rating: { $gte: minRating, $lte: maxRating }
            }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByRatingRange');
        }
    }

    /**
     * Find reviews by user name
     */
    async findByUserName(userName) {
        try {
            const regex = new RegExp(userName, 'i');
            return await this.findAll({ userName: regex }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByUserName');
        }
    }

    /**
     * Get average rating for entity
     */
    async getAverageRating(entityId) {
        try {
            const result = await this.model.aggregate([
                { $match: { entityId: entityId } },
                { $group: { 
                    _id: null, 
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }}
            ]);

            return result.length > 0 ? {
                averageRating: Math.round(result[0].averageRating * 10) / 10,
                totalReviews: result[0].totalReviews
            } : {
                averageRating: 0,
                totalReviews: 0
            };
        } catch (error) {
            throw this._handleError(error, 'getAverageRating');
        }
    }

    /**
     * Get rating distribution for entity
     */
    async getRatingDistribution(entityId) {
        try {
            const result = await this.model.aggregate([
                { $match: { entityId: entityId } },
                { $group: { 
                    _id: "$rating", 
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]);

            // Initialize all ratings (1-5) with 0 count
            const distribution = {};
            for (let i = 1; i <= 5; i++) {
                distribution[i] = 0;
            }

            // Fill in actual counts
            result.forEach(item => {
                distribution[item._id] = item.count;
            });

            return distribution;
        } catch (error) {
            throw this._handleError(error, 'getRatingDistribution');
        }
    }

    /**
     * Get recent reviews
     */
    async getRecentReviews(limit = 10) {
        try {
            return await this.findAll({}, { 
                limit, 
                sort: { createdAt: -1 } 
            });
        } catch (error) {
            throw this._handleError(error, 'getRecentReviews');
        }
    }

    /**
     * Get top rated entities by type
     */
    async getTopRatedEntities(entityType, limit = 10) {
        try {
            const result = await this.model.aggregate([
                { $match: { entityType: entityType } },
                { $group: { 
                    _id: { entityId: "$entityId", entityName: "$entityName" },
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }},
                { $match: { totalReviews: { $gte: 1 } } }, // At least 1 review
                { $sort: { averageRating: -1, totalReviews: -1 } },
                { $limit: limit }
            ]);

            return result.map(item => ({
                entityId: item._id.entityId,
                entityName: item._id.entityName,
                averageRating: Math.round(item.averageRating * 10) / 10,
                totalReviews: item.totalReviews
            }));
        } catch (error) {
            throw this._handleError(error, 'getTopRatedEntities');
        }
    }

    /**
     * Search reviews by content
     */
    async searchReviews(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await this.findAll({
                $or: [
                    { review: regex },
                    { entityName: regex },
                    { userName: regex }
                ]
            }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'searchReviews');
        }
    }

    /**
     * Get review statistics
     */
    async getReviewStatistics() {
        try {
            const totalReviews = await this.count();
            const averageRating = await this.model.aggregate([
                { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ]);

            const ratingDistribution = await this.model.aggregate([
                { $group: { _id: "$rating", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);

            const entityTypeStats = await this.model.aggregate([
                { $group: { _id: "$entityType", count: { $sum: 1 } } }
            ]);

            return {
                totalReviews,
                averageRating: averageRating.length > 0 ? 
                    Math.round(averageRating[0].avgRating * 10) / 10 : 0,
                ratingDistribution: ratingDistribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                entityTypeStats: entityTypeStats.map(item => ({
                    type: item._id,
                    count: item.count
                }))
            };
        } catch (error) {
            throw this._handleError(error, 'getReviewStatistics');
        }
    }
}

export default ReviewRepository;
