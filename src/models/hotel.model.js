import mongoose, { Schema } from "mongoose";

const hotelSchema = new Schema(
  {
    // Which user has created this hotel
    userId: {
      type: Schema.Types.ObjectId,
      ref: "HotelUser",
    },
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    adultCount: {
      type: Number,
      required: true,
    },
    childCount: {
      type: Number,
      required: true,
    },

    // Both serves the same functionality and how we want to store the data
    // facilities: {
    //   type: [String],
    //   required: true,
    // },
    facilities: [
      {
        type: String,
        required: true,
      },
    ],
    pricePerNight: {
      type: Number,
      required: true,
    },
    starRating: {
      type: Number,
      required: true,
    },
    imageUrls: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const Hotel = mongoose.model("Hotel", hotelSchema);
