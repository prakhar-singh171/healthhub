import express from 'express'


import { addDoctor,loginAdmin,alldoctors, appointmentCancel, appointmentsAdmin, adminDashboard } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability} from '../controllers/doctorController.js';
import { logout } from '../controllers/userController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor',upload.single('image'),authAdmin,addDoctor)
adminRouter.post('/login',loginAdmin);
adminRouter.post("/logout",logout);

adminRouter.get('/all-doctors',authAdmin,alldoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/appointment-cancel", authAdmin, appointmentCancel)

export default adminRouter;


