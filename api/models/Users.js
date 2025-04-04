import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
  },
  bookings: [
    {
      room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
      bookingDate: { type: Date, default: Date.now },
      durationInMonths: { type: Number, required: true }
    }
  ],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
