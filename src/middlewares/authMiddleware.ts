import type { Response, NextFunction } from "express";
import { CustomRequest } from "../../types";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    const token = req.cookies["token"];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!JWT_SECRET) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" });
  }
};
