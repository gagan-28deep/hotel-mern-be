import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  getAllHotels,
  searchHotels,
} from "../controllers/allHotels.controller.js";

const router = express.Router();

// router.route("/getAllHotels").get(getAllHotels);
router.route("/getAllHotels").post(searchHotels);

export default router;
