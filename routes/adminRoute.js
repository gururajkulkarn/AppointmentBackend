import express from 'express';
import { addDoctor, allDoctors, loginAdmin } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

// Route: Add a new doctor (requires authentication and image upload)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);

// Route: Admin login (no authentication or multer required)
adminRouter.post('/login', loginAdmin);

// Route: Fetch all doctors (requires admin authentication)
adminRouter.post('/all-doctors', authAdmin, allDoctors);

export default adminRouter;
