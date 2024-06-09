import express from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

export const myBookings = asyncHandler(async (req, res) => {
  const hotel = await Hotel.find({
    bookings: {
      $elemMatch: {
        userId: req.user._id,
      },
    },
  });

  const results = hotel.map((hotel) => {
    const userBookings = hotel?.bookings?.filter((booking) => {
      return booking?.userId?.toString() === req.user._id.toString();
    });

    const hotelWithUserBookings = {
      ...hotel.toObject(),
      bookings: userBookings,
    };

    return hotelWithUserBookings;
  });

  if (!results) {
    const error = new ApiError(400, "No bookings found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { results }, "Bookings Found Successfully"));
});
