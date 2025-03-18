import express from 'express'
import { registeruser,userLogin,getProfile,updateProfile,bookAppointment,myAppointments,cancelAppointment, paymentRazorpay, verifyRazorpay, verifyEmail, sendEmail, changePassword, forgotPassword, resetPassword, logout } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register',registeruser)
userRouter.post('/login',userLogin)
userRouter.post("/logout", logout);
userRouter.post('/send-email', sendEmail);

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/my-appointments',authUser,myAppointments)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post('/verify', verifyEmail);
userRouter.post('/change-password', changePassword);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/", resetPassword);

export default userRouter