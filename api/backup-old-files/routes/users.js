import express from "express";
import { createUser, updateUser, deleteUser, getUser, getUsers } from "../controllers/user.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();


router.post("/", createUser);


router.put("/:id",  updateUser);


router.delete("/:id",  deleteUser);


router.get("/:id",  getUser);


router.get("/", getUsers);

export default router;
