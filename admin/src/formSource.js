export const hostelInputs = [
  { id: "name", label: "Name", type: "text", placeholder: "Enter hostel name", required: true },
  { id: "category", label: "Category", type: "select", placeholder: "Select category", options: ["Hostel", "PG"], required: true },
  { id: "genderType", label: "Gender Type", type: "select", placeholder: "Select gender type", options: ["Boys", "Girls"], required: true },
  {
    id: "distanceFromCollege",
    label: "Distance from College (in meters)",
    type: "number",
    placeholder: "Enter distance in meters",
    required: true
  },
  { id: "address", label: "Address", type: "text", placeholder: "Enter address", required: true },
  { id: "vacancy", label: "Vacancy", type: "number", placeholder: "Enter vacancy", required: true },
  { id: "capacity", label: "Capacity", type: "number", placeholder: "Enter capacity", required: true },
  { id: "contact", label: "Contact", type: "text", placeholder: "Enter contact number", pattern: "[0-9]{10}", required: true },
  { id: "ownerName", label: "Owner Name", type: "text", placeholder: "Enter owner name", required: true },
  { id: "ownerContact", label: "Owner Contact", type: "text", placeholder: "Enter owner contact number", pattern: "[0-9]{10}", required: false },
  { id: "location.lat", label: "Latitude", type: "number", placeholder: "Enter latitude (e.g., 9.459291491037504)", required: true, step: "0.000000000000001", min: -90, max: 90 },
  { id: "location.lng", label: "Longitude", type: "number", placeholder: "Enter longitude (e.g., 76.43840580673472)", required: true, step: "0.000000000000001", min: -180, max: 180 },
  { id: "messType", label: "Mess Available", type: "checkbox", required: false },
  { id: "photos", label: "Hostel Image", type: "image", required: true }
];

export const roomInputs = [
  { id: "roomNumber", label: "Room Number", type: "text", placeholder: "Enter room number", required: true },
  { id: "roomType", label: "Room Type", type: "select", options: ["Single", "Double", "Triple", "Quad", "Five", "Six"], required: true },
  { id: "price", label: "Price (₹)", type: "number", placeholder: "Enter room price", required: true },
  { id: "isAvailable", label: "Available", type: "checkbox", required: true }
];

export const userInputs = [
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
  { id: "email", label: "Email", type: "email", placeholder: "john_doe@gmail.com", required: true },
  { id: "phone", label: "Phone Number", type: "text", placeholder: "9876543210", required: true },
  { id: "password", label: "Password", type: "password", placeholder: "Minimum 6 characters", required: true },
  { id: "isAdmin", label: "Admin User", type: "checkbox", required: false }
];

export const restaurantInputs = [
  { 
    id: "name", 
    label: "Restaurant Name", 
    type: "text", 
    placeholder: "Enter restaurant name",
    required: true 
  },
  { 
    id: "distance", 
    label: "Distance from College", 
    type: "text", 
    placeholder: "Enter distance",
    required: true 
  },
  { 
    id: "contactNumber", 
    label: "Contact Number", 
    type: "text", 
    placeholder: "Enter contact number",
    pattern: "[0-9]{10}",
    required: true 
  },
  { 
    id: "deliveryAvailable", 
    label: "Delivery Available", 
    type: "checkbox",
    required: false 
  },
  {
    id: "location.latitude",
    label: "Latitude",
    type: "number",
    placeholder: "Enter latitude",
    required: true
  },
  {
    id: "location.longitude",
    label: "Longitude",
    type: "number",
    placeholder: "Enter longitude",
    required: true
  }
];
