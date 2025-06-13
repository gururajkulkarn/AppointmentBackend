import express from 'express';
import { addDoctor, loginAdmin } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';

const adminRouter = express.Router();

// Only apply multer to /add-doctor route
adminRouter.post('/add-doctor', upload.single('image'), addDoctor);

// No multer on login route
adminRouter.post('/login', loginAdmin);

export default adminRouter;

