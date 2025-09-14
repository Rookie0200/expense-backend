import express from "express";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../handlers/authHandler";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logoutUser);

export default router;
