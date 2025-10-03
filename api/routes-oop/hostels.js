import express from "express";
import HostelController from "../controllers-oop/HostelController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();

// Initialize controllers and middleware (safe now since env vars are loaded)
const hostelController = new HostelController();
const authMiddleware = new AuthMiddleware();




// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes (no authentication required)

// Get all hostels with filtering and search
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        name: { type: 'string', required: false, sanitize: true },
        category: { type: 'enum', required: false, values: ['PG', 'Hostel'] },
        genderType: { type: 'enum', required: false, values: ['Boys', 'Girls', 'Co-ed'] },
        messType: { type: 'boolean', required: false },
        minVacancy: { type: 'number', required: false, min: 0 },
        maxDistance: { type: 'number', required: false, min: 0 }
    }),
    asyncHandler(hostelController.getAll.bind(hostelController))
);

// Get hostel by ID
router.get("/find/:id", 
    asyncHandler(hostelController.getById.bind(hostelController))
);

// Get hostel details with additional information
router.get("/details/:id", 
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(hostelController.getHostelDetails.bind(hostelController))
);

// Search hostels
router.get("/search", 
    ValidationMiddleware.validateQuery({
        name: { type: 'string', required: false, sanitize: true },
        category: { type: 'enum', required: false, values: ['PG', 'Hostel'] },
        genderType: { type: 'enum', required: false, values: ['Boys', 'Girls', 'Co-ed'] },
        messType: { type: 'boolean', required: false },
        minVacancy: { type: 'number', required: false, min: 0 },
        maxDistance: { type: 'number', required: false, min: 0 },
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(hostelController.searchHostels.bind(hostelController))
);

// Get available hostels
router.get("/available", 
    ValidationMiddleware.validateQuery({
        minVacancy: { type: 'number', required: false, min: 1 }
    }),
    asyncHandler(hostelController.getAvailableHostels.bind(hostelController))
);

// Get featured hostels
router.get("/featured", 
    ValidationMiddleware.validateQuery({
        limit: { type: 'number', required: false, min: 1, max: 10 }
    }),
    asyncHandler(hostelController.getFeaturedHostels.bind(hostelController))
);

// Get hostels by gender type
router.get("/gender/:genderType", 
    ValidationMiddleware.validateParams({
        genderType: { type: 'enum', required: true, values: ['Boys', 'Girls', 'Co-ed'] }
    }),
    asyncHandler(hostelController.getHostelsByGender.bind(hostelController))
);

// Get hostels by category
router.get("/category/:category", 
    ValidationMiddleware.validateParams({
        category: { type: 'enum', required: true, values: ['PG', 'Hostel'] }
    }),
    asyncHandler(hostelController.getHostelsByCategory.bind(hostelController))
);

// Get hostels within distance
router.get("/within-distance", 
    ValidationMiddleware.validateQuery({
        maxDistance: { type: 'number', required: true, min: 0 }
    }),
    asyncHandler(hostelController.getHostelsWithinDistance.bind(hostelController))
);

// Get hostels by location proximity
router.get("/near", 
    ValidationMiddleware.validateCoordinates(),
    ValidationMiddleware.validateQuery({
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
        maxDistance: { type: 'number', required: false, min: 0 }
    }),
    asyncHandler(hostelController.getHostelsByLocation.bind(hostelController))
);

// Count hostels by gender
router.get("/countByGender", 
    ValidationMiddleware.validateQuery({
        gender: { type: 'string', required: true }
    }),
    asyncHandler(hostelController.countByGender.bind(hostelController))
);

// Count hostels by category
router.get("/countByCategory", 
    asyncHandler(hostelController.countByCategory.bind(hostelController))
);

// Get hostel statistics
router.get("/statistics", 
    asyncHandler(hostelController.getHostelStatistics.bind(hostelController))
);

// Admin routes (authentication required)

// Create hostel
router.post("/", 
    ValidationMiddleware.validateHostelCreation(),
    asyncHandler(hostelController.create.bind(hostelController))
);

// Update hostel by ID
router.put("/:id", 
    ValidationMiddleware.validateBody({
        name: { type: 'string', required: false, minLength: 2, maxLength: 100, sanitize: true },
        category: { type: 'enum', required: false, values: ['PG', 'Hostel'] },
        genderType: { type: 'enum', required: false, values: ['Boys', 'Girls', 'Co-ed'] },
        distanceFromCollege: { type: 'number', required: false, min: 0, max: 100 },
        address: { type: 'string', required: false, minLength: 10, maxLength: 200, sanitize: true },
        vacancy: { type: 'number', required: false, min: 0 },
        capacity: { type: 'number', required: false, min: 1 },
        contact: { type: 'phone', required: false, sanitize: true },
        ownerName: { type: 'string', required: false, minLength: 2, maxLength: 50, sanitize: true },
        ownerContact: { type: 'phone', required: false, sanitize: true },
        photos: { type: 'array', required: false, maxLength: 10 },
        amenities: { type: 'array', required: false, maxLength: 20 },
        rules: { type: 'array', required: false, maxLength: 20 },
        messType: { type: 'boolean', required: false }
    }),
    asyncHandler(hostelController.updateById.bind(hostelController))
);

// Delete hostel by ID
router.delete("/:id", 
    asyncHandler(hostelController.deleteById.bind(hostelController))
);

// Update hostel vacancy
router.put("/:id/vacancy", 
    ValidationMiddleware.validateBody({
        vacancyChange: { type: 'number', required: true }
    }),
    asyncHandler(hostelController.updateVacancy.bind(hostelController))
);

export default router;
