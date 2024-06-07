import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  getAllHotels,
  searchHotels,
  viewHotelById,
} from "../controllers/allHotels.controller.js";

const router = express.Router();

// router.route("/getAllHotels").get(getAllHotels);
router.route("/getAllHotels").post(searchHotels);
router.route("/viewHotelById/:id").get(viewHotelById);

export default router;
