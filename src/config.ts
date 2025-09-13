import zod from "zod";

export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET;
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectToDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error("DATABASE_URL is not defined in environment variables.");
      return;
    }
    await mongoose.connect(dbUrl);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

//types definations
export const regesterUsers = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
});
export const loginUsers = zod.object({
  email: zod.string(),
  password: zod.string(),
});

