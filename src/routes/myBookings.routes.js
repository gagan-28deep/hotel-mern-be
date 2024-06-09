import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { myBookings } from "../controllers/myBookings.controller.js";

const router = express.Router();

router.route("/").get(verifyJwt, myBookings);

export default router;
