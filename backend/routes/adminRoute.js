import express from 'express'


import { addDoctor,loginAdmin,alldoctors, appointmentCancel, appointmentsAdmin, adminDashboard } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailblity } from '../controllers/doctorController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor',upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin);
adminRouter.get('/all-doctors',authAdmin,alldoctors);
adminRouter.post('/change-availblity',authAdmin,changeAvailblity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)

export default adminRouter;


