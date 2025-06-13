import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import errorController from './controllers/errorController.js';
import AppError from './utils/appError.js';

const app = express();
const port = process.env.PORT || 4000;

dotenv.config();
connectDB();
connectCloudinary();

// CORS Options
const corsOptions = {
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // ✅ add this
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};


// Apply middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// ------------------- REQUEST LOGGER ------------------- //
// app.use((req, res, next) => {
//     console.log("----- Incoming Request -----");
//     console.log("Time:", new Date().toISOString());
//     console.log("Method:", req.method);
//     console.log("Path:", req.originalUrl);
//     console.log("Headers:", JSON.stringify(req.headers, null, 2));
//     if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
//         console.log("Body:", JSON.stringify(req.body, null, 2));
//     }
//     console.log("----------------------------");
//     next();
// });

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

// Default test route
app.get('/', (req, res) => {
    res.send('API IS WORKING');
});

// Handle unknown routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(errorController);

// Start server
app.listen(port, () => {
    console.log("Server is listening on port", port);
});
