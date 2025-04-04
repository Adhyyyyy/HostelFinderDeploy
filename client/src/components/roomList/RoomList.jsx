import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RoomList.css";

const RoomList = ({ hostelId, onBack }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: ""
  });
  
  // Add new state for filters
  const [filters, setFilters] = useState({
    roomType: "",
    priceRange: ""
  });

  useEffect(() => {
    fetchRooms();
  }, [hostelId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8800/api/rooms/hostel/${hostelId}`);
      if (response.data.success) {
        const roomsWithBeds = await Promise.all(
          response.data.rooms.map(async (room) => {
            const bedResponse = await axios.get(`http://localhost:8800/api/rooms/${room._id}`);
            return {
              ...room,
              beds: bedResponse.data.data.beds || []
            };
          })
        );
        setRooms(roomsWithBeds);
      }
    } catch (err) {
      setError("Failed to fetch rooms. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fix the isPriceInRange function
  const isPriceInRange = (price, range) => {
    if (!price || !range) return true;
    
    if (range === "5000+") {
      return price >= 5000;
    }
    
    const [min, max] = range.split('-').map(Number);
    return price >= min && price <= max;
  };

  // Update the filteredRooms function to handle undefined values
  const filteredRooms = rooms.filter(room => {
    const matchesType = !filters.roomType || room.roomType === filters.roomType;
    const matchesPrice = !filters.priceRange || isPriceInRange(room.price, filters.priceRange);
    return matchesType && matchesPrice;
  });

  const getVacantBedCount = (beds) => {
    return beds.filter(bed => !bed.isOccupied).length;
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find first available bed
      const availableBed = selectedRoom.beds.find(bed => !bed.isOccupied);
      
      if (!availableBed) {
        alert("No beds available in this room!");
        return;
      }

      const bookingPayload = {
        name: bookingData.name,
        phone: bookingData.phone,
        roomID: selectedRoom._id,
        hostelID: hostelId,
        bedNumber: availableBed.bedNumber
      };

      console.log("Sending booking data:", bookingPayload); // Debug log

      const response = await axios.post("http://localhost:8800/api/bookings", bookingPayload);

      if (response.data.success) {
        alert("Booking submitted successfully!");
        setShowBookingForm(false);
        setBookingData({ name: "", phone: "" });
        // Refresh rooms to update bed status
        window.location.reload();
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Failed to submit booking. Please try again.");
    }
  };

  return (
    <div className="roomListContainer">
      <button className="backButton" onClick={onBack}>
        ← Back to Hostels
      </button>

      <div className="filterSection">
        <div className="roomFilters">
          <h2 className="filterTitle">Filter Rooms</h2>
          <div className="filterGroup">
            <label>Room Type</label>
            <select
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
              className="filterSelect"
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Quad">Quad</option>
              <option value="Five">Five</option>
              <option value="Six">Six</option>
            </select>
          </div>

          <div className="filterGroup">
            <label>Price Range</label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="filterSelect"
            >
              <option value="">All Prices</option>
              <option value="0-1000">₹0 - ₹1,000</option>
              <option value="1000-2000">₹1,000 - ₹2,000</option>
              <option value="2000-3000">₹2,000 - ₹3,000</option>
              <option value="3000-5000">₹3,000 - ₹5,000</option>
              <option value="5000+">₹5,000+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="roomGrid">
        {loading ? (
          <div className="loading">Loading rooms...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room._id} className="cuteRoomCard">
              <div className="roomNumber">Room {room.roomNumber}</div>
              <div className="roomDetails">
                <span className="roomType">{room.roomType} Bedded</span>
                <span className="roomPrice">₹{room.price} / month</span>
                <span className="vacancyBadge">
                  {getVacantBedCount(room.beds)} Beds Available
                </span>
              </div>
              <button 
                className="cuteBookButton"
                onClick={() => handleBookNow(room)}
                disabled={getVacantBedCount(room.beds) === 0}
              >
                {getVacantBedCount(room.beds) === 0 ? 'Full' : 'Book Now'}
              </button>
            </div>
          ))
        ) : (
          <p className="noRooms">No rooms available matching your criteria.</p>
        )}
      </div>

      {showBookingForm && (
        <div className="bookingFormOverlay">
          <div className="bookingForm">
            <h3>Book Room {selectedRoom.roomNumber}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="formGroup">
                <label>Name</label>
                <input className="fi"
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                  required
                />
              </div>
              <div className="formGroup">
                <label>Phone</label>
                <input className="fi"
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="formButtons">
                <button type="submit" className="submitButton">Submit</button>
                <button 
                  type="button" 
                  className="cancelButton"
                  onClick={() => {
                    setShowBookingForm(false);
                    setBookingData({ name: "", phone: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
