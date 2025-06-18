import { Router } from "express";
import multer from "multer";

import { deleteCSV, getUploadedCSVs, uploadProjectCSV } from "../controllers/projectManagerController.js";
import csvUploadMiddleware from "../Middlewares/csvUploadMiddleware.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";

const upload = multer();
const pmRouter = Router();

pmRouter
  .post('/upload-csv', csvUploadMiddleware.single('file'),protectRoute(['project-manager']), uploadProjectCSV)
  .get('/get-all-csv',protectRoute(['admin','project-manager']), getUploadedCSVs)
  .delete('/delete-csv/:csvId',protectRoute(['admin','project-manager']), deleteCSV)



export { pmRouter };