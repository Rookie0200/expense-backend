
export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET;
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// In-memory data store (for demo; replace with DB in production)
// export const budgets: Budget[] = [];

// Helper to generate unique IDs


export const connectToDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error("DATABASE_URL is not defined in environment variables.");
      return;
    }
    await mongoose.connect(dbUrl);
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected at", dbUrl);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

//types definations
// export const regesterUsers = zod.object({
//   name: zod.string(),
//   email: zod.string().email(),
//   password: zod.string().min(6),
// });
// export const loginUsers = zod.object({
//   email: zod.string(),
//   password: zod.string(),
// });

// // Transaction validation
// export const transactionSchema = zod.object({
//   amount: zod.number(),
//   description: zod.string(),
//   date: zod.string(),
//   type: zod.enum(["income", "expense"]),
//   category: zod.string().optional(),
// });

// // Budget validation
// export const budgetSchema = zod.object({
//   category: zod.string().min(1).max(50),
//   amount: zod.number().positive(),
//   month: zod.string().min(1).max(20),
// });


