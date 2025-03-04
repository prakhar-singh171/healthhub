import express from 'express'


import { addDoctor,loginAdmin,alldoctors } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctors',upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin);
adminRouter.post('/all-doctors',authAdmin,alldoctors);


export default adminRouter;


