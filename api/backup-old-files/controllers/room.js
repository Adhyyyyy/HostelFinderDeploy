import Room from "../models/Room.js";
import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";
import { generateBeds } from "./bed.js";
import { createError } from "../utils/error.js";

// Create a new room and associated beds
export const createRoom = async (req, res, next) => {
  const hostelID = req.params.hostelid;
  
  try {
    // Check if hostel exists
    const hostelExists = await Hostel.findById(hostelID);
    if (!hostelExists) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check for duplicate room number
    const existingRoom = await Room.findOne({
      hostelID: hostelID,
      roomNumber: req.body.roomNumber
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${req.body.roomNumber} already exists in this hostel`
      });
    }

    // Create new room
    const newRoom = new Room({
      roomNumber: req.body.roomNumber,
      roomType: req.body.roomType,
      price: req.body.price,
      isAvailable: req.body.isAvailable ?? true,
      hostelID: hostelID
    });

    const savedRoom = await newRoom.save();
    
    // Generate and save beds for the room
    const beds = await generateBeds(savedRoom._id, hostelID, req.body.roomType);
    console.log(`Created ${beds.length} beds for room ${savedRoom._id}`);

    // Update hostel
    await Hostel.findByIdAndUpdate(hostelID, {
      $push: { rooms: savedRoom._id },
    });

    // Return room with beds
    const roomWithBeds = savedRoom.toObject();
    roomWithBeds.beds = beds;

    res.status(200).json({
      success: true,
      data: roomWithBeds
    });
  } catch (err) {
    console.error('Error creating room:', err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create room"
    });
  }
};

// Update room details
export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

// Update room status
export const updateRoomStatus = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          isAvailable,
          // Reset occupied beds when marking as available
          ...(isAvailable && { occupiedBeds: 0 })
        } 
      },
      { new: true }
    );
    
    if (!updatedRoom) {
      return next(createError(404, "Room not found!"));
    }
    
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

// Delete a room and remove it from the hostel's room list
export const deleteRoom = async (req, res, next) => {
  const hostelID = req.params.hostelid; 
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found!" });
    }

    await Hostel.findByIdAndUpdate(hostelID, {
      $pull: { rooms: req.params.id },
    });

    res.status(200).json({ message: "Room deleted successfully.", deletedRoom });
  } catch (err) {
    next(err);
  }
};

// Get a specific room with its beds
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: "Room not found" 
      });
    }

    // Get beds for this room
    const beds = await Bed.find({ roomID: room._id }).sort({ bedNumber: 1 });
    
    // If no beds exist for this room, create them based on room type
    if (!beds || beds.length === 0) {
      console.log(`No beds found for room ${room._id}, generating beds...`);
      const newBeds = await generateBeds(room._id, room.hostelID, room.roomType);
      const roomData = room.toObject();
      roomData.beds = newBeds;
      res.status(200).json({
        success: true,
        data: roomData
      });
    } else {
      const roomData = room.toObject();
      roomData.beds = beds;
      res.status(200).json({
        success: true,
        data: roomData
      });
    }
  } catch (err) {
    next(err);
  }
};

// Get all rooms with optional filtering
export const getRooms = async (req, res, next) => {
  try {
    const { roomType, maxPrice } = req.query;
    let filter = {};

    if (roomType) {
      filter.roomType = { $eq: roomType };
    }

    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    const rooms = await Room.find(filter);
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

// ✅ Get all rooms under a specific hostel
export const getRoomsByHostel = async (req, res, next) => {
  try {
    const { hostelId } = req.params; // Extract hostelId from params
    let { roomType } = req.query;

    let filter = { hostelID: hostelId }; // ✅ Use `hostelID` as per schema

    if (roomType) {
      filter.roomType = { $regex: new RegExp(`^${roomType}$`, "i") }; // Case-insensitive match
    }

    const rooms = await Room.find(filter);

    if (!rooms.length) {
      return res.status(404).json({ success: false, message: "No rooms found for this hostel." });
    }

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    next(err);
  }
};

// Update bed status
export const updateBedStatus = async (req, res) => {
  try {
    const { roomId, bedIndex } = req.params;
    const { isOccupied, occupantName, occupantPhone } = req.body;

    const beds = await Bed.find({ roomID: roomId });
    if (!beds[bedIndex]) {
      return res.status(404).json({ success: false, message: "Bed not found" });
    }

    const bed = beds[bedIndex];
    bed.isOccupied = isOccupied;
    bed.occupantName = isOccupied ? occupantName : null;
    bed.occupantPhone = isOccupied ? occupantPhone : null;

    await bed.save();

    // Return updated room with all beds
    const room = await Room.findById(roomId);
    const updatedBeds = await Bed.find({ roomID: roomId });
    const roomData = room.toObject();
    roomData.beds = updatedBeds;

    res.status(200).json({ success: true, data: roomData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};