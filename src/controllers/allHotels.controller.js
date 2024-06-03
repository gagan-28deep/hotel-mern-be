import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";

// Handle error response
const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Get all the hotels
export const getAllHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find();
  if (!hotels) {
    const error = new ApiError(400, "No hotels found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { hotels }, "Hotels Found Successfully"));
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
