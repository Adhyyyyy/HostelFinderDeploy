import express from "express";
import { createBooking, getBookings, deleteBooking, updateBookingStatus } from "../controllers/booking.js";

const router = express.Router();

// Create a new booking
router.post("/", createBooking);

// Get all bookings
router.get("/", getBookings);

// Delete a booking
router.delete("/:id", deleteBooking);

// Update booking status
router.put("/:id/status", updateBookingStatus);

export default router; 