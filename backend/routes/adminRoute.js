import express from 'express'


import { addDoctor,loginAdmin,alldoctors } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailblity } from '../controllers/doctorController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctors',upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin);
adminRouter.post('/all-doctors',authAdmin,alldoctors);
adminRouter.post('/change-availblity',authAdmin,changeAvailblity)

export default adminRouter;


