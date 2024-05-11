import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// User Routes
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/user", userRoutes);
