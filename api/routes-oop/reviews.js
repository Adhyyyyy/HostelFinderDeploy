import express from "express";
import ReviewController from "../controllers-oop/ReviewController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes

// Get all reviews with filtering
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        entityId: { type: 'objectId', required: false },
        entityType: { type: 'enum', required: false, values: ['Hostel', 'Restaurant'] },
        rating: { type: 'number', required: false, min: 1, max: 5 },
        userName: { type: 'string', required: false, sanitize: true },
        minRating: { type: 'number', required: false, min: 1, max: 5 },
        maxRating: { type: 'number', required: false, min: 1, max: 5 },
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate rating range
        const { minRating, maxRating } = req.query;
        if (minRating && maxRating && minRating > maxRating) {
            throw new Error('minRating cannot be greater than maxRating');
        }
    }),
    asyncHandler(reviewController.getAll.bind(reviewController))
);

// Get review by ID
router.get("/:id", 
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(reviewController.getById.bind(reviewController))
);

// Get reviews by entity ID
router.get("/entity/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    asyncHandler(reviewController.getReviewsByEntity.bind(reviewController))
);

// Get reviews by entity type
router.get("/type/:entityType", 
    ValidationMiddleware.validateParams({
        entityType: { type: 'enum', required: true, values: ['Hostel', 'Restaurant'] }
    }),
    asyncHandler(reviewController.getReviewsByEntityType.bind(reviewController))
);

// Get reviews by rating
router.get("/rating/:rating", 
    ValidationMiddleware.validateParams({
        rating: { type: 'number', required: true, min: 1, max: 5 }
    }),
    asyncHandler(reviewController.getReviewsByRating.bind(reviewController))
);

// Get reviews by rating range
router.get("/rating-range", 
    ValidationMiddleware.validateQuery({
        minRating: { type: 'number', required: true, min: 1, max: 5 },
        maxRating: { type: 'number', required: true, min: 1, max: 5 }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        const { minRating, maxRating } = req.query;
        if (minRating > maxRating) {
            throw new Error('minRating cannot be greater than maxRating');
        }
    }),
    asyncHandler(reviewController.getReviewsByRatingRange.bind(reviewController))
);

// Get reviews by user name
router.get("/user/:userName", 
    ValidationMiddleware.validateParams({
        userName: { type: 'string', required: true, minLength: 2, sanitize: true }
    }),
    asyncHandler(reviewController.getReviewsByUser.bind(reviewController))
);

// Get average rating for entity
router.get("/average/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    asyncHandler(reviewController.getAverageRating.bind(reviewController))
);

// Get rating distribution for entity
router.get("/distribution/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    asyncHandler(reviewController.getRatingDistribution.bind(reviewController))
);

// Get entity review summary
router.get("/summary/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    asyncHandler(reviewController.getEntityReviewSummary.bind(reviewController))
);

// Get high-rated reviews for entity
router.get("/high-rated/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    ValidationMiddleware.validateQuery({
        minRating: { type: 'number', required: false, min: 1, max: 5 }
    }),
    asyncHandler(reviewController.getHighRatedReviews.bind(reviewController))
);

// Get low-rated reviews for entity
router.get("/low-rated/:entityId", 
    ValidationMiddleware.validateObjectIdParam('entityId'),
    ValidationMiddleware.validateQuery({
        maxRating: { type: 'number', required: false, min: 1, max: 5 }
    }),
    asyncHandler(reviewController.getLowRatedReviews.bind(reviewController))
);

// Get recent reviews
router.get("/recent", 
    ValidationMiddleware.validateQuery({
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(reviewController.getRecentReviews.bind(reviewController))
);

// Get top rated entities by type
router.get("/top-rated/:entityType", 
    ValidationMiddleware.validateParams({
        entityType: { type: 'enum', required: true, values: ['Hostel', 'Restaurant'] }
    }),
    ValidationMiddleware.validateQuery({
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(reviewController.getTopRatedEntities.bind(reviewController))
);

// Search reviews
router.get("/search", 
    ValidationMiddleware.validateSearchQuery(),
    asyncHandler(reviewController.searchReviews.bind(reviewController))
);

// Get review statistics
router.get("/statistics", 
    asyncHandler(reviewController.getReviewStatistics.bind(reviewController))
);

// Get review dashboard data
router.get("/dashboard", 
    asyncHandler(reviewController.getReviewDashboard.bind(reviewController))
);

// Get reviews with pagination
router.get("/paginated", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        entityId: { type: 'objectId', required: false },
        entityType: { type: 'enum', required: false, values: ['Hostel', 'Restaurant'] },
        rating: { type: 'number', required: false, min: 1, max: 5 }
    }),
    asyncHandler(reviewController.getReviewsWithPagination.bind(reviewController))
);

// User routes (authentication required for some)

// Create review (public - no authentication required)
router.post("/", 
    ValidationMiddleware.validateReviewCreation(),
    asyncHandler(reviewController.create.bind(reviewController))
);

// Update review by ID (user can update their own reviews)
router.put("/:id", 
    authMiddleware.verifyToken,
    ValidationMiddleware.validateObjectIdParam('id'),
    ValidationMiddleware.validateBody({
        rating: { type: 'number', required: false, min: 1, max: 5 },
        review: { type: 'string', required: false, minLength: 1, maxLength: 500, sanitize: true },
        entityName: { type: 'string', required: false, minLength: 1, maxLength: 100, sanitize: true }
    }),
    asyncHandler(reviewController.updateById.bind(reviewController))
);

// Delete review by ID (user can delete their own reviews, admin can delete any)
router.delete("/:id", 
    authMiddleware.verifyToken,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(reviewController.deleteById.bind(reviewController))
);

// Admin routes

// Bulk delete reviews (admin only)
router.delete("/bulk", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateBody({
        reviewIds: { 
            type: 'array', 
            required: true, 
            minLength: 1,
            maxLength: 50
        }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate each review ID
        const { reviewIds } = req.body;
        
        for (const reviewId of reviewIds) {
            if (!reviewId || typeof reviewId !== 'string') {
                throw new Error('Each review ID must be a valid string');
            }
            
            // Validate ObjectId format
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(reviewId)) {
                throw new Error(`Invalid review ID format: ${reviewId}`);
            }
        }
    }),
    asyncHandler(reviewController.bulkDeleteReviews.bind(reviewController))
);

export default router;
