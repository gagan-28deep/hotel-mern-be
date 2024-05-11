import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HotelUser } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.headers["Authorization"]?.replace("Bearer", " ");
    if (!token) {
      const error = new ApiError(401, "Unauthorized Request");
      return res.status(error?.statusCode).json({
        statusCode: error.statusCode,
        message: error?.message,
      });
    }
    const decodeToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await HotelUser.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      const error = new ApiError(401, "Invalid Token");
      return res.status(error?.statusCode).json({
        statusCode: error.statusCode,
        message: error?.message,
      });
    }
    req.user = user;
    next();
  } catch (err) {
    const error = new ApiError(401, "Invalid Access token");
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      message: error?.message,
    });
  }
});
