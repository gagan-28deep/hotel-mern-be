import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
export const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, "../public/temp");

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// User Routes
import userRoutes from "./routes/user.routes.js";

// Hotel Routes
import hotelRoutes from "./routes/myHotels.routes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/hotel", hotelRoutes);
