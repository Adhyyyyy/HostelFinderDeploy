import Bed from "../models/Bed.js";
import Room from "../models/Room.js";

// Get beds for a specific room
export const getRoomBeds = async (req, res) => {
  try {
    const { roomId } = req.params;
    const beds = await Bed.find({ roomID: roomId });
    
    if (!beds.length) {
      return res.status(404).json({
        success: false,
        message: "No beds found for this room"
      });
    }

    res.status(200).json({
      success: true,
      data: beds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update bed status
export const updateBedStatus = async (req, res) => {
  try {
    const { roomId, bedId } = req.params;
    const { isOccupied, occupantName, occupantPhone } = req.body;

    const bed = await Bed.findOne({ _id: bedId, roomID: roomId });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    bed.isOccupied = isOccupied;
    bed.occupantName = isOccupied ? occupantName : null;
    bed.occupantPhone = isOccupied ? occupantPhone : null;

    await bed.save();

    // Get all beds for the room to return updated state
    const updatedBeds = await Bed.find({ roomID: roomId });
    const room = await Room.findById(roomId);

    const roomData = room.toObject();
    roomData.beds = updatedBeds;

    res.status(200).json({
      success: true,
      data: roomData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to generate beds
export const generateBeds = async (roomId, hostelId, roomType) => {
  // Convert room type to number of beds
  const bedCount = {
    "Single": 1,
    "Double": 2,
    "Triple": 3,
    "Quad": 4,
    "Five": 5,
    "Six": 6
  }[roomType] || 0;

  console.log(`Generating ${bedCount} beds for room ${roomId} of type ${roomType}`);

  const beds = [];
  for (let i = 0; i < bedCount; i++) {
    const bed = new Bed({
      bedNumber: `Bed ${i + 1}`,
      isOccupied: false,
      roomID: roomId,
      hostelID: hostelId
    });
    beds.push(await bed.save());
  }
  return beds;
}; 