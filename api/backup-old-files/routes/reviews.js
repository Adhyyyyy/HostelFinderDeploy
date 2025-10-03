import express from "express";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";

const router = express.Router();

// Create a new review
router.post("/", async (req, res, next) => {
  try {
    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: savedReview,
    });
  } catch (err) {
    next(createError(500, "Failed to submit review"));
  }
});

// Get reviews by entity ID
router.get("/entity/:entityId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ 
      entityId: req.params.entityId 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    next(createError(500, "Failed to fetch reviews"));
  }
});

// Get all reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    next(createError(500, "Failed to fetch reviews"));
  }
});

export default router; 