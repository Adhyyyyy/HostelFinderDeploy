import "../../styles/form.scss";
import { useState } from "react";
import { hostelInputs } from "../../formSource";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const NewHostel = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({
    messType: false,
    category: "Hostel", 
    genderType: "Boys",
    location: { lat: 0, lng: 0 },
    amenities: "",
    rules: "",
    ownerName: "",
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Handle nested location object
    if (id === "location.lat" || id === "location.lng") {
      const key = id.split(".")[1];
      const numValue = parseFloat(value);
      setInfo(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: numValue
        }
      }));
      return;
    }

    // Handle numeric fields
    if (["vacancy", "capacity", "distanceFromCollege"].includes(id)) {
      setInfo(prev => ({
        ...prev,
        [id]: Number(value)
      }));
      return;
    }

    setInfo((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      const requiredFields = [
        'name',
        'category',
        'genderType',
        'distanceFromCollege',
        'address',
        'vacancy',
        'capacity',
        'contact',
        'ownerName'
      ];

      for (const field of requiredFields) {
        if (!info[field] && info[field] !== 0) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate location fields
      if (!info.location || typeof info.location.lat !== 'number' || typeof info.location.lng !== 'number') {
        throw new Error('Valid latitude and longitude are required');
      }

      // Validate latitude and longitude ranges
      if (info.location.lat < -90 || info.location.lat > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
      }
      if (info.location.lng < -180 || info.location.lng > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
      }

      // Validate numeric fields
      if (isNaN(info.vacancy) || info.vacancy < 0) {
        throw new Error('Vacancy cannot be negative');
      }
      if (isNaN(info.capacity) || info.capacity <= 0) {
        throw new Error('Capacity must be a positive number');
      }
      if (isNaN(info.distanceFromCollege) || info.distanceFromCollege < 0) {
        throw new Error('Distance cannot be negative');
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(info.contact)) {
        throw new Error('Invalid contact number format (10 digits required)');
      }

      // Upload images to Cloudinary
      if (!files || !files.length) {
        throw new Error('At least one image is required');
      }

      const list = await Promise.all(
        Object.values(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/adhy/image/upload",
            data
          );
          const { url } = uploadRes.data;
          return url;
        })
      );

      // Convert amenities and rules from string to arrays
      const amenitiesArray = info.amenities.split('\n').filter(item => item.trim());
      const rulesArray = info.rules.split('\n').filter(item => item.trim());

      const newHostel = {
        ...info,
        amenities: amenitiesArray,
        rules: rulesArray,
        photos: list,
        ownerContact: info.contact,
        vacancy: Number(info.vacancy),
        capacity: Number(info.capacity),
        distanceFromCollege: Number(info.distanceFromCollege) // This will be in meters
      };

      console.log("Sending hostel data:", newHostel);

      const response = await axios.post("/hostel", newHostel);
      console.log("Server response:", response);

      if (response.status === 200) {
        alert("Hostel added successfully!");
        navigate("/hostel");
      }
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Creation failed. Please check all required fields.");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>Add New Hostel</h1>
            <form onSubmit={handleClick}>
              {/* File Upload at the top */}
              <div className="formInput">
                <label>Images</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="image-input"
                  />
                  {files.length > 0 && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(files[0])}
                        alt="Hostel Preview"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Regular form inputs */}
              {hostelInputs
                .filter(input => input.id !== 'ownerContact' && input.id !== 'photos')
                .map((input) => (
                  <div className="formInput" key={input.id}>
                    {input.type === "checkbox" ? (
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id={input.id}
                          checked={info[input.id]}
                          onChange={handleChange}
                        />
                        <label>{input.label}</label>
                      </div>
                    ) : (
                      <>
                        <label>{input.label}</label>
                        {input.type === "select" ? (
                          <select 
                            id={input.id} 
                            onChange={handleChange}
                            required={input.required}
                          >
                            <option value="">Select {input.label}</option>
                            {input.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={input.id}
                            onChange={handleChange}
                            type={input.type}
                            placeholder={input.placeholder}
                            pattern={input.pattern}
                            required={input.required}
                            step={input.step}
                            min={input.min}
                            max={input.max}
                            value={
                              input.id.includes("location.") 
                                ? info.location?.[input.id.split(".")[1]] || ""
                                : info[input.id] || ""
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
              ))}

              {/* Amenities textarea */}
              <div className="formInput">
                <label>Amenities (one per line)</label>
                <textarea
                  id="amenities"
                  value={info.amenities}
                  onChange={handleChange}
                  placeholder="Enter amenities (one per line)&#10;Example:&#10;WiFi&#10;AC&#10;Power Backup"
                  rows={5}
                />
              </div>

              {/* Rules textarea */}
              <div className="formInput">
                <label>Rules (one per line)</label>
                <textarea
                  id="rules"
                  value={info.rules}
                  onChange={handleChange}
                  placeholder="Enter rules (one per line)&#10;Example:&#10;No smoking&#10;No pets&#10;No loud music after 10 PM"
                  rows={5}
                />
              </div>

              <button type="submit">Create Hostel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHostel;
