import Hostel from "../models/Hostel.js";


export const createHostel = async (req, res) => {
  try {
    const {
      name,
      category,
      genderType,
      distanceFromCollege,
      address,
      vacancy,
      capacity,
      contact,
      ownerName,
      ownerContact,
      photos,  // Array of image URLs
      amenities,
      rules,
      messType,
      location
    } = req.body;

    const newHostel = new Hostel({
      name,
      category,
      genderType,
      distanceFromCollege,
      address,
      vacancy,
      capacity,
      contact,
      ownerName,
      ownerContact,
      photos: photos || [],  // Save the array of image URLs
      amenities,
      rules,
      messType,
      location
    });

    const savedHostel = await newHostel.save();
    res.status(200).json(savedHostel);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateHostel = async (req, res, next) => {
  try {
    const updatedHostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHostel);
  } catch (err) {
    next(err);
  }
};

export const deleteHostel = async (req, res, next) => {
  try {
    await Hostel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};


export const getHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    res.status(200).json(hostel);
  } catch (err) {
    next(err);
  }
};

export const getHostels = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" }; // Case-insensitive partial match
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.genderType) {
      query.genderType = req.query.genderType;
    }
    if (req.query.messType) {
      query.messType = req.query.messType;
    }
    if (req.query.pricing) {
      query.pricing = req.query.pricing;
    }

    const hostels = await Hostel.find(query).limit(req.query.limit || 10); // Default limit to 10
    res.status(200).json(hostels);
  } catch (err) {
    next(err);
  }
};

// Count Hostels by Gender (Boys/Girls)
export const countByGender = async (req, res, next) => {
  try {
    const genders = req.query.gender.split(","); // Example: ?gender=Boys,Girls
    const list = await Promise.all(
      genders.map(gender => Hostel.countDocuments({ genderType: gender }))
    );
    res.status(200).json(list);
  } catch (error) {
    console.error("Error counting hostels by gender:", error.message);
    next(error); // Pass error to global error handler
  }
};

// Count Hostels by Category (PG/Hostel)
export const countByCategory = async (req, res, next) => {
  try {
    const pgCount = await Hostel.countDocuments({ category: "PG" });
    const hostelCount = await Hostel.countDocuments({ category: "Hostel" });

    res.status(200).json([
      { type: "PG", count: pgCount },
      { type: "Hostel", count: hostelCount }
    ]);
  } catch (err) {
    console.error("Error counting hostels by category:", err.message);
    next(err); // Pass error to global error handler
  }
};
