import { useState, useEffect } from "react";
import axios from "axios";
import "./reviewBox.css";

const ReviewBox = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewData, setReviewData] = useState({
    entityId: "",
    entityType: "Hostel",
    rating: 5,
    review: "",
    userName: ""
  });

  useEffect(() => {
    fetchEntities();
    fetchReviews();
  }, [reviewData.entityType]);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const endpoint = reviewData.entityType === "Hostel" ? "/hostel" : "/restaurants";
      const response = await axios.get(`http://localhost:8800/api${endpoint}`);
      
      const data = reviewData.entityType === "Hostel" ? response.data : response.data;
      setEntities(data);
    } catch (error) {
      console.error("Error fetching entities:", error);
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:8800/api/reviews");
      setReviews(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.entityId || !reviewData.review || !reviewData.userName) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const selectedEntity = entities.find(e => e._id === reviewData.entityId);
      
      if (!selectedEntity) {
        throw new Error("Selected entity not found");
      }

      const payload = {
        ...reviewData,
        entityName: selectedEntity.name
      };

      await axios.post("http://localhost:8800/api/reviews", payload);
      alert("Review submitted successfully!");
      
      setReviewData({
        entityId: "",
        entityType: "Hostel",
        rating: 5,
        review: "",
        userName: ""
      });
      
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reviewBox">
      <h2>Share Your Experience</h2>
      <form onSubmit={handleSubmit} className="reviewForm">
        <div className="formGroup">
          <label>Type</label>
          <select
            value={reviewData.entityType}
            onChange={(e) => {
              setReviewData({
                ...reviewData,
                entityType: e.target.value,
                entityId: ""
              });
            }}
          >
            <option value="Hostel">Hostel</option>
            <option value="Restaurant">Restaurant</option>
          </select>
        </div>

        <div className="formGroup" style={{ gridColumn: "span 2" }}>
          <label>Select {reviewData.entityType}</label>
          <select
            value={reviewData.entityId}
            onChange={(e) => setReviewData({...reviewData, entityId: e.target.value})}
          >
            <option value="">Select {reviewData.entityType}</option>
            {entities.map(entity => (
              <option key={entity._id} value={entity._id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        <div className="formGroup">
          <label>Rating</label>
          <select
            value={reviewData.rating}
            onChange={(e) => setReviewData({...reviewData, rating: Number(e.target.value)})}
          >
            {[5,4,3,2,1].map(num => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </select>
        </div>

        <div className="formGroup" style={{ gridColumn: "span 2" }}>
          <label>Your Name</label>
          <input
            type="text"
            value={reviewData.userName}
            onChange={(e) => setReviewData({...reviewData, userName: e.target.value})}
            placeholder="Enter your name"
          />
        </div>

        <div className="formGroup full-width">
          <label>Your Review</label>
          <textarea
            value={reviewData.review}
            onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
            placeholder="Share your experience here..."
            rows={3}
          />
        </div>

        <button type="submit" className="submitButton" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      <div className="reviewsSection">
        <h3>Recent Reviews</h3>
        <div className="reviewsList">
          {reviews.map((review) => (
            <div key={review._id} className="reviewCard">
              <div className="reviewHeader">
                <div className="reviewerInfo">
                  <span className="reviewerName">{review.userName}</span>
                  <span className="entityName">
                    {review.entityType}: {review.entityName}
                  </span>
                </div>
                <div className="rating">
                  {review.rating} {'⭐'.repeat(review.rating)}
                </div>
              </div>
              <p className="reviewText">{review.review}</p>
              <span className="reviewDate">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="noReviews">No reviews yet. Be the first to write one!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewBox; 