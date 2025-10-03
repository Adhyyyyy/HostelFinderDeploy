import express from "express";
import BookingController from "../controllers-oop/BookingController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const bookingController = new BookingController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Public routes

// Create a new booking
router.post("/", 
    ValidationMiddleware.validateBookingCreation(),
    asyncHandler(bookingController.create.bind(bookingController))
);

// Admin routes (authentication required)

// Get all bookings with filtering
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateQuery({
        status: { type: 'enum', required: false, values: ['pending', 'approved', 'rejected'] },
        hostelId: { type: 'objectId', required: false },
        roomId: { type: 'objectId', required: false },
        phone: { type: 'phone', required: false, sanitize: true }
    }),
    asyncHandler(bookingController.getAll.bind(bookingController))
);

// Get booking by ID
router.get("/:id", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(bookingController.getById.bind(bookingController))
);

// Get pending bookings
router.get("/status/pending", 
    authMiddleware.verifyAdmin,
    asyncHandler(bookingController.getPendingBookings.bind(bookingController))
);

// Get approved bookings
router.get("/status/approved", 
    authMiddleware.verifyAdmin,
    asyncHandler(bookingController.getApprovedBookings.bind(bookingController))
);

// Get bookings by status
router.get("/status/:status", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateParams({
        status: { type: 'enum', required: true, values: ['pending', 'approved', 'rejected'] }
    }),
    asyncHandler(bookingController.getBookingsByStatus.bind(bookingController))
);

// Get bookings by hostel
router.get("/hostel/:hostelId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(bookingController.getBookingsByHostel.bind(bookingController))
);

// Get bookings by room
router.get("/room/:roomId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('roomId'),
    asyncHandler(bookingController.getBookingsByRoom.bind(bookingController))
);

// Get bookings by user phone
router.get("/phone/:phone", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateParams({
        phone: { type: 'phone', required: true, sanitize: true }
    }),
    asyncHandler(bookingController.getBookingsByPhone.bind(bookingController))
);

// Search bookings
router.get("/search", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateSearchQuery(),
    asyncHandler(bookingController.searchBookings.bind(bookingController))
);

// Get bookings by date range
router.get("/date-range", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateDateRange(),
    asyncHandler(bookingController.getBookingsByDateRange.bind(bookingController))
);

// Get booking statistics
router.get("/statistics", 
    authMiddleware.verifyAdmin,
    asyncHandler(bookingController.getBookingStatistics.bind(bookingController))
);

// Get booking statistics by hostel
router.get("/statistics/hostel/:hostelId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('hostelId'),
    asyncHandler(bookingController.getBookingStatisticsByHostel.bind(bookingController))
);

// Get booking dashboard data
router.get("/dashboard", 
    authMiddleware.verifyAdmin,
    asyncHandler(bookingController.getBookingDashboard.bind(bookingController))
);

// Update booking status
router.put("/:id/status", 
    ValidationMiddleware.validateObjectIdParam('id'),
    ValidationMiddleware.validateBody({
        status: { type: 'enum', required: true, values: ['pending', 'approved', 'rejected'] }
    }),
    asyncHandler(bookingController.updateBookingStatus.bind(bookingController))
);

// Approve booking
router.put("/:id/approve", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(bookingController.approveBooking.bind(bookingController))
);

// Reject booking
router.put("/:id/reject", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(bookingController.rejectBooking.bind(bookingController))
);

// Delete booking
router.delete("/:id", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(bookingController.deleteById.bind(bookingController))
);

// Bulk approve bookings
router.put("/bulk/approve", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateBody({
        bookingIds: { 
            type: 'array', 
            required: true, 
            minLength: 1,
            maxLength: 50
        }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate each booking ID
        const { bookingIds } = req.body;
        
        for (const bookingId of bookingIds) {
            if (!bookingId || typeof bookingId !== 'string') {
                throw new Error('Each booking ID must be a valid string');
            }
            
            // Validate ObjectId format
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(bookingId)) {
                throw new Error(`Invalid booking ID format: ${bookingId}`);
            }
        }
    }),
    asyncHandler(bookingController.bulkApproveBookings.bind(bookingController))
);

// Bulk reject bookings
router.put("/bulk/reject", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateBody({
        bookingIds: { 
            type: 'array', 
            required: true, 
            minLength: 1,
            maxLength: 50
        }
    }),
    ValidationMiddleware.custom(async (req, res) => {
        // Validate each booking ID
        const { bookingIds } = req.body;
        
        for (const bookingId of bookingIds) {
            if (!bookingId || typeof bookingId !== 'string') {
                throw new Error('Each booking ID must be a valid string');
            }
            
            // Validate ObjectId format
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(bookingId)) {
                throw new Error(`Invalid booking ID format: ${bookingId}`);
            }
        }
    }),
    asyncHandler(bookingController.bulkRejectBookings.bind(bookingController))
);

export default router;
