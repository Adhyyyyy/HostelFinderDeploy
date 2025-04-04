import "./navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{color:"inherit", textDecoration:"none"}}>
          <span className="logo">HostelFinder</span>
        </Link>
        <div className="navItems">
          <Link to="/admin" className="dashboardButton">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
