import BaseController from '../core/BaseController.js';
import ReviewService from '../services/ReviewService.js';

/**
 * Review Controller
 * Handles review HTTP requests
 */
class ReviewController extends BaseController {
    constructor() {
        const reviewService = new ReviewService();
        super(reviewService);
        this.reviewService = reviewService;
    }

    /**
     * Create a new review
     */
    async create(req, res, next) {
        try {
            const requiredFields = ['entityId', 'entityType', 'entityName', 'rating', 'review', 'userName'];
            this.validateBody(req, requiredFields);

            const result = await this.reviewService.create(req.body);
            this.sendResponse(res, 201, result, 'Review created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get review by ID
     */
    async getById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.reviewService.getById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all reviews with optional filtering
     */
    async getAll(req, res, next) {
        try {
            const { 
                entityId, entityType, rating, userName, 
                minRating, maxRating, limit, sort, ...otherFilters 
            } = req.query;

            let results;

            if (entityId) {
                results = await this.reviewService.getReviewsByEntityId(entityId);
            } else if (entityType) {
                results = await this.reviewService.getReviewsByEntityType(entityType);
            } else if (rating) {
                results = await this.reviewService.getReviewsByRating(parseInt(rating));
            } else if (minRating && maxRating) {
                results = await this.reviewService.getReviewsByRatingRange(
                    parseInt(minRating), 
                    parseInt(maxRating)
                );
            } else if (userName) {
                results = await this.reviewService.getReviewsByUserName(userName);
            } else {
                const options = {
                    limit: limit ? parseInt(limit) : 10,
                    sort: sort ? JSON.parse(sort) : { createdAt: -1 }
                };
                results = await this.reviewService.getAll(otherFilters, options);
            }

            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update review by ID
     */
    async updateById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.reviewService.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Review updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete review by ID
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.reviewService.deleteById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews by entity ID
     */
    async getReviewsByEntity(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);

            const results = await this.reviewService.getReviewsByEntityId(req.params.entityId);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews by entity type
     */
    async getReviewsByEntityType(req, res, next) {
        try {
            this.validateParams(req, ['entityType']);

            const results = await this.reviewService.getReviewsByEntityType(req.params.entityType);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews by rating
     */
    async getReviewsByRating(req, res, next) {
        try {
            this.validateParams(req, ['rating']);

            const rating = parseInt(req.params.rating);
            const results = await this.reviewService.getReviewsByRating(rating);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews by rating range
     */
    async getReviewsByRatingRange(req, res, next) {
        try {
            const { minRating, maxRating } = req.query;
            
            if (!minRating || !maxRating) {
                return this.sendError(res, 400, 'Both minRating and maxRating are required');
            }

            const results = await this.reviewService.getReviewsByRatingRange(
                parseInt(minRating), 
                parseInt(maxRating)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews by user name
     */
    async getReviewsByUser(req, res, next) {
        try {
            this.validateParams(req, ['userName']);

            const results = await this.reviewService.getReviewsByUserName(req.params.userName);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get average rating for entity
     */
    async getAverageRating(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);

            const result = await this.reviewService.getAverageRating(req.params.entityId);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get rating distribution for entity
     */
    async getRatingDistribution(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);

            const result = await this.reviewService.getRatingDistribution(req.params.entityId);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get recent reviews
     */
    async getRecentReviews(req, res, next) {
        try {
            const { limit = 10 } = req.query;
            
            const results = await this.reviewService.getRecentReviews(parseInt(limit));
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get top rated entities by type
     */
    async getTopRatedEntities(req, res, next) {
        try {
            this.validateParams(req, ['entityType']);
            
            const { limit = 10 } = req.query;
            
            const results = await this.reviewService.getTopRatedEntities(
                req.params.entityType, 
                parseInt(limit)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search reviews
     */
    async searchReviews(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return this.sendError(res, 400, 'Search term is required');
            }

            const results = await this.reviewService.searchReviews(searchTerm);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get review statistics
     */
    async getReviewStatistics(req, res, next) {
        try {
            const stats = await this.reviewService.getReviewStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get entity review summary
     */
    async getEntityReviewSummary(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);

            const summary = await this.reviewService.getEntityReviewSummary(req.params.entityId);
            this.sendResponse(res, 200, summary);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get high-rated reviews for entity
     */
    async getHighRatedReviews(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);
            
            const { minRating = 4 } = req.query;
            
            const results = await this.reviewService.getHighRatedReviews(
                req.params.entityId, 
                parseInt(minRating)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get low-rated reviews for entity
     */
    async getLowRatedReviews(req, res, next) {
        try {
            this.validateParams(req, ['entityId']);
            
            const { maxRating = 2 } = req.query;
            
            const results = await this.reviewService.getLowRatedReviews(
                req.params.entityId, 
                parseInt(maxRating)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get review dashboard data
     */
    async getReviewDashboard(req, res, next) {
        try {
            const [
                stats,
                recentReviews,
                topRatedHostels,
                topRatedRestaurants
            ] = await Promise.all([
                this.reviewService.getReviewStatistics(),
                this.reviewService.getRecentReviews(5),
                this.reviewService.getTopRatedEntities('Hostel', 5),
                this.reviewService.getTopRatedEntities('Restaurant', 5)
            ]);

            const dashboardData = {
                statistics: stats,
                recentReviews,
                topRatedHostels,
                topRatedRestaurants
            };

            this.sendResponse(res, 200, dashboardData);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Bulk delete reviews
     */
    async bulkDeleteReviews(req, res, next) {
        try {
            this.validateBody(req, ['reviewIds']);

            const { reviewIds } = req.body;
            
            if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
                return this.sendError(res, 400, 'reviewIds must be a non-empty array');
            }

            const results = [];
            const errors = [];

            for (const reviewId of reviewIds) {
                try {
                    await this.reviewService.deleteById(reviewId);
                    results.push({ reviewId, success: true });
                } catch (error) {
                    errors.push({ reviewId, success: false, error: error.message });
                }
            }

            const response = {
                totalReviews: reviewIds.length,
                deleted: results.length,
                failed: errors.length,
                results,
                errors
            };

            this.sendResponse(res, 200, response, 'Bulk review deletion completed');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get reviews with pagination
     */
    async getReviewsWithPagination(req, res, next) {
        try {
            const { page = 1, limit = 10, entityId, entityType, rating } = req.query;
            
            const options = this.getPaginationOptions(req);
            let filter = {};
            
            if (entityId) filter.entityId = entityId;
            if (entityType) filter.entityType = entityType;
            if (rating) filter.rating = parseInt(rating);

            const results = await this.reviewService.getAll(filter, options);
            
            const response = {
                reviews: results,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: results.length
                }
            };

            this.sendResponse(res, 200, response);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default ReviewController;
