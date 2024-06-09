import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  bookHotel,
  getAllHotels,
  searchHotels,
  viewHotelById,
} from "../controllers/allHotels.controller.js";
import { createPaymentIntent } from "../controllers/stripeController.js";

const router = express.Router();

router.route("/getAllRegisteredHotels").get(getAllHotels);
router.route("/getAllHotels").post(searchHotels);
router.route("/viewHotelById/:id").get(viewHotelById);

// Booking Hotel
router.route("/:hotelId/bookings").post(verifyJwt, bookHotel);

// Stripe Routes
router
  .route("/:hotelId/bookings/payment-intent")
  .post(verifyJwt, createPaymentIntent);

export default router;
