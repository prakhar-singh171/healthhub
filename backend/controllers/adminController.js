import validator from "validator";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken'

const addDoctor = async(req,res)=>{
    try {
        const {name,email,password,speciality,education,experience,about,fees,address} = req.body;
        const imagefile = req.file;
        if(!name || !email || !password || !speciality || !education || !experience || !about || !fees || !address){
          return  res.json({success:false,message:"Missing Details"})
        }

        if(!validator.isEmail(email)){
            return  res.json({success:false,message:"Please enter a valid email"})
        }
        if(password.length < 4){
            return  res.json({success:false,message:"Please enter a strong password"})
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
         res.json({success:true,message:"Doctor Added"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})    
    }
}

const loginAdmin = async (req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(email);
         console.log(password)
         console.log(process.env.JWT_SCERET);
         console.log(process.env.ADMIN_PASSWORD);
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            console.log('fdsfd')
            const token =  jwt.sign(email+password,process.env.JWT_SECRET,{
                expiresIn:'1h'
            })
            console.log(token)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid Credatinals"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message});
    }
}
const alldoctors = async(req,res)=>{
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message});
    }
}
export {addDoctor,loginAdmin,alldoctors}