import express from "express";
import { 
  createRoom, 
  updateRoom, 
  updateRoomStatus,
  deleteRoom, 
  getRoom, 
  getRooms, 
  getRoomsByHostel, // ✅ Import new function
  updateBedStatus
} from "../controllers/room.js";

const router = express.Router();

// ✅ Get all rooms under a specific hostel
router.get("/hostel/:hostelId", getRoomsByHostel);

// Create Room
router.post("/:hostelid", createRoom);

// Update Room
router.put("/:id", updateRoom);

// Update Room Status
router.put("/status/:id", updateRoomStatus);

// Delete Room
router.delete("/:id/:hostelid", deleteRoom);

// Get Single Room
router.get("/:id", getRoom);

// Get All Rooms (With Filtering)
router.get("/", getRooms);

// Add this new route
router.put("/:roomId/bed/:bedIndex", updateBedStatus);

export default router;  // ✅ Only one export default
