import User from "../models/Users.js";
import bcrypt from "bcrypt";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

// User Registration
export const register = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
           ...req.body,
           password: hash,
        });

        await newUser.save();
        res.status(200).send("User has been created.");
    } catch (err) {
        next(err);
    }
};

// User Login
export const login = async (req, res, next) => {
    try {
        console.log("Login attempt with:", req.body);
        
        const user = await User.findOne({ email: req.body.email });
        console.log("User found:", user ? "Yes" : "No");
        
        if (!user) {
            console.log("User not found in database!");
            return next(createError(404, "User not found!"));
        }

        const isPasswordCorrect = await bcrypt.compare(
            req.body.password, user.password
        );
        console.log("Password correct:", isPasswordCorrect ? "Yes" : "No");
        
        if (!isPasswordCorrect) {
            console.log("Incorrect password!");
            return next(createError(400, "Wrong password or email!"));
        }

        if (!user.isAdmin) {
            console.log("User is not an admin!");
            return next(createError(403, "Access denied. Admin only."));
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        );

        const { password, ...otherDetails } = user._doc;

        res
        .cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
        .status(200)
        .json({ details: { ...otherDetails }, isAdmin: user.isAdmin });

    } catch (err) {
        console.error("Login error:", err);
        next(err);
    }
};
