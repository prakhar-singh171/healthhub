import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv'
import errorController from './controllers/errorController.js';
import AppError from './utils/appError.js';
const app = express();

const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();
dotenv.config()

const corsOptions = {
    origin: [process.env.FRONTEND_URL,process.env.ADMIN_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

        // Allow requests only from your frontend URL
    credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json())
app.use(cors(corsOptions))

app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

  //ERROR HEADLING MIDDLEWARE

app.get('/',(req,res)=>{
    res.send('API IS WORKING')
})


app.all('*', (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl} on this server`), 404);
  });

  app.use(errorController);

  

app.listen(port,()=>{
    console.log("server is listing on",port);
    
})