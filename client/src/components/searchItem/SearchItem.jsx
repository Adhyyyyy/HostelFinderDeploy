import React, { useState, useEffect } from "react";
import "./searchItem.css";

const SearchItem = ({ hostel, onBrowseRooms }) => {
  const [showMap, setShowMap] = useState(false);

  // Add useEffect to handle body class
  useEffect(() => {
    if (showMap) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showMap]);

  // Get the first image from the photos array, or use a default image if none exists
  const hostelImage = hostel.photos && hostel.photos.length > 0 
    ? hostel.photos[0]  // Use the first image from the array
    : "https://via.placeholder.com/150";  // Default image if no photos exist

  // Create Google Maps Embed URL
  const mapEmbedUrl = hostel.location
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${hostel.location.lat},${hostel.location.lng}&zoom=16`
    : "";

  return (
    <div className="searchItem">
      <img
        src={hostelImage}
        alt={hostel.name || "Hostel Image"}
        className="siImg"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = "https://via.placeholder.com/150"; // Fallback image if loading fails
        }}
      />
      <div className="siDesc">
        <h1 className="siTitle">{hostel.name || "No Name Available"}</h1>
        <span className="siCategory">{hostel.category || "Unknown"} - {hostel.genderType || "N/A"}</span>
        <span className="siDistance">{hostel.distanceFromCollege} m from college</span>
        <span className="siVacancy">Vacancy: {hostel.vacancy} beds</span>
        <span className="siCapacity">Capacity: {hostel.capacity} people</span>
        <span className="siAmenities">
          Amenities: {hostel.amenities?.length ? hostel.amenities.join(", ") : "None"}
        </span>
        <span className="siMess">
          Mess: {hostel.messType ? "Available " : "Not Available "}
        </span>
        <span className="siOwner">{hostel.ownerName} | {hostel.ownerContact}</span>
        <span className="siRules">
          Rules: {hostel.rules?.length ? hostel.rules.join(" | ") : "No specific rules"}
        </span>
      </div>

      <div className="siDetails">
        <button className="siCheckButton" onClick={() => onBrowseRooms(hostel._id)}>
          Browse Rooms
        </button>
        {hostel.location && (
          <button 
            className="siMapButton"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? 'Hide Map' : 'View Map'}
          </button>
        )}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="mapModal">
          <div className="mapModalContent">
            <button className="closeMapButton" onClick={() => setShowMap(false)}>×</button>
            <iframe
              title={`Map of ${hostel.name}`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${hostel.location.lat},${hostel.location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchItem;
