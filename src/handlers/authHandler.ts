import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userLoginSchema, userRegistrationSchema } from "../types/user";
// import { regesterUsers, loginUsers } from "../config";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = userRegistrationSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({ message: "Please Check your inputs!!" });
      return;
    }
    // Check if user already exists
    const existingUser = await User.findOne({
      email: validatedData.data.email,
    });
    if (existingUser) {
      res.status(400).json({
        message: `User already exists with ${validatedData.data.email}`,
      });
      return;
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.data.password, 10);
    // Create new user
    const newUser = new User({
      firstName: validatedData.data.firstName,
      lastName: validatedData.data.lastName,
      email: validatedData.data.email,
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
    const validatedData = userLoginSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({ message: "Please check you inputs!!" });
      return;
    }
    // Check if user exists
    const user = await User.findOne({ email: validatedData.data.email });
    if (!user) {
      res.status(400).json({
        message: `No user found with email ${validatedData.data.email}`,
      });
      return;
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(
      validatedData.data.password,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }
    // Create session token
    if (!process.env.JWT_SECRET) {
      res.status(400).json({ message: "JWT_SECRET key not found!!" });
      return;
    }
    const sessionToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const plainUser = user.toObject();
    res.status(200).json({
      message: "Login successful",
      token: sessionToken,
      user: plainUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error });
    return;
  }
};
export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.send(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    data: { user },
  });
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
