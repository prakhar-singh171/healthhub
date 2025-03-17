import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import appointmentModel from "../models/appointmentModel.js";


import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";

export const changeAvailability = catchAsync(async (req,res)=>{
        const {docId} = req.body;

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
        res.json({success:true,message:"Availblity checked"})
    } )
export const doctorList = catchAsync(async (req, res) => {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors, message: "Doctors fetched successfully" })
    } )
export const loginDoctor = catchAsync(async (req,res)=>{
        const {email,password} = req.body;
        const doctor = await doctorModel.findOne({email})
        if(!doctor){
            res.json({success:false,message:"Invalid crdentials"})
        }
        const isMatch = await bcrypt.compare(password,doctor.password)
        if(isMatch){
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid crdentials"})

        }
    } )

export const appointmentDoctor = catchAsync(async (req,res)=>{
       const {docId} = req.body;
       const appointments = await appointmentModel.find({docId})
       res.json({success:true,appointments}) 
    } )

export const appointmentComplete = catchAsync(async(req,res)=>{
        const {docId,appointmentId} = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
            return res.json({success:true,message:"Appointment completed"})
        }else{
            return res.json({success:false,message:"Mark failed"})
        }
    } )
export const appointmentCancel = catchAsync(async(req,res)=>{
        const {docId,appointmentId} = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
            return res.json({success:true,message:"Appointment cancelled"})
        }else{
            return res.json({success:false,message:"Cancellation failed"})
        }
    } )

export const dashboardDoctor = catchAsync(async(req,res)=>{
        const {docId} = req.body;
        let earings = 0;
        const appointments = await appointmentModel.find({docId})
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earings += item.amount
            }
        })
        let patients = []
        appointments.map((item)=>{
            if(!patients.includes(item.userId))
            {
                patients.push(item.userId)
            }
        })
        const dashdata = {
            earings,
            appointments:appointments.length,
            patients:patients.length,
            latestappointment:appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashdata})
    } )

export const getdoctorprofile = catchAsync(async (req, res) => {
      const { docId } = req.body
      const profiledata = await doctorModel.findById(docId).select('-password')
      res.json({ success: true, profileData: profiledata })
    } )
export const updateProfileData = catchAsync(async (req,res)=>{
        const {docId,fees,available,address}= req.body;
        await doctorModel.findByIdAndUpdate(docId,{fees,available,address})
        res.json({success:true,message:"Profile Updated"})
    } )