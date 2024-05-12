import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  login,
  logout,
  refreshAccessToken,
  signUp,
} from "../controllers/user.controller.js";
const router = express.Router();

router.route("/register").post(signUp);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshAccessToken);

// Secured Routes
router.route("/logout").post(verifyJwt, logout);

export default router;
