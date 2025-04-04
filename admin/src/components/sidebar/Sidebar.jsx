import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HotelIcon from '@mui/icons-material/Hotel';
import LocalHotelIcon from '@mui/icons-material/LocalHotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const { dispatch: authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" });
    
    window.location.href = "http://localhost:3000/";
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">HostelFinder</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <li>
            <DashboardIcon className="icon" />
            <span>Dashboard</span>
          </li>
          <p className="title">LISTS</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Users</span>
            </li>
          </Link>
          <Link to="/hostel" style={{ textDecoration: "none" }}>
            <li>
              <LocalHotelIcon className="icon" />
              <span>Hostels</span>
            </li>
          </Link>
          <Link to="/rooms" style={{ textDecoration: "none" }}>
            <li>
              <HotelIcon className="icon" />
              <span>Rooms</span>
            </li>
          </Link>
          <Link to="/beds" style={{ textDecoration: "none" }}>
            <li>
              <HotelIcon className="icon" />
              <span>Beds</span>
            </li>
          </Link>
          <Link to="/restaurants" style={{ textDecoration: "none" }}>
            <li>
              <RestaurantIcon className="icon" />
              <span>Restaurants</span>
            </li>
          </Link>
          <li onClick={handleLogout}>
            <ExitToAppIcon className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;

export const sidebarItems = [
  // ... existing items ...
  {
    title: "Beds",
    path: "/beds",
    icon: <HotelIcon />, // You can use any appropriate icon
    list: [
      {
        title: "Manage Beds",
        path: "/beds"
      }
    ]
  }
];
