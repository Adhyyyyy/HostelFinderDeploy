import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/restaurants");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMap, setShowMap] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className="fp">
      {data?.map((restaurant) => (
        <div className="fpItem" key={restaurant._id}>
          <img
            src={restaurant.image || "https://via.placeholder.com/150"}
            alt={restaurant.name || "Restaurant Image"}
            className="fpImg"
          />
          <span className="fpName">{restaurant.name || "No Name Available"}</span>
          <span className="fpCity">Distance from college: {restaurant.distance || "Unknown"}</span>
          <span className="fpPrice">
            {restaurant.deliveryAvailable ? "Delivery Available" : "No Delivery"}
          </span>
          <div className="fpRating">
            <button 
              className="mapButton"
              onClick={() => {
                setSelectedRestaurant(restaurant);
                setShowMap(true);
              }}
            >
              View Map
            </button>
          </div>
          <div className="fpContact">Contact: {restaurant.contactNumber || "Not Available"}</div>
        </div>
      ))}

      {/* Map Modal */}
      {showMap && selectedRestaurant && (
        <div className="mapModal">
          <div className="mapModalContent">
            <button className="closeMapButton" onClick={() => setShowMap(false)}>×</button>
            <iframe
              title={`Map of ${selectedRestaurant.name}`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${selectedRestaurant.location.latitude},${selectedRestaurant.location.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProperties;
