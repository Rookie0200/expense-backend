import express from "express";
import routes from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDB } from "./config";
const PORT = process.env.PORT || 8000;
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectToDB();
app.get("/", (req, res) => {
  res.json({ message: "welcome to Server" });
});
app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
export default app;
