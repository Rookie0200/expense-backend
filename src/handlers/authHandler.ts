import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { regesterUsers, loginUsers } from "../config";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const reqBody = regesterUsers.safeParse(req.body);
    if (!reqBody.success) {
      res.status(400).json({ message: "Please Check your inputs!!" });
      return;
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: reqBody.data.email });
    if (existingUser) {
      res
        .status(400)
        .json({ message: `User already exists with ${reqBody.data.email}` });
      return;
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(reqBody.data.password, 10);
    // Create new user
    const newUser = new User({
      name: reqBody.data.name,
      email: reqBody.data.email,
      password: hashedPassword,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: `User registered successfully with ID ${newUser._id}` });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const reqBody = loginUsers.safeParse(req.body);
    if (!reqBody.success) {
      res.status(400).json({ message: "Please check you inputs!!" });
      return;
    }
    // Check if user exists
    const user = await User.findOne({ email: reqBody.data.email });
    if (!user) {
      res
        .status(400)
        .json({ message: `No user found with email ${reqBody.data.email}` });
      return;
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(
      reqBody.data.password,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }
    // Create session token
    const sessionToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: sessionToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error });
    return;
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.header("Authorization")?.replace("Bearer ", "");
    if (!sessionToken) {
      res.status(400).json({ message: "No session token provided" });
      return;
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out user", error });
  }
};
