import express from "express";
import routes from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDB } from "./config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const PORT = process.env.PORT || 8000;
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    // origin: process.env.FRONTEND_URL || "http://localhost:5173",
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
// app.use(limiter);
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectToDB();
app.get("/", (req, res) => {
  res.json({ message: "welcome to Server" });
});
app.use("/api/v1", routes);

// Add API endpoints for transactions and budgets

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
export default app;
