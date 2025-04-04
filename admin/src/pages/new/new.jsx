import "../../styles/form.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";

const New = ({ inputs, title }) => {
  const [info, setInfo] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const path = window.location.pathname.split("/")[1];
      await axios.post(`/${path}`, info);
      alert(`${path.charAt(0).toUpperCase() + path.slice(1)} created successfully!`);
      navigate(`/${path}`);
    } catch (err) {
      console.error("Creation failed:", err);
      alert(err.response?.data?.message || "Creation failed. Please try again.");
    }
  };

  const renderInput = (input) => {
    switch (input.type) {
      case 'select':
        return (
          <select
            id={input.id}
            onChange={handleChange}
            required={input.required}
          >
            <option value="">Select {input.label}</option>
            {input.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="checkbox-container">
            <input
              type="checkbox"
              id={input.id}
              onChange={handleChange}
            />
            <label>{input.label}</label>
          </div>
        );
      default:
        return (
          <input
            type={input.type}
            id={input.id}
            placeholder={input.placeholder}
            onChange={handleChange}
            required={input.required}
          />
        );
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="form">
          <div className="formContainer">
            <h1>{title}</h1>
            <form onSubmit={handleClick}>
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  {input.type !== 'checkbox' && <label>{input.label}</label>}
                  {renderInput(input)}
                </div>
              ))}
              <button type="submit">Create</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
