import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Handle error response
const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Create a new hotel
export const createHotel = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);
  const imageFiles = req.files;
  const newHotel = req.body;
  // 1. Upload images to cloudinary

  // This approach didnt work
  // const uploadPromises = imageFiles?.map(async (imageFile) => {
  //   return await uploadOnCloudinary(imageFile?.path);
  // });

  // const uploadPromises = imageFiles?.map((imageFile)=>{
  //   uploadOnCloudinary(imageFile?.path).then((res)=>{
  //     console.log("res", res);
  //     return res?.url
  //   }).catch((err)=>{
  //     console.log("err", err);
  //     return null
  //   })
  // })

  // This approach worked

  const imageUrls = await uploadOnCloudinary(imageFiles);

  // 2. add imageUrls to newHotel
  newHotel.imageUrls = imageUrls;

  // 3. add user to newHotel
  newHotel.userId = req.user._id;

  // 4. create new hotel and save
  const hotel = await Hotel.create(newHotel);
  if (!hotel) {
    const error = new ApiError(
      400,
      "Something went wrong while creating hotel"
    );
    return handleErrorResponse(res, error);
  }
  // 5. send response
  return res
    .status(201)
    .json(new ApiResponse(201, { hotel }, "Hotel Created Successfully"));
});

// Get all hotels of the logged in user
export const getAllHotelsOfUser = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ userId: req.user._id });
  if (!hotels) {
    const error = new ApiError(400, "No hotels found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { hotels }, "Hotels Found Successfully"));
});

// Get a particular hotel of the logged in user
export const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!hotel) {
    const error = new ApiError(400, "No hotel found");
    return handleErrorResponse(res, error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel Found Successfully"));
});

// Update a hotel details
export const updateHotelById = asyncHandler(async (req, res) => {
  const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedHotel) {
    const error = new ApiError(400, "Something went wrong while updating");
    return handleErrorResponse(res, error);
  }

  const files = req.files;
  if (files) {
    const updatedImageUrls = await uploadOnCloudinary(files);
    updatedHotel.imageUrls = [
      ...updatedImageUrls,
      ...(updatedHotel?.imageUrls || []),
    ];
  }

  await updatedHotel.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { updatedHotel }, "Hotel Updated Successfully"));
});
