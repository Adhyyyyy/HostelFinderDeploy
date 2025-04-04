import "../../styles/form.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Add this after your imports to check axios configuration
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.log('Response Error:', {
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

const NewRoom = () => {
  const [info, setInfo] = useState({
    roomNumber: "",
    roomType: "",
    price: "",
    isAvailable: true
  });
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Room type options
  const roomTypes = ["Single", "Double", "Triple", "Quad", "Five", "Six"];

  // Fetch hostels for the dropdown
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get("/hostel");
        setHostels(response.data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
        alert("Error fetching hostels");
      }
    };
    fetchHostels();
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setInfo(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  const handleHostelSelect = (e) => {
    setSelectedHostel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedHostel) {
        throw new Error("Please select a hostel");
      }

      if (!info.roomNumber || !info.roomType || !info.price) {
        throw new Error("Please fill all required fields");
      }

      // Only send the required fields
      const roomData = {
        roomNumber: String(info.roomNumber).trim(),
        roomType: info.roomType,
        price: Number(info.price),
        isAvailable: info.isAvailable
      };

      const response = await axios.post(`/rooms/${selectedHostel}`, roomData);

      if (response.data.success) {
        alert("Room created successfully!");
        navigate("/rooms");
      } else {
        throw new Error(response.data.message || "Failed to create room");
      }
    } catch (err) {
      console.error("Creation failed:", err);
      alert(err.response?.data?.message || err.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>Add New Room</h1>
            <form onSubmit={handleSubmit}>
              {/* Hostel Selection */}
              <div className="formInput">
                <label>Select Hostel *</label>
                <select
                  value={selectedHostel}
                  onChange={handleHostelSelect}
                  required
                >
                  <option value="">Select a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Number */}
              <div className="formInput">
                <label>Room Number *</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={info.roomNumber}
                  onChange={handleChange}
                  placeholder="Enter room number"
                  required
                />
              </div>

              {/* Room Type */}
              <div className="formInput">
                <label>Room Type *</label>
                <select
                  id="roomType"
                  value={info.roomType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select room type</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="formInput">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  value={info.price}
                  onChange={handleChange}
                  placeholder="Enter room price"
                  required
                  min="0"
                />
              </div>

              {/* Availability */}
              <div className="formInput">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={info.isAvailable}
                    onChange={handleChange}
                  />
                  <label>Available</label>
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;