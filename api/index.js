import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hostelRoute from "./routes/hostel.js";
import roomsRoute from "./routes/rooms.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import restaurantsRoute from "./routes/restaurants.js";  
import bedRoutes from "./routes/beds.js";
import bookingRoutes from "./routes/bookings.js";
import reviewRoute from "./routes/reviews.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? process.env.ALLOWED_ORIGINS?.split(',') || []
  : ['http://localhost:3000', 'http://localhost:3001'];

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB.");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
});

//middlewares
app.use(cors({
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
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(cookieParser());
app.use(express.json());

// API routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hostel", hostelRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/restaurants", restaurantsRoute);
app.use("/api/beds", bedRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoute);

// Health check endpoint for Render
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hostel Finder API is running" });
});

// Error handling middleware
app.use((err,req,res,next)=>{
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Add this after your mongoose.connect()
mongoose.connection.on('connected', async () => {
  try {
    // Drop existing indexes
    await mongoose.connection.collections['rooms']?.dropIndexes();
    console.log('Dropped existing indexes');
  } catch (err) {
    console.log('No existing indexes to drop');
  }
});

// Start the server
app.listen(PORT, () => {
    connect();
    console.log(`Server is running on port ${PORT}`);
});

