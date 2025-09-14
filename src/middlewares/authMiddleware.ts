import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

declare global {
  namespace Express {
    interface Request {
      userId?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken = req.header("Authorization")?.replace("Bearer ", "");
    if (!sessionToken) {
      res.status(400).json({ message: "No access token provided" });
      return;
    }
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Internal Server Error" });
    }
    const decodedToken = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET
    ) as any;
    // const user = await User.findById(decodedToken.userId);
    // if (!user) {
    //   return res.status(401).json({ message: "Unauthorized: User not found" });
    // }
    console.log("Decoded Token with userId is :", decodedToken.userId);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export default authMiddleware;
