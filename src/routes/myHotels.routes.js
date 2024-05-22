import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createHotel } from "../controllers/myHotels.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

router.use(verifyJwt);

router.route("/").post(upload.array("imageFiles", 6), createHotel);

//  or
// router.route("/").post(upload.fields([
//     {
//         name : "imageFiles",
//         maxCount : 6
//     }
// ]))

export default router;
