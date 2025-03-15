import express from 'express'
 import { appointmentComplete, appointmentDoctor, dashboardDoctor, doctorList, loginDoctor } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'
import { appointmentCancel } from '../controllers/adminController.js'
 
 const doctorRouter = express.Router()
 
 doctorRouter.get('/list',doctorList)
 doctorRouter.post('/login',loginDoctor)
 doctorRouter.get('/appointments',authDoctor,appointmentDoctor)
 doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
 doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
 doctorRouter.get('/dashboard',authDoctor,dashboardDoctor)
 
 export default doctorRouter