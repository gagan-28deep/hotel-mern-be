import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createHotel,
  getAllHotelsOfUser,
  getHotelById,
  updateHotelById,
} from "../controllers/myHotels.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

router.use(verifyJwt);

// Create a new hotel
router.route("/").post(upload.array("imageFiles", 6), createHotel);

//  or
// router.route("/").post(upload.fields([
//     {
//         name : "imageFiles",
//         maxCount : 6
//     }
// ]))

// Get all hotels
router.route("/").get(getAllHotelsOfUser);

// Get a particular hotel by id
router.route("/:id").get(getHotelById);

// Updata a hotel details
router.route("/:id").put(upload.array("imageFiles", 6), updateHotelById);

export default router;
