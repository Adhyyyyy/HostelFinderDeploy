import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";

export const createBooking = async (req, res) => {
  try {
    const { name, phone, roomID, hostelID, bedNumber } = req.body;

    // Validate required fields
    if (!name || !phone || !roomID || !hostelID || !bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Get hostel and room details
    const hostel = await Hostel.findById(hostelID);
    const room = await Room.findById(roomID);

    if (!hostel || !room) {
      return res.status(404).json({
        success: false,
        message: "Hostel or Room not found"
      });
    }

    // Create new booking with hostel name and room number
    const newBooking = new Booking({
      name,
      phone,
      roomID,
      hostelID,
      hostelName: hostel.name,
      roomNumber: room.roomNumber,
      bedNumber,
      status: 'pending'
    });

    const savedBooking = await newBooking.save();

    // Remove the bed status update part
    // The bed will remain vacant until manually approved
    
    res.status(200).json({
      success: true,
      data: savedBooking,
      message: "Booking created successfully"
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking"
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Error in getBookings:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update bed status back to vacant
    await Bed.findOneAndUpdate(
      { 
        roomID: booking.roomID, 
        bedNumber: booking.bedNumber 
      },
      { 
        isOccupied: false,
        occupantName: null,
        occupantPhone: null
      }
    );

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking"
    });
  }
};

// Add a new function to approve/reject bookings
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = status;
    await booking.save();

    // Only update bed status if booking is approved
    if (status === 'approved') {
      await Bed.findOneAndUpdate(
        { 
          roomID: booking.roomID, 
          bedNumber: booking.bedNumber 
        },
        { 
          isOccupied: true,
          occupantName: booking.name,
          occupantPhone: booking.phone
        }
      );
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status"
    });
  }
}; 