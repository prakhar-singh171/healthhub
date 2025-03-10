import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';

import dotenv from 'dotenv'
const app = express();

const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();
dotenv.config()


app.use(express.json())
app.use(cors());
app.use('/api/admin',adminRouter)

app.get('/',(req,res)=>{
    res.send('API IS WORKING')
})

app.listen(port,()=>{
    console.log("server is listing on",port);
    
})