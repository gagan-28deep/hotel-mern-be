import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config({
  path: "../../.env",
});

const stripe = new Stripe(process.env.STRIPE_API_KEY);

// Handle error response
const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Get all the hotels
export const getAllHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find().sort({ createdAt: -1 });
  if (!hotels) {
    const error = new ApiError(400, "No hotels found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { hotels }, "Hotels Found Successfully"));
});

export const viewHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({
    _id: req.params.id,
  });
  if (!hotel) {
    const error = new ApiError(400, "No hotel found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel Found Successfully"));
});

// Get hotels based on search

export const searchHotels = asyncHandler(async (req, res) => {
  const query = constructSearchQuery(req?.body);

  // Const sortings
  let sortOptions = {};
  switch (req?.body?.sortOption) {
    case "starRating":
      sortOptions = { starRating: -1 };
      break;
    case "pricePerNightAsc":
      sortOptions = { pricePerNight: 1 };
      break;
    case "pricePerNightDesc":
      sortOptions = { pricePerNight: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }
  const pageSize = 5;
  const pageNumber = parseInt(req?.query?.page?.toString() || "1");
  const skip = (pageNumber - 1) * pageSize;
  const hotels = await Hotel.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(pageSize);

  if (!hotels) {
    const error = new ApiError(400, "No hotels found");
    return handleErrorResponse(res, error);
  }
  const totalHotels = await Hotel.countDocuments();
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hotels,
        pagination: {
          totalHotels: hotels?.length < 5 ? hotels?.length : totalHotels,
          page: pageNumber,
          pages: hotels?.length < 5 ? 1 : Math.ceil(totalHotels / pageSize),
        },
      },
      "Hotels Found Successfully"
    )
  );
});

// Booking of a hotel

export const bookHotel = asyncHandler(async (req, res) => {
  const hotelId = req?.params?.hotelId;
  const paymentIntentId = req.body?.data?.paymentIntentId;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    const error = new ApiError(400, "Payment intent not found");
    return handleErrorResponse(res, error);
  }
  let userId = req.user._id;
  // Convert this to string
  userId = userId.toString();
  if (
    paymentIntent?.metadata?.hotelId !== hotelId ||
    paymentIntent?.metadata?.userId !== userId
  ) {
    const error = new ApiError(400, "payment intent mismatched");
    return handleErrorResponse(res, error);
  }
  if (paymentIntent?.status !== "succeeded") {
    const error = new ApiError(
      400,
      `Payment intent not succeeded, status: ${paymentIntent?.status}`
    );
    return handleErrorResponse(res, error);
  }

  const newBooking = {
    userId: req.user._id,
    hotelId,
    ...req.body?.data,
  };

  const hotel = await Hotel.findByIdAndUpdate(
    { _id: hotelId },
    {
      $push: {
        bookings: newBooking,
      },
    },
    { new: true }
  );
  if (!hotel) {
    const error = new ApiError(400, "Hotel not found");
    return handleErrorResponse(res, error);
  }
  await hotel.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel booked successfully"));
});

// Search Query

const constructSearchQuery = (queryParams = {}) => {
  let constructedQuery = {};

  if (queryParams?.destination) {
    constructedQuery.$or = [
      { city: queryParams?.destination },
      { country: queryParams?.destination },
    ];
  }
  if (queryParams?.adultCount) {
    constructedQuery.adultCount = queryParams?.adultCount;
  }
  if (queryParams?.childCount) {
    constructedQuery.childCount = queryParams?.childCount;
  }

  if (queryParams?.facilities && queryParams?.facilities?.length > 0) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams?.facilities)
        ? queryParams?.facilities
        : [queryParams?.facilities],
    };
  }

  if (queryParams?.types && queryParams?.types?.length > 0) {
    constructedQuery.type = Array.isArray(queryParams?.types)
      ? queryParams?.types
      : [queryParams?.types];
  }

  if (queryParams?.stars && queryParams?.stars?.length > 0) {
    const starRating = Array.isArray(queryParams?.stars)
      ? queryParams?.stars?.map((star) => parseInt(star))
      : [parseInt(queryParams?.stars)];

    constructedQuery.starRating = starRating;
  }

  if (queryParams?.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams?.maxPrice).toString(),
    };
  }

  return constructedQuery;
};
