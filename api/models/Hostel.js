import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  genderType: { type: String, required: true },
  distanceFromCollege: { type: Number, required: true },
  address: { type: String, required: true },
  vacancy: { type: Number, required: true },
  capacity: { type: Number, required: true },
  contact: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerContact: { type: String, required: true },
  photos: [String],
  amenities: [String],
  rules: [String],
  messType: { type: Boolean, default: false },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { timestamps: true });

export default mongoose.model("Hostel", hostelSchema);
