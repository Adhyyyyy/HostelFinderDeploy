import express from "express";
import Hostel from "../models/Hostel.js";
import {  
  countByGender, 
  countByCategory, 
  createHostel, 
  deleteHostel, 
  getHostel, 
  getHostels, 
  updateHostel 
} from "../controllers/hostel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// CRUD Routes
router.post("/",  createHostel);           // Admin can create a new hostel
router.put("/:id",  updateHostel);         // Admin can update an existing hostel by ID
router.delete("/:id", deleteHostel);     // Admin can delete a hostel by ID
router.get("/find/:id", getHostel);                   // Public can get a hostel by ID
router.get("/", getHostels);                           // Public can get all hostels with filters

// Counting Routes
router.get("/countByGender", countByGender);          // Get count of hostels by gender type (e.g., Boys, Girls)
router.get("/countByCategory", countByCategory);      // Get count of hostels by category (e.g., PG, Hostel)

export default router;
