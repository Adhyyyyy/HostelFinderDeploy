import "./bedManagement.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";

const BedManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);

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
      setBeds([]); // Clear beds when hostel changes
    };
    fetchRooms();
  }, [selectedHostel]);

  // Fetch beds when room is selected
  useEffect(() => {
    const fetchBeds = async () => {
      if (selectedRoom) {
        try {
          const response = await axios.get(`/rooms/${selectedRoom}`);
          if (response.data) {
            setBeds(response.data.beds || []);
          }
        } catch (error) {
          console.error("Error fetching beds:", error);
        }
      } else {
        setBeds([]);
      }
    };
    fetchBeds();
  }, [selectedRoom]);

  const handleUpdateBed = async (bedId, isOccupied, occupantName = "", occupantPhone = "") => {
    try {
      setLoading(true);
      await axios.put(`/rooms/${selectedRoom}/beds/${bedId}`, {
        isOccupied,
        occupantName,
        occupantPhone
      });
      
      // Refresh beds after update
      const response = await axios.get(`/rooms/${selectedRoom}`);
      if (response.data) {
        setBeds(response.data.beds || []);
      }
    } catch (error) {
      console.error("Error updating bed:", error);
      alert("Failed to update bed status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bedManagement">
      <Sidebar />
      <div className="bedContainer">
        <Navbar />
        <div className="bedContent">
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
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {beds.length > 0 && (
            <div className="bedsList">
              {beds.map((bed) => (
                <div key={bed._id} className={`bedCard ${bed.isOccupied ? 'occupied' : 'vacant'}`}>
                  <h3>{bed.bedNumber}</h3>
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
                  >
                    <option value="false">Vacant</option>
                    <option value="true">Occupied</option>
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
        </div>
      </div>
    </div>
  );
};

export default BedManagement; 