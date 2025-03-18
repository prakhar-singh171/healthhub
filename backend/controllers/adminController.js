import validator from "validator";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import catchAsync from "../utils/catchAsync.js";


const addDoctor = catchAsync(async(req,res)=>{
        const {name,email,password,speciality,education,experience,about,fees,address} = req.body;
        const imagefile = req.file;
        if(!name || !email || !password || !speciality || !education || !experience || !about || !fees || !address){
          return  res.status(500).json({success:false,message:"Missing Details"})
        }

        if(!validator.isEmail(email)){
            return  res.status(500).json({success:false,message:"Please enter a valid email"})
        }
        if(password.length < 4){
            return  res.status(500).json({success:false,message:"Please enter a strong password"})
        }
         const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hash(password,salt);
         const imageUpload = await cloudinary.uploader.upload(imagefile.path,{resource_type:"image"})

         const imageUrl = imageUpload.secure_url;

         const doctorData = {
            name,
            email,
            password:hashedPassword,
            speciality,
            education,
            experience,
            about,
            fees,
            image:imageUrl,
            address:JSON.parse(address),
            date:Date.now()
         }
         const newDoctor = new doctorModel(doctorData)
         await newDoctor.save();

         
                 fs.unlink(imagefile.path, (err) => {
                   if (err) {
                     console.error("Error deleting file:", err);
                   } else {
                     console.log("File deleted successfully");
                   }
                 });
         res.status(200).json({success:true,message:"Doctor Added"})
    } )
const loginAdmin = catchAsync(async (req,res)=>{
        const {email,password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token =  jwt.sign({email: email}, process.env.JWT_SECRET, { expiresIn: '1h' })
            res.status(200).json({success:true,token})
        }else{
            res.status(400).json({success:false,message:"Invalid Credentials"})
        }
    } )
const alldoctors = catchAsync(async(req,res)=>{

    
        const doctors = await doctorModel.find({}).select('-password')
        res.status(200).json({success:true,doctors})
    } )
const adminDashboard = catchAsync(async (req, res) => {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.status(200).json({ success: true, dashData })

    } )

const appointmentsAdmin = catchAsync(async (req, res) => {

        const appointments = await appointmentModel.find({})
        res.status(200).json({ success: true, appointments })

    } )

// API for appointment cancellation
const appointmentCancel = catchAsync(async (req, res) => {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.status(200).json({ success: true, message: 'Appointment Cancelled' })

    } )
export {addDoctor,loginAdmin,alldoctors,appointmentCancel,appointmentsAdmin,adminDashboard}