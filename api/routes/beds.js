import express from "express";
import { getRoomBeds, updateBedStatus } from "../controllers/bed.js";
import Bed from "../models/Bed.js";

const router = express.Router();

// Get all beds for a room
router.get("/room/:roomId", getRoomBeds);

// Update bed status
router.put("/room/:roomId/bed/:bedId", updateBedStatus);

// Get beds by room
router.get("/room/:roomId", async (req, res) => {
  try {
    const beds = await Bed.find({ roomID: req.params.roomId });
    res.status(200).json({ success: true, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router; 