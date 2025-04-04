import express from "express";
import {  
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant, 
  getRestaurant, 
  getRestaurants, 
  countByDeliveryAvailability 
} from "../controllers/restaurants.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// CRUD Routes
router.post("/", verifyAdmin, createRestaurant);
router.put("/:id", verifyAdmin, updateRestaurant);
router.delete("/:id", verifyAdmin, deleteRestaurant);
router.get("/find/:id", getRestaurant);
router.get("/", getRestaurants);

// Counting Route
router.get("/countByDelivery", countByDeliveryAvailability);

export default router;
