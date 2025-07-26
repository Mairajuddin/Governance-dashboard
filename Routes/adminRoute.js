import { Router } from "express";
import multer from "multer";
import { addProject, addUser, allowManagerToAddProject, deleteProject, deleteUser, getAllProjects, getAllUsers, getManagerProjectById, getManagerProjects, getSingleProject, getUserById, updateProject, updateUserRole, updateUserStatus } from "../controllers/adminController.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";
import imageUploadMiddleware from "../Middlewares/uploadMiddleware.js";

const upload = multer();
const adminRouter = Router();


adminRouter
.post("/add-user",upload.none(),protectRoute(['admin']),addUser)
.get("/get-all-users",upload.none(),protectRoute(['admin']),getAllUsers)
.get("/get-user/:userId",upload.none(),protectRoute(['admin']),getUserById)
.delete("/delete-user/:userId",upload.none(),protectRoute(['admin']),deleteUser)
.get("/get-all-projects", upload.none(), protectRoute(['admin']), getAllProjects)
.put("/update-user/:userId",upload.none(),protectRoute(['admin']),updateUserRole)
.put("/update-user-status/:userId/:action",upload.none(),protectRoute(['admin']),updateUserStatus)
.post("/add-project",imageUploadMiddleware.single('logo'), protectRoute(['admin']), addProject)
.put("/update-project/:id", imageUploadMiddleware.single('logo'), protectRoute(['admin']), updateProject)
.delete("/delete-project/:id", upload.none(), protectRoute(['admin']), deleteProject)
.get("/get-all-projects", upload.none(), protectRoute(['admin']), getAllProjects)

// ye jo api hy bc ye manager ke khud ke project list karwane ke liye hy 
.get("/get-manager-projects/:managerId", upload.none(), protectRoute(['admin','project-manager']), getManagerProjects)//-------------------
.get("/get-single-project/:projectId", upload.none(), protectRoute(['admin','project-manager']), getSingleProject)//-----------------
  .put("/manager-create-project-permission", upload.none(), protectRoute(['admin']), allowManagerToAddProject)
// ye wala dekhlio son
  .get('/project/:project_id',protectRoute(['admin']), getManagerProjectById)

//getManagerProjectById
//updateUserStatus


export { adminRouter };