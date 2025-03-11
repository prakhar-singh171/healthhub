import express from 'express'
import { registeruser,userLogin } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post('/register',registeruser)
userRouter.post('/login',userLogin)

export default userRouter