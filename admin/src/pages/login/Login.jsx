import axiosInstance from "../../utils/axiosConfig";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.scss";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });

    try {
      // Log the attempt
      console.log("Login attempt with email:", credentials.email);

      const res = await axiosInstance.post("/auth/login", credentials);
      
      console.log("Server response:", res.data);

      if (res.data.isAdmin) {
        // Successfully logged in as admin
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
        localStorage.setItem("user", JSON.stringify(res.data.details));
        navigate("/");
      } else {
        // Not an admin
        dispatch({
          type: "LOGIN_FAILURE",
          payload: { message: "Access denied. Admin only." },
        });
      }
    } catch (err) {
      // Detailed error logging
      console.error("Login error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Handle different error cases
      let errorMessage;
      if (err.response?.status === 404) {
        errorMessage = "Email not found";
      } else if (err.response?.status === 400) {
        errorMessage = "Incorrect password";
      } else if (err.response?.status === 403) {
        errorMessage = "Not authorized as admin";
      } else if (err.message === "Network Error") {
        errorMessage = "Cannot connect to server";
      } else {
        errorMessage = err.response?.data?.message || "Login failed";
      }

      dispatch({
        type: "LOGIN_FAILURE",
        payload: { message: errorMessage }
      });
    }
  };

  const handleGoBack = () => {
    window.location.href = "http://localhost:3000/";
  };

  return (
    <div className="login">
      <div className="lContainer">
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={credentials.email}
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={credentials.password}
          onChange={handleChange}
          className="lInput"
        />
        <button 
          disabled={loading} 
          onClick={handleClick} 
          className="lButton"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <button 
          onClick={handleGoBack} 
          className="goBackButton"
        >
          Go Back to Home
        </button>
        {error && <div className="error">{error.message}</div>}
      </div>
    </div>
  );
};

export default Login;
