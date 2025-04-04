import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  roomType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  hostelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// First, ensure we're working with a clean slate
if (mongoose.connection.models['Room']) {
  delete mongoose.connection.models['Room'];
}

// Drop any existing indexes
mongoose.connection.collections['rooms']?.dropIndexes();

// Create a compound unique index for roomNumber and hostelID
RoomSchema.index({ roomNumber: 1, hostelID: 1 }, { unique: true });

const Room = mongoose.model("Room", RoomSchema);

// Ensure indexes are created
Room.createIndexes();

export default Room;
