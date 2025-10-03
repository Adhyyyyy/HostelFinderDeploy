import express from "express";
import AuthController from "../controllers-oop/AuthController.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ErrorMiddleware from "../middleware/ErrorMiddleware.js";

const router = express.Router();

// Initialize controllers and middleware (safe now since env vars are loaded)
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();
// Wrap async routes with error handler
const asyncHandler = ErrorMiddleware.asyncHandler;

// User registration
router.post("/register", 
    ValidationMiddleware.validateUserRegistration(),
    asyncHandler(authController.register.bind(authController))
);

// User login
router.post("/login", 
    ValidationMiddleware.validateUserLogin(),
    authMiddleware.authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    asyncHandler(authController.login.bind(authController))
);

// User logout
router.post("/logout", 
    asyncHandler(authController.logout.bind(authController))
);

// Verify token
router.get("/verify", 
    asyncHandler(authController.verifyToken.bind(authController))
);

// Get current user profile
router.get("/profile", 
    authMiddleware.verifyToken,
    asyncHandler(authController.getProfile.bind(authController))
);

// Change password
router.put("/change-password", 
    authMiddleware.verifyToken,
    ValidationMiddleware.validateBody({
        currentPassword: { type: 'string', required: true, minLength: 1 },
        newPassword: { type: 'string', required: true, minLength: 6 }
    }),
    asyncHandler(authController.changePassword.bind(authController))
);

// Reset password (admin only)
router.put("/reset-password/:userId", 
    authMiddleware.verifyAdmin,
    ValidationMiddleware.validateObjectIdParam('userId'),
    ValidationMiddleware.validateBody({
        newPassword: { type: 'string', required: true, minLength: 6 }
    }),
    asyncHandler(authController.resetPassword.bind(authController))
);

// Refresh token
router.post("/refresh", 
    asyncHandler(authController.refreshToken.bind(authController))
);

export default router;
