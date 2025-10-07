
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
export function getMonthStartEndDates(monthYear: string): { startDate: Date; endDate: Date } {
    const [yearStr, monthStr] = monthYear.split('-');
    const year = parseInt(yearStr as string);
    const month = parseInt(monthStr as string) - 1; // Months are 0-indexed in JS Date

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Day 0 of the next month is the last day of the current month
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day

    return { startDate, endDate };
}

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


