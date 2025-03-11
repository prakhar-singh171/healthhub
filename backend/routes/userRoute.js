import express from 'express'
import { registeruser,userLogin,getProfile } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register',registeruser)
userRouter.post('/login',userLogin)
userRouter.get('/get-profile',authUser,getProfile)
export default userRouter