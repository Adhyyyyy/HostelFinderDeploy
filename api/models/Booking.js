import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
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
  },
  hostelName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema); 