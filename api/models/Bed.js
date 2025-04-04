import mongoose from "mongoose";

const BedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  occupantName: {
    type: String,
    default: null
  },
  occupantPhone: {
    type: String,
    default: null
  },
  roomID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  hostelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  }
}, { timestamps: true });

// Clear existing model if it exists
if (mongoose.connection.models['Bed']) {
  delete mongoose.connection.models['Bed'];
}

const Bed = mongoose.model("Bed", BedSchema);

export default Bed;
