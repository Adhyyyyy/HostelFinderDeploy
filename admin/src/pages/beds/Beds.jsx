import "./beds.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";

const Beds = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedHostel, setSelectedHostel] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Helper function to get bed count from room type
  const getBedCountFromType = (roomType) => {
    const bedCounts = {
      "Single": 1,
      "Double": 2,
      "Triple": 3,
      "Quad": 4,
      "Five": 5,
      "Six": 6
    };
    return bedCounts[roomType] || 0;
  };

  // Generate beds array based on room type
  const generateBeds = (roomType) => {
    const count = getBedCountFromType(roomType);
    return Array.from({ length: count }, (_, index) => ({
      bedNumber: `Bed ${index + 1}`,
      isOccupied: false,
      occupantName: null,
      occupantPhone: null
    }));
  };

  // Fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get("/hostel");
        setHostels(response.data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
      }
    };
    fetchHostels();
  }, []);

  // Fetch rooms when hostel is selected
  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedHostel) {
        try {
          const response = await axios.get(`/rooms/hostel/${selectedHostel}`);
          if (response.data.success) {
            setRooms(response.data.rooms);
          }
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      } else {
        setRooms([]);
      }
      setCurrentRoom(null);
    };
    fetchRooms();
  }, [selectedHostel]);

  // Fetch room details when room is selected
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (selectedRoom) {
        try {
          setLoading(true);
          const response = await axios.get(`/rooms/${selectedRoom}`);
          console.log("Room response:", response.data);
          
          if (response.data && response.data.data) {
            const roomData = response.data.data;
            // Ensure beds array exists
            roomData.beds = roomData.beds || [];
            setCurrentRoom(roomData);
          }
        } catch (error) {
          console.error("Error fetching room details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentRoom(null);
      }
    };
    fetchRoomDetails();
  }, [selectedRoom]);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const response = await axios.get("http://localhost:8800/api/bookings");
        
        if (response.data.success && response.data.data) {
          setBookings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateBed = async (bedId, isOccupied, occupantName = "", occupantPhone = "") => {
    try {
      setLoading(true);
      const response = await axios.put(`/beds/room/${selectedRoom}/bed/${bedId}`, {
        isOccupied,
        occupantName,
        occupantPhone
      });
      
      if (response.data.success) {
        setCurrentRoom(response.data.data);
      }
    } catch (error) {
      console.error("Error updating bed:", error);
      alert("Failed to update bed status");
    } finally {
      setLoading(false);
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
      
      if (confirmDelete) {
        await axios.delete(`http://localhost:8800/api/bookings/${bookingId}`);
        // Update the bookings list by filtering out the deleted booking
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  // Add this function to handle booking status updates
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`http://localhost:8800/api/bookings/${bookingId}/status`, { status });
      // Refresh the bookings list
      const response = await axios.get("http://localhost:8800/api/bookings");
      if (response.data.success && response.data.data) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  return (
    <div className="beds">
      <Sidebar />
      <div className="bedsContainer">
        <Navbar />
        <div className="bedContent">
          <div className="contentWrapper">
            <div className="bedManagement">
              <h1>Bed Management</h1>
              
              <div className="selectors">
                <div className="selector">
                  <label>Select Hostel</label>
                  <select
                    value={selectedHostel}
                    onChange={(e) => {
                      setSelectedHostel(e.target.value);
                      setSelectedRoom("");
                    }}
                  >
                    <option value="">Choose a hostel</option>
                    {hostels.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector">
                  <label>Select Room</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    disabled={!selectedHostel}
                  >
                    <option value="">Choose a room</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.roomNumber} ({room.roomType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && <div className="loading">Loading...</div>}

              {currentRoom && (
                <>
                  <div className="roomInfo">
                    <h2>Room {currentRoom.roomNumber}</h2>
                    <p>Type: {currentRoom.roomType}</p>
                    <p>Total Beds: {currentRoom.beds?.length || 0}</p>
                  </div>
                  
                  {currentRoom.beds && currentRoom.beds.length > 0 && (
                    <div className="bedsList">
                      {currentRoom.beds.map((bed) => (
                        <div key={bed._id} className={`bedCard ${bed.isOccupied ? 'occupied' : 'vacant'}`}>
                          <h3>{bed.bedNumber}</h3>
                          <p className="status">Status: {bed.isOccupied ? 'Occupied' : 'Vacant'}</p>
                          <select
                            value={bed.isOccupied}
                            onChange={(e) => {
                              const newStatus = e.target.value === "true";
                              if (newStatus) {
                                const name = prompt("Enter occupant name:");
                                const phone = prompt("Enter occupant phone:");
                                if (name && phone) {
                                  handleUpdateBed(bed._id, true, name, phone);
                                }
                              } else {
                                handleUpdateBed(bed._id, false);
                              }
                            }}
                            disabled={loading}
                            className={bed.isOccupied ? 'occupied' : 'vacant'}
                          >
                            <option value="false">Mark as Vacant</option>
                            <option value="true">Mark as Occupied</option>
                          </select>
                          {bed.isOccupied && (
                            <div className="occupantInfo">
                              <p><strong>Occupant:</strong> {bed.occupantName}</p>
                              <p><strong>Phone:</strong> {bed.occupantPhone}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!loading && currentRoom && (!currentRoom.beds || currentRoom.beds.length === 0) && (
                <div className="noBeds">
                  <p>No beds found for this room.</p>
                </div>
              )}
            </div>
            
            <div className="bookingsList">
              <h2>All Bookings</h2>
              {loadingBookings ? (
                <div className="loading">Loading bookings...</div>
              ) : (
                <div className="bookingsContainer">
                  {bookings.length === 0 ? (
                    <div className="noBookings">No bookings found</div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking._id} className="bookingCard">
                        <div className="deleteIcon" onClick={() => handleDeleteBooking(booking._id)}>
                          ×
                        </div>
                        <div className="bookingHeader">
                          <span className={`status ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <span className="date">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bookingDetails">
                          <p><strong>Name:</strong> {booking.name}</p>
                          <p><strong>Phone:</strong> {booking.phone}</p>
                          <p><strong>Hostel:</strong> {booking.hostelName}</p>
                          <p><strong>Room:</strong> {booking.roomNumber}</p>
                          <p><strong>Bed:</strong> {booking.bedNumber}</p>
                        </div>
                        {booking.status === 'pending' && (
                          <div className="bookingActions">
                            <button 
                              className="approveButton"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="rejectButton"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Beds; 