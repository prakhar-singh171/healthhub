import validator from "validator";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import fs from 'fs'
import catchAsync from "../utils/catchAsync.js";


const addDoctor = catchAsync(async (req, res) => {
    const { name, email, password, speciality, education, experience, about, fees, address } = req.body;
    const imageFile = req.file; // File in memory (uploaded via multer)

    if (!name || !email || !password || !speciality || !education || !experience || !about || !fees || !address) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 4) {
        return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let imageUrl;
        if(imageFile){
          try{
              const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
              imageUrl = imageUpload.secure_url
              fs.unlinkSync(imageFile.path)
              await userModel.findByIdAndUpdate(req.user._id , {image:imageUrl})
          } catch (error) {
              fs.unlinkSync(imageFile.path)
              return res.status(400).json({
                  success:false,
                  message: "Unable to upload the profile pic"
              })
          }
      }

    const doctorData = {
        name,
        email,
        password: hashedPassword,
        speciality,
        education,
        experience,
        about,
        fees,
        image: imageUrl,
        address: JSON.parse(address),
        date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(200).json({ success: true, message: "Doctor Added" });
});

const loginAdmin = catchAsync(async (req,res)=>{
        const {email,password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
const token = jwt.sign(   { email, role: 'admin' }, process.env.JWT_SECRET,{ expiresIn: '1h' });        

res.cookie('token', token, {
        httpOnly: true, 
        secure: true, 
        sameSite: 'None', 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      
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

const appointmentCancel = catchAsync(async (req, res) => {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.status(200).json({ success: true, message: 'Appointment Cancelled' })

    } )
export {addDoctor,loginAdmin,alldoctors,appointmentCancel,appointmentsAdmin,adminDashboard}