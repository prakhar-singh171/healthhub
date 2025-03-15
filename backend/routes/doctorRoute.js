import express from 'express'
 import { appointmentComplete, appointmentDoctor, dashboardDoctor, doctorList, getdoctorprofile, loginDoctor, updateProfileData } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'
import { appointmentCancel } from '../controllers/adminController.js'
 
 const doctorRouter = express.Router()
 
 doctorRouter.get('/list',doctorList)
 doctorRouter.post('/login',loginDoctor)
 doctorRouter.get('/appointments',authDoctor,appointmentDoctor)
 doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
 doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
 doctorRouter.get('/dashboard',authDoctor,dashboardDoctor)
 doctorRouter.get('/profile',authDoctor,getdoctorprofile)
 doctorRouter.post('/update-profile',authDoctor,updateProfileData)
 export default doctorRouter