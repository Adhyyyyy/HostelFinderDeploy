import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Hostel', 'Restaurant']
  },
  entityName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500
  },
  userName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Review", ReviewSchema); 