import express from "express";
import UserController from "../controllers-oop/UserController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();
// Initialize controllers and middleware (safe now since env vars are loaded)
const userController = new UserController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// Create user (admin only)
router.post("/", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateUserRegistration(),
    asyncHandler(userController.create.bind(userController))
);

// Get all users with filtering and search
router.get("/", 
    ValidationMiddleware.validatePagination(),
    ValidationMiddleware.validateSearchQuery(),
    asyncHandler(userController.getAll.bind(userController))
);

// Get user statistics (admin only)
router.get("/statistics", 
    authMiddleware.verifyAdmin,
    asyncHandler(userController.getUserStatistics.bind(userController))
);

// Get admin users (admin only)
router.get("/admins", 
    authMiddleware.verifyAdmin,
    asyncHandler(userController.getAdminUsers.bind(userController))
);

// Get regular users (admin only)
router.get("/regular", 
    authMiddleware.verifyAdmin,
    asyncHandler(userController.getRegularUsers.bind(userController))
);

// Get users with bookings (admin only)
router.get("/with-bookings", 
    authMiddleware.verifyAdmin,
    asyncHandler(userController.getUsersWithBookings.bind(userController))
);

// Search users (admin only)
router.get("/search", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateSearchQuery(),
    ValidationMiddleware.validatePagination(),
    asyncHandler(userController.searchUsers.bind(userController))
);

// Get user by email (admin only)
router.get("/email/:email", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateParams({
        email: { type: 'email', required: true, sanitize: true }
    }),
    asyncHandler(userController.getUserByEmail.bind(userController))
);

// Get current user profile
router.get("/profile", 
    authMiddleware.verifyToken,
    asyncHandler(userController.getProfile.bind(userController))
);

// Update current user profile
router.put("/profile", 
    authMiddleware.verifyToken,
    ValidationMiddleware.validateBody({
        name: { type: 'string', required: false, minLength: 2, maxLength: 50, sanitize: true },
        phone: { type: 'phone', required: false, sanitize: true }
    }),
    asyncHandler(userController.updateProfile.bind(userController))
);

// Get user by ID
router.get("/:id", 
    asyncHandler(userController.getById.bind(userController))
);

// Update user by ID
router.put("/:id", 
    ValidationMiddleware.validateBody({
        name: { type: 'string', required: false, minLength: 2, maxLength: 50, sanitize: true },
        email: { type: 'email', required: false, sanitize: true },
        phone: { type: 'phone', required: false, sanitize: true },
        isAdmin: { type: 'boolean', required: false }
    }),
    asyncHandler(userController.updateById.bind(userController))
);

// Delete user by ID
router.delete("/:id", 
    asyncHandler(userController.deleteById.bind(userController))
);

// Add booking to user (admin only)
router.post("/:id/bookings", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    ValidationMiddleware.validateBody({
        room: { type: 'objectId', required: true },
        durationInMonths: { type: 'number', required: true, min: 1 }
    }),
    asyncHandler(userController.addBookingToUser.bind(userController))
);

// Remove booking from user (admin only)
router.delete("/:id/bookings/:bookingId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    ValidationMiddleware.validateObjectIdParam('bookingId'),
    asyncHandler(userController.removeBookingFromUser.bind(userController))
);

// Toggle admin status (super admin only)
router.put("/:id/toggle-admin", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('id'),
    asyncHandler(userController.toggleAdminStatus.bind(userController))
);

export default router;
