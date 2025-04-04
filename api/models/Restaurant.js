import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  map: { type: String, required: true },
  distance: { type: String, required: true },
  deliveryAvailable: { type: Boolean, default: false },
  contactNumber: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
}, { timestamps: true });

export default mongoose.model("Restaurant", RestaurantSchema);
