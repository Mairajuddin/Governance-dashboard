import { Router } from "express";
import multer from "multer";
import { addUser, deleteUser, getAllUsers, getUserById, updateUserRole, updateUserStatus } from "../controllers/adminController.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";

const upload = multer();
const adminRouter = Router();


adminRouter
.post("/add-user",upload.none(),protectRoute(['admin']),addUser)
.get("/get-all-users",upload.none(),protectRoute(['admin']),getAllUsers)
.get("/get-user/:userId",upload.none(),protectRoute(['admin']),getUserById)
.delete("/delete-user",upload.none(),protectRoute(['admin']),deleteUser)
.put("/update-user/:userId",upload.none(),protectRoute(['admin']),updateUserRole)
.put("/update-user-status/:userId/:action",upload.none(),protectRoute(['admin']),updateUserStatus)
//updateUserStatus


export { adminRouter };