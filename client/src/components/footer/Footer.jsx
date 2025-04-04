import "./footer.css";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerSection">
          <h3>HostelFinder</h3>
          <p>Finding your perfect accommodation made easy.</p>
          <div className="socialLinks">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footerSection">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/hostel">Hostels</Link></li>
            <li><Link to="/">Restaurants</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footerSection">
          <h4>Contact Info</h4>
          <ul className="contactInfo">
            <li>
              <FaPhone /> <span>+91 1234567890</span>
            </li>
            <li>
              <FaEnvelope /> <span>info@hostelfinder.com</span>
            </li>
            <li>
              <FaMapMarkerAlt /> <span>123 College Street, City, State</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footerBottom">
        <p>&copy; {new Date().getFullYear()} HostelFinder. All rights reserved.</p>
        <div className="footerBottomLinks">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
