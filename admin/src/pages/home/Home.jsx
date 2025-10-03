import "./home.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { FaBed, FaHotel, FaUsers, FaUtensils, FaChartLine, FaCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "../../axios";

const Home = () => {
  const [stats, setStats] = useState({
    totalHostels: 0,
    availableRooms: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch hostels count
        const hostelsResponse = await axios.get("/hostel");
        const hostelsData = hostelsResponse.data.data || hostelsResponse.data;
        const totalHostels = Array.isArray(hostelsData) ? hostelsData.length : 0;

        // Fetch rooms and count available ones
        const roomsResponse = await axios.get("/rooms");
        const roomsData = roomsResponse.data.data || roomsResponse.data;
        const availableRooms = Array.isArray(roomsData) ? roomsData.filter(room => room.isAvailable).length : 0;

        // Fetch users count
        const usersResponse = await axios.get("/users");
        const usersData = usersResponse.data.data || usersResponse.data;
        const activeUsers = Array.isArray(usersData) ? usersData.length : 0;

        setStats({
          totalHostels,
          availableRooms,
          activeUsers
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const featureCards = [
    {
      icon: <FaHotel />,
      title: "Hostel Management",
      description: "Add, update, and manage hostel listings with ease"
    },
    {
      icon: <FaBed />,
      title: "Room Control",
      description: "Monitor room availability and occupancy status"
    },
    {
      icon: <FaUsers />,
      title: "User Management",
      description: "Handle user accounts and access permissions"
    },
    {
      icon: <FaUtensils />,
      title: "Restaurant Management",
      description: "Manage nearby restaurants and their details"
    },
    {
      icon: <FaBed />,
      title: "Bed Management",
      description: "Track and manage bed allocations in rooms"
    },
    {
      icon: <FaHotel />,
      title: "Hostel Categories",
      description: "Organize hostels by type and gender categories"
    }
  ];

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="welcome-section">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Manage your hostels, rooms, and user data efficiently with our comprehensive admin tools.</p>
        </div>
        
        <div className="feature-cards">
          {featureCards.map((card, index) => (
            <div className="feature-card" key={index}>
              <div className="icon-container">
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>

        <div className="stats-section">
          <div className="stat-card total-hostels">
            <h4>Total Hostels</h4>
            <div className="stat-value">
              {stats.totalHostels}
            </div>
          </div>
          <div className="stat-card total-rooms">
            <h4>Available Rooms</h4>
            <div className="stat-value">
              {stats.availableRooms}
            </div>
          </div>
          <div className="stat-card total-users">
            <h4>Active Users</h4>
            <div className="stat-value">
              {stats.activeUsers}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 