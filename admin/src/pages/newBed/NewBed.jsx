import "./newBed.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewBed = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    };
    fetchRooms();
  }, [selectedHostel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedHostel || !selectedRoom) {
        throw new Error("Please select both hostel and room");
      }

      const response = await axios.post(`/api/beds/${selectedRoom}`, {
        bedNumber: `Bed ${Date.now()}`, // Generate unique bed number
        isOccupied: false
      });

      if (response.data.success) {
        alert("Bed added successfully!");
        navigate("/beds");
      }
    } catch (error) {
      console.error("Error adding bed:", error);
      alert(error.response?.data?.message || "Failed to add bed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newBed">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="formContainer">
          <h1>Add New Bed</h1>
          <form onSubmit={handleSubmit}>
            <div className="formInput">
              <label>Select Hostel</label>
              <select
                value={selectedHostel}
                onChange={(e) => {
                  setSelectedHostel(e.target.value);
                  setSelectedRoom("");
                }}
                required
              >
                <option value="">Choose a hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="formInput">
              <label>Select Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
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

            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Bed"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBed; 