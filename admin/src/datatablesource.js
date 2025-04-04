import { Link } from "react-router-dom";
import axios from "axios";

export const userColumns = [
  {
    field: "name",
    headerName: "Name",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} alt="avatar" />
          {params.row.name}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 120,
  },
  {
    field: "isAdmin",
    headerName: "Admin",
    width: 100,
    renderCell: (params) => (
      <span className={`status ${params.row.isAdmin ? "admin" : "user"}`}>
        {params.row.isAdmin ? "Admin" : "User"}
      </span>
    ),
  },
];

export const hostelColumns = [
  {
    field: "name",
    headerName: "Hostel Name",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.photos && params.row.photos[0] || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"} 
            alt="hostel" 
          />
          {params.row.name}
        </div>
      );
    },
  },
  {
    field: "category",
    headerName: "Category",
    width: 120,
  },
  {
    field: "genderType",
    headerName: "For",
    width: 100,
    renderCell: (params) => (
      <span className={`gender ${params.row.genderType.toLowerCase()}`}>
        {params.row.genderType}
      </span>
    ),
  },
  {
    field: "vacancy",
    headerName: "Vacancy",
    width: 100,
  },
  {
    field: "capacity",
    headerName: "Total Capacity",
    width: 130,
  },
  {
    field: "distanceFromCollege",
    headerName: "Distance (m)",
    width: 130,
    renderCell: (params) => (
      <div>
        {(params.row.distanceFromCollege * 1000).toFixed(0)}
      </div>
    ),
  },
  {
    field: "contact",
    headerName: "Contact",
    width: 120,
  },
  {
    field: "ownerName",
    headerName: "Owner Name",
    width: 150,
  },
  {
    field: "viewRooms",
    headerName: "Rooms",
    width: 120,
    renderCell: (params) => (
      <div className="viewRoomsButton" onClick={() => params.row.onViewRooms(params.row._id)}>
        View Rooms
      </div>
    ),
  },
];

export const roomColumns = [
  {
    field: "roomNumber",
    headerName: "Room Number",
    width: 130,
  },
  {
    field: "hostelName",
    headerName: "Hostel Name",
    width: 200,
  }
];

export const restaurantColumns = [
  {
    field: "name",
    headerName: "Restaurant Name",
    width: 300,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.image || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"} 
            alt="restaurant" 
          />
          {params.row.name}
        </div>
      );
    },
  },
  {
    field: "distance",
    headerName: "Distance",
    width: 150,
  },
  {
    field: "deliveryAvailable",
    headerName: "Delivery",
    width: 130,
    renderCell: (params) => (
      <div className={`status ${params.row.deliveryAvailable ? "active" : "inactive"}`}>
        {params.row.deliveryAvailable ? "Available" : "Not Available"}
      </div>
    ),
  },
  {
    field: "contactNumber",
    headerName: "Contact",
    width: 150,
  }
];
