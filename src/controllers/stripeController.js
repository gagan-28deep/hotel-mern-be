import Stripe from "stripe";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";
dotenv.config({
  path: "../../.env",
});

const stripe = new Stripe(process.env.STRIPE_API_KEY);

const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const numberOfNights = req?.body?.data;
  const hotelId = req.params.hotelId;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    const error = new ApiError(400, "No hotel found");
    return handleErrorResponse(res, error);
  }
  const totalCost = numberOfNights * hotel.pricePerNight;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCost * 100,
    currency: "usd",
    metadata: {
      hotelId,
      userId: req?.user?._id?.toString(),
    },
  });
  if (!paymentIntent?.client_secret) {
    const error = new ApiError(
      500,
      "Something went wrong while creating payment intent"
    );
    return handleErrorResponse(res, error);
  }

  const response = {
    paymentIntentId: paymentIntent?.id,
    clientSecret: paymentIntent?.client_secret?.toString(),
    totalCost,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, { response }, "Payment intent created successfully")
    );
});
