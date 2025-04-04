import Restaurant from "../models/Restaurant.js";

export const createRestaurant = async (req, res, next) => {
    const newRestaurant = new Restaurant(req.body);

    try {
        const savedRestaurant = await newRestaurant.save();
        res.status(200).json(savedRestaurant);
    } catch (error) {
        next(error);
    }
};

export const updateRestaurant = async (req, res, next) => {
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedRestaurant);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteRestaurant = async (req, res, next) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.status(200).json("Restaurant has been deleted");
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getRestaurants = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Default: 10 restaurants
        const restaurants = await Restaurant.find().limit(limit);
        res.status(200).json(restaurants);
    } catch (error) {
        next(error);
    }
};


export const countByDeliveryAvailability = async (req, res, next) => {
    try {
        const deliveryAvailableCount = await Restaurant.countDocuments({ deliveryAvailable: true });
        const deliveryNotAvailableCount = await Restaurant.countDocuments({ deliveryAvailable: false });

        res.status(200).json([
            { type: "Delivery Available", count: deliveryAvailableCount },
            { type: "No Delivery", count: deliveryNotAvailableCount }
        ]);
    } catch (err) {
        next(err);
    }
};
