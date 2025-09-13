import express from "express";
import { loginUser, logoutUser, registerUser } from "../handlers/authHandler";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

export default router;
