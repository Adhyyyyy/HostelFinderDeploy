import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import "./login.css";

function Login() {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", credentials);
            localStorage.setItem("token", res.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="login">
            <div className="lContainer">
                <h1>Login</h1>
                {error && <div className="error">{error}</div>}
                <input
                    type="text"
                    placeholder="username"
                    id="username"
                    onChange={handleChange}
                    className="lInput"
                />
                <input
                    type="password"
                    placeholder="password"
                    id="password"
                    onChange={handleChange}
                    className="lInput"
                />
                <button onClick={handleSubmit} className="lButton">
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;