import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
    allocationID: { type: String, required: true, unique: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bedID: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], required: true },
    requestedDate: { type: Date, required: true },
    approvedDate: { type: Date },
    adminID: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
}, { timestamps: true });

export default mongoose.model("Allocation", allocationSchema);
