import { Router } from "express";
import multer from "multer";
import { registerUser, loginUser, forgetPassword, resetPassword, verifyOtp, changeProfile, changePassword, getMyProfile } from "../controllers/authController.js";
import { uploadProjectCSV } from "../controllers/projectManagerController.js";
import csvUploadMiddleware from "../Middlewares/csvUploadMiddleware.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";
import imageUploadMiddleware from "../Middlewares/uploadMiddleware.js";

const upload = multer();
const authRouter = Router();

authRouter
  .post("/register", upload.none(), registerUser)
  .post("/login", upload.none(), loginUser)
  .post('/forgot-password', upload.none(),forgetPassword)
  .post('/verify-otp',upload.none(), verifyOtp)
  .post('/reset-password',upload.none(), resetPassword)
  .post('/upload-csv', csvUploadMiddleware.single('file'),protectRoute(['project-manager']), uploadProjectCSV)
  .put('/change-profile',imageUploadMiddleware.single('avatar'), protectRoute(['admin', 'governance','project-manager']),  changeProfile)
  .put('/change-password', protectRoute(['admin', 'governance','project-manager']),upload.none(),   changePassword)
  .get('/my-profile', protectRoute(['admin', 'governance','project-manager']),getMyProfile)



export { authRouter };