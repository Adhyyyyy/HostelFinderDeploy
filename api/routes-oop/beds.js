import express from "express";
import BedController from "../controllers-oop/BedController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const bedController = new BedController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes

// Get all beds for a room
router.get("/room/:roomId", 
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bedController.getBedsByRoom.bind(bedController))
);

// Get all beds for a hostel
router.get("/hostel/:hostelId", 
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(bedController.getBedsByHostel.bind(bedController))
);

// Get available beds in room
router.get("/room/:roomId/available", 
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bedController.getAvailableBedsInRoom.bind(bedController))
);

// Get occupied beds in room
router.get("/room/:roomId/occupied", 
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bedController.getOccupiedBedsInRoom.bind(bedController))
);

// Get bed by room and bed number
router.get("/room/:roomId/number/:bedNumber", 
    ValidationMiddleware.validateObjectIdParam('roomId'),
    ValidationMiddleware.validateParams({
        bedNumber: { type: 'string', required: true, sanitize: true }
    }),
    asyncHandler(bedController.getBedByRoomAndNumber.bind(bedController))
);

// Get bed statistics for room
router.get("/statistics/room/:roomId", 
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bedController.getBedStatisticsForRoom.bind(bedController))
);

// Get bed statistics for hostel
router.get("/statistics/hostel/:hostelId", 
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(bedController.getBedStatisticsForHostel.bind(bedController))
);

// Get all bed statistics
router.get("/statistics", 
    asyncHandler(bedController.getAllBedStatistics.bind(bedController))
);

// Get bed occupancy report
router.get("/occupancy-report", 
    ValidationMiddleware.validateQuery({
        hostelId: { type: 'objectId', required: false },
        roomId: { type: 'objectId', required: false }
    }),
    asyncHandler(bedController.getBedOccupancyReport.bind(bedController))
);

// Search beds by occupant
router.get("/search", 
    ValidationMiddleware.validateSearchQuery(),
    asyncHandler(bedController.searchBedsByOccupant.bind(bedController))
);

// Admin routes (authentication required)

// Update bed status
router.put("/room/:roomId/bed/:bedId", 
    ValidationMiddleware.validateBody({
        isOccupied: { type: 'boolean', required: true },
        occupantName: { type: 'string', required: false, sanitize: true },
        occupantPhone: { type: 'phone', required: false, sanitize: true }
    }),
    asyncHandler(bedController.updateBedStatus.bind(bedController))
);

// Occupy bed
router.put("/occupy/:bedId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('bedId'),
    ValidationMiddleware.validateBody({
        occupantName: { type: 'string', required: true, minLength: 2, maxLength: 50, sanitize: true },
        occupantPhone: { type: 'phone', required: true, sanitize: true }
    }),
    asyncHandler(bedController.occupyBed.bind(bedController))
);

// Vacate bed
router.put("/vacate/:bedId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('bedId'),
    asyncHandler(bedController.vacateBed.bind(bedController))
);

// Create beds for room
router.post("/room/:roomId", 
    ValidationMiddleware.validateBody({
        hostelId: { type: 'objectId', required: true },
        roomType: { type: 'enum', required: true, values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'] }
    }),
    asyncHandler(bedController.createBedsForRoom.bind(bedController))
);

// Delete all beds for room (admin only)
router.delete("/room/:roomId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bedController.deleteBedsForRoom.bind(bedController))
);

// Bulk update bed status (admin only)
router.put("/bulk-update", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateBody({
        bedUpdates: { 
            type: 'array', 
            required: true, 
            minLength: 1,
            maxLength: 50
        }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate each bed update object
        const { bedUpdates } = req.body;
        
        for (const update of bedUpdates) {
            if (!update.bedId || typeof update.bedId !== 'string') {
                throw new Error('Each bed update must have a valid bedId');
            }
            
            if (typeof update.isOccupied !== 'boolean') {
                throw new Error('Each bed update must have isOccupied boolean');
            }
            
            if (update.isOccupied) {
                if (!update.occupantName || typeof update.occupantName !== 'string') {
                    throw new Error('occupantName is required when bed is occupied');
                }
                
                if (!update.occupantPhone || typeof update.occupantPhone !== 'string') {
                    throw new Error('occupantPhone is required when bed is occupied');
                }
            }
        }
    }),
    asyncHandler(bedController.bulkUpdateBedStatus.bind(bedController))
);

export default router;
