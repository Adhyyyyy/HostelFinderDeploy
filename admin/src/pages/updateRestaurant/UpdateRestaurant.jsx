import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { restaurantInputs } from "../../formSource";
import "../../styles/form.scss";

const UpdateRestaurant = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({
    deliveryAvailable: false,
    location: { latitude: 0, longitude: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`/restaurants/find/${restaurantId}`);
        setInfo(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (id.startsWith("location.")) {
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

    setInfo((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = info.image;

      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload");
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/adhy/image/upload",
          data
        );
        imageUrl = uploadRes.data.url;
      }

      const updateData = {
        ...info,
        image: imageUrl,
        map: `https://www.google.com/maps?q=${info.location.latitude},${info.location.longitude}`
      };

      await axios.put(`/restaurants/${restaurantId}`, updateData);
      navigate("/restaurants");
    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed!");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>Update Restaurant</h1>
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label>Image</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {(file || info.image) && (
                  <div className="image-preview">
                    <img
                      src={file ? URL.createObjectURL(file) : info.image}
                      alt="Restaurant Preview"
                    />
                  </div>
                )}
              </div>

              {restaurantInputs.map((input) => (
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
                      <input
                        id={input.id}
                        value={input.id.includes("location") 
                          ? info.location[input.id.split(".")[1]] 
                          : info[input.id] || ""}
                        onChange={handleChange}
                        type={input.type}
                        placeholder={input.placeholder}
                        pattern={input.pattern}
                        required={input.required}
                      />
                    </>
                  )}
                </div>
              ))}

              <button type="submit">Update Restaurant</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateRestaurant; 