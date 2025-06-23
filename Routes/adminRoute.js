import { Router } from "express";
import multer from "multer";
import { addProject, addUser, allowManagerToAddProject, deleteUser, getAllProjects, getAllUsers, getManagerProjects, getSingleProject, getUserById, updateUserRole, updateUserStatus } from "../controllers/adminController.js";
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
.post("/add-project", upload.none(), protectRoute(['admin']), addProject)
.get("/get-all-projects", upload.none(), protectRoute(['admin']), getAllProjects)
.get("/get-manager-projects/:managerId", upload.none(), protectRoute(['admin']), getManagerProjects)
.get("/get-single-project/:projectId", upload.none(), protectRoute(['admin']), getSingleProject)
  .put("/manager-create-project-permission", upload.none(), protectRoute(['admin']), allowManagerToAddProject);



//updateUserStatus


export { adminRouter };