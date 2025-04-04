import "../../styles/form.scss";
import { useState } from "react";
import { restaurantInputs } from "../../formSource";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const NewRestaurant = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({
    deliveryAvailable: false,
    location: { latitude: 0, longitude: 0 }
  });

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

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // Upload image to Cloudinary
      if (!file) {
        throw new Error('Image is required');
      }

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload");
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/adhy/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newRestaurant = {
        ...info,
        image: url,
        map: `https://www.google.com/maps?q=${info.location.latitude},${info.location.longitude}`
      };

      await axios.post("/restaurants", newRestaurant);
      navigate("/restaurants");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>Add New Restaurant</h1>
            <form onSubmit={handleClick}>
              <div className="formInput">
                <label>Image</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                {file && (
                  <div className="image-preview">
                    <img
                      src={URL.createObjectURL(file)}
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

              <button type="submit">Create Restaurant</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRestaurant; 