import "./update.scss";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { userInputs, hostelInputs, roomInputs } from "../../formSource";
import "../../styles/form.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

// Map frontend paths to API endpoints and their structures
const apiConfig = {
  "rooms": {
    path: "rooms",
    findEndpoint: (id) => `http://localhost:8800/api/rooms/${id}`,
    updateEndpoint: (id) => `http://localhost:8800/api/rooms/${id}`
  },
  "hostel": {
    path: "hostel",
    findEndpoint: (id) => `http://localhost:8800/api/hostel/find/${id}`,
    updateEndpoint: (id) => `http://localhost:8800/api/hostel/${id}`
  },
  "users": {
    path: "users",
    findEndpoint: (id) => `http://localhost:8800/api/users/${id}`,
    updateEndpoint: (id) => `http://localhost:8800/api/users/${id}`
  },
  "restaurants": {
    path: "restaurant",
    findEndpoint: (id) => `http://localhost:8800/api/restaurant/${id}`,
    updateEndpoint: (id) => `http://localhost:8800/api/restaurant/${id}`
  }
};

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/")[1] === "update" ? "hostel" : location.pathname.split("/")[1];
  
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine which inputs to use based on path
  const getInputs = () => {
    switch(path) {
      case "hostel":
        return hostelInputs;
      case "rooms":
        return roomInputs;
      case "users":
        return userInputs;
      default:
        console.warn("Unknown path:", path);
        return [];
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug information
        console.log("Current path:", path);
        console.log("Current ID:", id);
        console.log("Full URL:", location.pathname);
        
        const config = apiConfig[path] || { 
          path, 
          findEndpoint: (id) => `http://localhost:8800/api/${path}/${id}`,
          updateEndpoint: (id) => `http://localhost:8800/api/${path}/${id}`
        };
        
        const apiUrl = config.findEndpoint(id);
        console.log("Fetching from:", apiUrl);
        
        const fetchResponse = await axios.get(apiUrl);
        console.log("Received data:", fetchResponse.data);
        
        // Transform the data for hostels
        if (path === "hostel") {
          const hostelData = fetchResponse.data;
          if (hostelData.amenities && Array.isArray(hostelData.amenities)) {
            hostelData.amenities = hostelData.amenities.join('\n');
          }
          if (hostelData.rules && Array.isArray(hostelData.rules)) {
            hostelData.rules = hostelData.rules.join('\n');
          }
          setInfo(hostelData);
        } else {
          setInfo(fetchResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url
        });
        setError(
          err.response?.data?.message || 
          err.message || 
          `Error fetching ${path} data. Please check if the ID is correct.`
        );
        setLoading(false);
      }
    };
    
    if (id && path) {
      fetchItem();
    } else {
      setError(`Invalid URL parameters - ID: ${id}, Path: ${path}`);
      setLoading(false);
    }
  }, [id, path, location.pathname]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Handle nested location object for hostels
    if (id === "location.lat" || id === "location.lng") {
      const key = id.split(".")[1];
      setInfo(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: Number(value)
        }
      }));
      return;
    }

    // Handle numeric fields
    if (["vacancy", "capacity", "distanceFromCollege", "price"].includes(id)) {
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
      let updateData = { ...info };

      // Handle file uploads if there are new files
      if (files.length > 0) {
        const list = await Promise.all(
          Object.values(files).map(async (file) => {
            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", "upload");
            const uploadRes = await axios.post(
              "https://api.cloudinary.com/v1_1/adhy/image/upload",
              data
            );
            return uploadRes.data.url;
          })
        );
        updateData.photos = list;
      }

      // Handle amenities and rules for hostels
      if (path === "hostel") {
        if (typeof updateData.amenities === 'string') {
          updateData.amenities = updateData.amenities.split('\n').filter(item => item.trim());
        }
        if (typeof updateData.rules === 'string') {
          updateData.rules = updateData.rules.split('\n').filter(item => item.trim());
        }
      }

      const config = apiConfig[path] || { 
        path, 
        findEndpoint: (id) => `http://localhost:8800/api/${path}/${id}`,
        updateEndpoint: (id) => `http://localhost:8800/api/${path}/${id}`
      };
      
      const updateUrl = config.updateEndpoint(id);
      console.log(`Updating: ${updateUrl}`, updateData); // Debug log
      const updateResponse = await axios.put(updateUrl, updateData);
      if (updateResponse.status === 200) {
        alert("Updated successfully!");
        navigate(`/${path}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="loading-container">
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="error-container">
            <div className="error-message">Error: {error}</div>
            <button onClick={() => navigate(`/${path}`)}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>Update {path.charAt(0).toUpperCase() + path.slice(1)}</h1>
            <form onSubmit={handleClick}>
              {/* File Upload for images */}
              {path === "hostel" && (
                <div className="formInput">
                  <label>Images</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                      className="image-input"
                    />
                    {files.length > 0 ? (
                      <div className="image-preview">
                        <img
                          src={URL.createObjectURL(files[0])}
                          alt="Preview"
                        />
                      </div>
                    ) : info.photos?.length > 0 && (
                      <div className="image-preview">
                        <img
                          src={info.photos[0]}
                          alt="Current"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Regular form inputs */}
              {getInputs()
                .filter(input => input.id !== 'photos' && input.id !== 'ownerContact')
                .map((input) => (
                  <div className="formInput" key={input.id}>
                    {input.type === "checkbox" ? (
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id={input.id}
                          checked={info[input.id] || false}
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
                            value={info[input.id] || ""}
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
                            value={
                              input.id.includes("location.") 
                                ? info.location?.[input.id.split(".")[1]] || ""
                                : info[input.id] || ""
                            }
                            pattern={input.pattern}
                            required={input.required}
                            step={input.step}
                            min={input.min}
                            max={input.max}
                          />
                        )}
                      </>
                    )}
                  </div>
              ))}

              {/* Amenities and Rules textareas for hostels */}
              {path === "hostel" && (
                <>
                  <div className="formInput">
                    <label>Amenities (one per line)</label>
                    <textarea
                      id="amenities"
                      value={Array.isArray(info.amenities) ? info.amenities.join('\n') : info.amenities || ''}
                      onChange={handleChange}
                      placeholder="Enter amenities (one per line)"
                      rows={5}
                    />
                  </div>
                  <div className="formInput">
                    <label>Rules (one per line)</label>
                    <textarea
                      id="rules"
                      value={Array.isArray(info.rules) ? info.rules.join('\n') : info.rules || ''}
                      onChange={handleChange}
                      placeholder="Enter rules (one per line)"
                      rows={5}
                    />
                  </div>
                </>
              )}

              <button type="submit">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Update; 