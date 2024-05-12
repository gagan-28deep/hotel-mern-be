import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HotelUser } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Cookies option
const options = {
  httpOnly: true,
  secure: true,
};

// Error handling response
const handleErrorResponse = (res, error) => {
  return res.status(error?.statusCode).json({
    statusCode: error.statusCode,
    message: error?.message,
  });
};

// Generate the tokens

const generateAccessRefreshToken = async (id) => {
  try {
    const user = await HotelUser.findById(id);
    if (user) {
      const accessToken = await user?.generateAccessToken();
      const refreshToken = await user?.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();
      return { accessToken, refreshToken };
    }
  } catch (err) {
    const error = new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
    return handleErrorResponse(res, error);
  }
};

// Sign Up
export const signUp = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  if (!firstName || !username || !email || !password) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  const existingUser = await HotelUser.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    const error = new ApiError(
      400,
      "User With same username or email is present"
    );
    return handleErrorResponse(res, error);
  }
  const user = await HotelUser.create({
    firstName,
    username,
    email,
    password,
  });
  const createdUser = await HotelUser.findById(user?._id);
  if (!createdUser) {
    const error = new ApiError(
      500,
      "Something went wrong while creating a user"
    );
    return handleErrorResponse(res, error);
  }
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user?._id
  );

  const loggedInUser = {
    ...createdUser.toObject(),
    password: undefined,
    refreshToken: undefined,
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: loggedInUser, accessToken, refreshToken },
        "User Created Successfully"
      )
    );
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = new ApiError(400, "All fields are required");
    return handleErrorResponse(res, error);
  }
  const user = await HotelUser.findOne({
    $or: [{ username }, { email: username }],
  });
  if (!user) {
    const error = new ApiError(400, "User not found");
    return handleErrorResponse(res, error);
  }
  if (!(await user.isPasswordSame(password))) {
    const error = new ApiError(400, "Invalid credentials");
    return handleErrorResponse(res, error);
  }
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user?._id
  );
  const loggedInUser = {
    ...user.toObject(),
    password: undefined,
    refreshToken: undefined,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  await HotelUser.findByIdAndUpdate(
    req?.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

// Generate Refresh Token

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    const error = new ApiError(401, "Unauthorized request");
    return handleErrorResponse(res, error);
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOEKN_SECRET
    );

    const user = await HotelUser.findById(decodedToken?._id);
    if (!user) {
      const error = new ApiError(401, "Invalid Token");
      return handleErrorResponse(res, error);
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      // throw new ApiError(401, "Refresh Token is expired or used");
      const error = new ApiError(401, "Refresh Token is expired or used");
      return handleErrorResponse(res, error);
    }

    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      user?._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (err) {
    console.log("errrr", err);
    const error = new ApiError(401, "Unauthorized request");
    return handleErrorResponse(res, error);
  }
});
