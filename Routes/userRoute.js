import { Router } from "express";
import multer from "multer";
import { registerUser, loginUser, forgetPassword, resetPassword, verifyOtp } from "../controllers/authController.js";

const upload = multer();
const authRouter = Router();

authRouter
  .post("/register", upload.none(), registerUser)
  .post("/login", upload.none(), loginUser)
  .post('/forgot-password', upload.none(),forgetPassword)
  .post('/verify-otp',upload.none(), verifyOtp)
  .post('/reset-password',upload.none(), resetPassword)

export { authRouter };