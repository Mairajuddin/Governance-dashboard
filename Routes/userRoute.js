import { Router } from "express";
import multer from "multer";
import { registerUser, loginUser, forgetPassword, resetPassword, verifyOtp } from "../controllers/authController.js";
import { uploadProjectCSV } from "../controllers/projectManagerController.js";
import csvUploadMiddleware from "../Middlewares/csvUploadMiddleware.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";

const upload = multer();
const authRouter = Router();

authRouter
  .post("/register", upload.none(), registerUser)
  .post("/login", upload.none(), loginUser)
  .post('/forgot-password', upload.none(),forgetPassword)
  .post('/verify-otp',upload.none(), verifyOtp)
  .post('/reset-password',upload.none(), resetPassword)
  .post('/upload-csv', csvUploadMiddleware.single('file'),protectRoute(['project-manager']), uploadProjectCSV);


export { authRouter };