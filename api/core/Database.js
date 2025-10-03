import mongoose from "mongoose";

/**
 * Database Connection Singleton
 * Manages MongoDB connection with proper error handling
 */
class Database {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Connect to MongoDB
     */
    async connect() {
        if (this.isConnected) {
            console.log("Already connected to MongoDB");
            return this.connection;
        }

        try {
            const connectionString = process.env.MONGO;
            if (!connectionString) {
                throw new Error("MongoDB connection string not found in environment variables");
            }

            this.connection = await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            this.isConnected = true;
            console.log("Connected to MongoDB successfully");

            // Set up event listeners
            this._setupEventListeners();

            return this.connection;
        } catch (error) {
            console.error("MongoDB connection error:", error);
            process.exit(1);
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        if (!this.isConnected) {
            console.log("Not connected to MongoDB");
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            this.connection = null;
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }

    /**
     * Setup event listeners for connection
     */
    _setupEventListeners() {
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
            this.isConnected = true;
        });

        mongoose.connection.on('error', (error) => {
            console.error('Mongoose connection error:', error);
            this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            this.isConnected = false;
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }

    /**
     * Health check for database connection
     */
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', message: 'Not connected to database' };
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            
            return { 
                status: 'healthy', 
                message: 'Database connection is healthy',
                details: this.getConnectionStatus()
            };
        } catch (error) {
            return { 
                status: 'unhealthy', 
                message: 'Database connection failed',
                error: error.message 
            };
        }
    }
}

export default Database;
