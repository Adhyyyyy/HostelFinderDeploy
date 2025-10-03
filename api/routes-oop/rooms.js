import express from "express";
import RoomController from "../controllers-oop/RoomController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const roomController = new RoomController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes

// Get all rooms under a specific hostel
router.get("/hostel/:hostelId", 
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    ValidationMiddleware.validateQuery({
        roomType: { type: 'enum', required: false, values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'] }
    }),
    asyncHandler(roomController.getRoomsByHostel.bind(roomController))
);

// Get all rooms with filtering
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        roomType: { type: 'enum', required: false, values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'] },
        maxPrice: { type: 'number', required: false, min: 0 },
        minPrice: { type: 'number', required: false, min: 0 },
        isAvailable: { type: 'boolean', required: false },
        hostelId: { type: 'objectId', required: false }
    }),
    asyncHandler(roomController.getAll.bind(roomController))
);

// Get available rooms
router.get("/available", 
    ValidationMiddleware.validateQuery({
        hostelId: { type: 'objectId', required: false }
    }),
    asyncHandler(roomController.getAvailableRooms.bind(roomController))
);

// Get rooms by price range
router.get("/price-range", 
    ValidationMiddleware.validateQuery({
        minPrice: { type: 'number', required: false, min: 0 },
        maxPrice: { type: 'number', required: false, min: 0 }
    }),
    asyncHandler(roomController.getRoomsByPriceRange.bind(roomController))
);

// Search rooms with advanced filters
router.get("/search", 
    ValidationMiddleware.validateQuery({
        roomType: { type: 'enum', required: false, values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'] },
        maxPrice: { type: 'number', required: false, min: 0 },
        minPrice: { type: 'number', required: false, min: 0 },
        isAvailable: { type: 'boolean', required: false },
        hostelId: { type: 'objectId', required: false },
        limit: { type: 'number', required: false, min: 1, max: 50 }
    }),
    asyncHandler(roomController.searchRooms.bind(roomController))
);

// Get room statistics for all rooms
router.get("/statistics", 
    asyncHandler(roomController.getAllRoomStatistics.bind(roomController))
);

// Get room statistics for hostel
router.get("/statistics/hostel/:hostelId", 
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(roomController.getRoomStatistics.bind(roomController))
);

// Get room types available in hostel
router.get("/types/hostel/:hostelId", 
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(roomController.getRoomTypes.bind(roomController))
);

// Get single room with beds
router.get("/:id", 
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(roomController.getById.bind(roomController))
);

// Get room occupancy status
router.get("/:id/occupancy", 
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(roomController.getRoomOccupancy.bind(roomController))
);

// Admin routes (authentication required)

// Create room with beds
router.post("/:hostelid", 
    ValidationMiddleware.validateRoomCreation(),
    asyncHandler(roomController.create.bind(roomController))
);

// Update room
router.put("/:id", 
    ValidationMiddleware.validateBody({
        roomNumber: { type: 'string', required: false, minLength: 1, maxLength: 10, sanitize: true },
        roomType: { type: 'enum', required: false, values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'] },
        price: { type: 'number', required: false, min: 0 },
        isAvailable: { type: 'boolean', required: false }
    }),
    asyncHandler(roomController.updateById.bind(roomController))
);

// Update room status
router.put("/status/:id", 
    ValidationMiddleware.validateBody({
        isAvailable: { type: 'boolean', required: true }
    }),
    asyncHandler(roomController.updateRoomStatus.bind(roomController))
);

// Delete room with beds
router.delete("/:id/:hostelid", 
    asyncHandler(roomController.deleteById.bind(roomController))
);

// Update bed status in room - for backward compatibility
router.put("/:roomId/bed/:bedIndex", 
    ValidationMiddleware.validateParams({
        bedIndex: { type: 'number', required: true, min: 0 }
    }),
    ValidationMiddleware.validateBody({
        isOccupied: { type: 'boolean', required: true },
        occupantName: { type: 'string', required: false, sanitize: true },
        occupantPhone: { type: 'phone', required: false, sanitize: true }
    }),
    asyncHandler(roomController.updateBedStatus.bind(roomController))
);

export default router;
