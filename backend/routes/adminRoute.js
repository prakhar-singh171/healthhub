import express from 'express'


import { addDoctor,loginAdmin,alldoctors, appointmentCancel, appointmentsAdmin, adminDashboard } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability} from '../controllers/doctorController.js';
import { handleMulterErrors } from '../controllers/multerController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor',handleMulterErrors,addDoctor)
adminRouter.post('/login',loginAdmin);
adminRouter.get('/all-doctors',authAdmin,alldoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/appointment-cancel", authAdmin, appointmentCancel)

export default adminRouter;


