import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import OOP components
import Database from "./core/Database.js";
import Logger from "./utils/classes/Logger.js";
import ErrorMiddleware from "./middleware/ErrorMiddleware.js";
import LoggingMiddleware from "./middleware/LoggingMiddleware.js";
import ValidationMiddleware from "./middleware/ValidationMiddleware.js";

/**
 * Main Application Class
 * Manages the Express application with OOP architecture
 */
class Application {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8800;
        this.database = Database.getInstance();
        this.logger = Logger;
        this.errorMiddleware = new ErrorMiddleware();
        this.loggingMiddleware = new LoggingMiddleware();
        
        // Initialize application (non-async parts)
        this.initializeMiddleware();
        this.setupGracefulShutdown();
    }

    /**
     * Initialize middleware
     */
    initializeMiddleware() {
        // CORS configuration
        const allowedOrigins = process.env.NODE_ENV === 'production' 
            ? process.env.ALLOWED_ORIGINS?.split(',') || []
            : ['http://localhost:3000', 'http://localhost:3001'];

        this.app.use(cors({
            origin: function(origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                
                if (allowedOrigins.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'x-api-key']
        }));

        // Basic middleware
        this.app.use(cookieParser());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Disable caching for API endpoints to prevent 304 issues
        this.app.use('/api', (req, res, next) => {
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            next();
        });

        // Security middleware
        this.app.use(ValidationMiddleware.sanitizeStrings());

        // Logging middleware
        this.app.use(this.loggingMiddleware.requestLogger);
        this.app.use(this.loggingMiddleware.performanceMonitor);
        this.app.use(this.loggingMiddleware.securityLogger);

        // Trust proxy for accurate IP addresses
        this.app.set('trust proxy', 1);
    }

    /**
     * Initialize API routes
     */
    async initializeRoutes() {
        // Health check endpoint
        this.app.get("/", (req, res) => {
            res.status(200).json({ 
                success: true,
                message: "Hostel Finder API is running",
                version: "2.0.0",
                architecture: "Object-Oriented",
                timestamp: new Date().toISOString()
            });
        });

        // Health check endpoint for monitoring
        this.app.get("/health", async (req, res) => {
            try {
                const dbHealth = await this.database.healthCheck();
                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    database: dbHealth
                };

                res.status(200).json(health);
            } catch (error) {
                this.logger.error('Health check failed', { error: error.message });
                res.status(503).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    error: error.message
                });
            }
        });

        // API version endpoint
        this.app.get("/api/version", (req, res) => {
            res.status(200).json({
                success: true,
                version: "2.0.0",
                architecture: "Object-Oriented",
                features: [
                    "Repository Pattern",
                    "Service Layer",
                    "Class-based Controllers",
                    "Comprehensive Validation",
                    "Advanced Logging",
                    "Error Handling"
                ]
            });
        });

        // Dynamic import of routes AFTER environment is loaded
        const { default: authRoutes } = await import("./routes-oop/auth.js");
        const { default: userRoutes } = await import("./routes-oop/users.js");
        const { default: hostelRoutes } = await import("./routes-oop/hostels.js");
        const { default: roomRoutes } = await import("./routes-oop/rooms.js");
        const { default: bedRoutes } = await import("./routes-oop/beds.js");
        const { default: bookingRoutes } = await import("./routes-oop/bookings.js");
        const { default: restaurantRoutes } = await import("./routes-oop/restaurants.js");
        const { default: reviewRoutes } = await import("./routes-oop/reviews.js");

        // API routes with versioning
        const apiV1 = '/api/v1';
        const api = '/api'; // Default to v1 for backward compatibility

        // Authentication routes
        this.app.use(`${api}/auth`, authRoutes);
        this.app.use(`${apiV1}/auth`, authRoutes);

        // User routes
        this.app.use(`${api}/users`, userRoutes);
        this.app.use(`${apiV1}/users`, userRoutes);

        // Hostel routes
        this.app.use(`${api}/hostel`, hostelRoutes);
        this.app.use(`${api}/hostels`, hostelRoutes); // Alternative endpoint
        this.app.use(`${apiV1}/hostel`, hostelRoutes);
        this.app.use(`${apiV1}/hostels`, hostelRoutes);

        // Room routes
        this.app.use(`${api}/rooms`, roomRoutes);
        this.app.use(`${apiV1}/rooms`, roomRoutes);

        // Bed routes
        this.app.use(`${api}/beds`, bedRoutes);
        this.app.use(`${apiV1}/beds`, bedRoutes);

        // Booking routes
        this.app.use(`${api}/bookings`, bookingRoutes);
        this.app.use(`${apiV1}/bookings`, bookingRoutes);

        // Restaurant routes
        this.app.use(`${api}/restaurants`, restaurantRoutes);
        this.app.use(`${apiV1}/restaurants`, restaurantRoutes);

        // Review routes
        this.app.use(`${api}/reviews`, reviewRoutes);
        this.app.use(`${apiV1}/reviews`, reviewRoutes);

        this.logger.info('API routes initialized successfully');
    }

    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // 404 handler for undefined routes
        this.app.use(this.errorMiddleware.notFoundHandler);

        // Global error handling middleware chain
        this.app.use(...this.errorMiddleware.createErrorChain());

        // Setup process error handlers
        ErrorMiddleware.handleUnhandledRejection();
        ErrorMiddleware.handleUncaughtException();

        this.logger.info('Error handling initialized successfully');
    }

    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            this.logger.info(`Received ${signal}. Starting graceful shutdown...`);

            // Close server
            if (this.server) {
                this.server.close(async () => {
                    this.logger.info('HTTP server closed');

                    try {
                        // Close database connection
                        await this.database.disconnect();
                        this.logger.info('Database connection closed');

                        // Exit process
                        process.exit(0);
                    } catch (error) {
                        this.logger.error('Error during shutdown', { error: error.message });
                        process.exit(1);
                    }
                });
            } else {
                process.exit(0);
            }
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }

    /**
     * Start the application
     */
    async start() {
        try {
            // Connect to database
            await this.database.connect();
            this.logger.info('Database connected successfully');

            // Start server
            this.server = this.app.listen(this.port, () => {
                this.logger.info(`Server started successfully`, {
                    port: this.port,
                    environment: process.env.NODE_ENV || 'development',
                    architecture: 'Object-Oriented',
                    version: '2.0.0'
                });

                // Log server information
                console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    HOSTEL FINDER API v2.0                   ║
║                   Object-Oriented Architecture              ║
╠══════════════════════════════════════════════════════════════╣
║ Status: Running                                              ║
║ Port: ${this.port.toString().padEnd(53)}║
║ Environment: ${(process.env.NODE_ENV || 'development').padEnd(47)}║
║ Database: Connected                                          ║
║ Architecture: OOP with Repository Pattern                   ║
╚══════════════════════════════════════════════════════════════╝
                `);
            });

            // Handle server errors
            this.server.on('error', (error) => {
                this.logger.error('Server error', { error: error.message });
                process.exit(1);
            });

        } catch (error) {
            this.logger.error('Failed to start application', { error: error.message });
            process.exit(1);
        }
    }

    /**
     * Stop the application
     */
    async stop() {
        try {
            if (this.server) {
                this.server.close();
                this.logger.info('Server stopped');
            }

            await this.database.disconnect();
            this.logger.info('Database disconnected');

        } catch (error) {
            this.logger.error('Error stopping application', { error: error.message });
            throw error;
        }
    }

    /**
     * Initialize async components (routes, etc.)
     */
    async initialize() {
        await this.initializeRoutes();
        this.initializeErrorHandling(); // Initialize error handling AFTER routes
        this.logger.info('Application initialized successfully');
    }

    /**
     * Get application instance
     */
    getApp() {
        return this.app;
    }

    /**
     * Get server instance
     */
    getServer() {
        return this.server;
    }
}

// Create and start application
const application = new Application();

// Initialize and start the application
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        try {
            await application.initialize();
            await application.start();
        } catch (error) {
            console.error('Failed to start application:', error);
            process.exit(1);
        }
    })();
}

// Export for testing
export default application;
export { Application };
