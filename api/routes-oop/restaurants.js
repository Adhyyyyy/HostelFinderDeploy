import express from "express";
import RestaurantController from "../controllers-oop/RestaurantController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const restaurantController = new RestaurantController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes

// Get all restaurants with filtering
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        name: { type: 'string', required: false, sanitize: true },
        deliveryAvailable: { type: 'boolean', required: false },
        maxDistance: { type: 'number', required: false, min: 0 },
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(restaurantController.getAll.bind(restaurantController))
);

// Get restaurant by ID
router.get("/:id", 
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(restaurantController.getById.bind(restaurantController))
);

// Get restaurants by delivery availability
router.get("/delivery/:available", 
    ValidationMiddleware.validateParams({
        available: { type: 'enum', required: true, values: ['true', 'false'] }
    }),
    asyncHandler(restaurantController.getRestaurantsByDelivery.bind(restaurantController))
);

// Get restaurants with delivery available
router.get("/delivery-available", 
    asyncHandler((req, res, next) => {
        req.query.available = 'true';
        return restaurantController.getRestaurantsByDelivery(req, res, next);
    })
);

// Get restaurants by location proximity
router.get("/near", 
    ValidationMiddleware.validateCoordinates(),
    ValidationMiddleware.validateQuery({
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
        maxDistance: { type: 'number', required: false, min: 0 }
    }),
    asyncHandler(restaurantController.getRestaurantsByLocation.bind(restaurantController))
);

// Get nearby restaurants with delivery
router.get("/near-with-delivery", 
    ValidationMiddleware.validateCoordinates(),
    ValidationMiddleware.validateQuery({
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
        maxDistance: { type: 'number', required: false, min: 0 }
    }),
    asyncHandler(restaurantController.getNearbyRestaurantsWithDelivery.bind(restaurantController))
);

// Search restaurants by name
router.get("/search/name", 
    ValidationMiddleware.validateSearchQuery(),
    asyncHandler(restaurantController.searchRestaurantsByName.bind(restaurantController))
);

// Get restaurants within distance
router.get("/within-distance", 
    ValidationMiddleware.validateQuery({
        maxDistance: { type: 'number', required: true, min: 0 }
    }),
    asyncHandler(restaurantController.getRestaurantsWithinDistance.bind(restaurantController))
);

// Search restaurants with advanced filters
router.get("/search", 
    ValidationMiddleware.validateQuery({
        name: { type: 'string', required: false, sanitize: true },
        deliveryAvailable: { type: 'boolean', required: false },
        maxDistance: { type: 'number', required: false, min: 0 },
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(restaurantController.searchRestaurants.bind(restaurantController))
);

// Get restaurants with enhanced details
router.get("/with-details", 
    ValidationMiddleware.validateQuery({
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(restaurantController.getRestaurantsWithDetails.bind(restaurantController))
);

// Get featured restaurants
router.get("/featured", 
    ValidationMiddleware.validateQuery({
        limit: { type: 'number', required: false, min: 1, max: 10 }
    }),
    asyncHandler(restaurantController.getFeaturedRestaurants.bind(restaurantController))
);

// Count restaurants by delivery availability
router.get("/countByDeliveryAvailability", 
    asyncHandler(restaurantController.countByDeliveryAvailability.bind(restaurantController))
);

// Get restaurant statistics
router.get("/statistics", 
    asyncHandler(restaurantController.getRestaurantStatistics.bind(restaurantController))
);

// Get restaurant dashboard data
router.get("/dashboard", 
    asyncHandler(restaurantController.getRestaurantDashboard.bind(restaurantController))
);

// Admin routes (authentication required)

// Create restaurant
router.post("/", 
    ValidationMiddleware.validateRestaurantCreation(),
    asyncHandler(restaurantController.create.bind(restaurantController))
);

// Update restaurant by ID
router.put("/:id", 
    ValidationMiddleware.validateBody({
        name: { type: 'string', required: false, minLength: 2, maxLength: 100, sanitize: true },
        image: { type: 'url', required: false },
        map: { type: 'url', required: false },
        distance: { type: 'string', required: false, minLength: 1, maxLength: 20, sanitize: true },
        deliveryAvailable: { type: 'boolean', required: false },
        contactNumber: { type: 'phone', required: false, sanitize: true },
        location: { type: 'object', required: false }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate location object if provided
        if (req.body.location) {
            const { latitude, longitude } = req.body.location;
            if (latitude !== undefined || longitude !== undefined) {
                if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                    throw new Error('Location latitude and longitude must be numbers');
                }
                if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
                    throw new Error('Invalid location coordinates');
                }
            }
        }
    }),
    asyncHandler(restaurantController.updateById.bind(restaurantController))
);

// Delete restaurant by ID
router.delete("/:id", 
    asyncHandler(restaurantController.deleteById.bind(restaurantController))
);

// Update restaurant location (admin only)
router.put("/:id/location", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    ValidationMiddleware.validateBody({
        latitude: { type: 'number', required: true },
        longitude: { type: 'number', required: true }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        const { latitude, longitude } = req.body;
        if (Math.abs(latitude) > 90) {
            throw new Error('Latitude must be between -90 and 90 degrees');
        }
        if (Math.abs(longitude) > 180) {
            throw new Error('Longitude must be between -180 and 180 degrees');
        }
    }),
    asyncHandler(restaurantController.updateRestaurantLocation.bind(restaurantController))
);

// Toggle delivery availability (admin only)
router.put("/:id/toggle-delivery", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(restaurantController.toggleDeliveryAvailability.bind(restaurantController))
);

// Bulk update delivery availability (admin only)
router.put("/bulk/delivery-availability", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateBody({
        restaurantIds: { 
            type: 'array', 
            required: true, 
            minLength: 1,
            maxLength: 50
        },
        deliveryAvailable: { type: 'boolean', required: true }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate each restaurant ID
        const { restaurantIds } = req.body;
        
        for (const restaurantId of restaurantIds) {
            if (!restaurantId || typeof restaurantId !== 'string') {
                throw new Error('Each restaurant ID must be a valid string');
            }
            
            // Validate ObjectId format
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(restaurantId)) {
                throw new Error(`Invalid restaurant ID format: ${restaurantId}`);
            }
        }
    }),
    asyncHandler(restaurantController.bulkUpdateDeliveryAvailability.bind(restaurantController))
);

export default router;
