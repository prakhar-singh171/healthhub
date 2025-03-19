import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import Token from '../models/tokenModel.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';


import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';


const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})
export const registeruser = catchAsync(async (req, res) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing Details" });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email" });
      }
  
      if (password.length < 4) {
        return res.status(400).json({ success: false, message: "Enter a strong pasword" });
      }
    
  
      const userData = {
        name,
        email,
        password
      };
      const newuser = new userModel(userData);
      const user = await newuser.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None'
      
    });

      res
        .status(200)
        .json({ success: true, message: "User registered successfully", token });
    })
  export const userLogin = catchAsync(async (req, res) => {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }
  
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
       console.log(password);
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie('token', token, {
        httpOnly: true, 
        secure: false, 
        sameSite: 'Lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
  
      return res.status(200).json({ success: true, token });
    } )
  
 
  
  export const getProfile = catchAsync(async (req, res) => {
    
      const { userId } = req.body;
      const userData = await userModel.findById(userId).select("-password");
      res.status(200).json({ success: true, userData });
    } )
  
    export const updateProfile = catchAsync(async(req , res) => {
      const {name , phone , address , dob , gender} = req.body
      const imageFile = req.file 
  
      if(!name || !phone || !dob || !gender) {
          return res.status(400).json({
              success: false,
              message: "missing details"
          })
      }
  
      await userModel.findByIdAndUpdate(req.user._id, { name, phone, address: JSON.parse(address), dob, gender })
  
      if(imageFile){
          try{
              const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
              const imageUrl = imageUpload.secure_url
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
  
      res.status(200).json({
          success: true,
          message: "Profile updated successfully"
      })
  
  })
  export const bookAppointment = catchAsync(async (req, res,next) => {
      console.log(req.body);
      const { userId, docId, slotDate, slotTime } = req.body;
      if(!slotDate || !slotTime){
        return next(new AppError('Please give both slotdate and slottime',400));
      }
      const docData = await doctorModel.findById(docId).select("-password");
      console.log(docData.available);
      if (!Boolean(docData.available)) {
        console.log('11');
        return res
          .status(400)
          .json({ success: false, message: "Doctor not available" });
      }
      console.log('sdfsdf');

      let slots_booked = docData.slots_booked;
      if (slots_booked[slotDate]) {
        if (slots_booked[slotDate].includes(slotTime)) {
          return new AppError('slot already booked',400);
        } else {
          slots_booked[slotDate].push(slotTime);
        }
      } else {
        slots_booked[slotDate] = [];
        slots_booked[slotDate].push(slotTime);
      }
  
      const userData = await userModel.findById(userId).select("-password");
      delete docData.slots_booked;
  
      const appointmentData = {
        userId,
        docId,
        amount: docData.fees,
        slotDate,
        slotTime,
        date: Date.now(),
      };
      const newappointment = new appointmentModel(appointmentData);
      await newappointment.save();
      await doctorModel.findByIdAndUpdate(docData, { slots_booked });
      res.status(200).json({ success: true, message: "Appointment booked successfully" });
    } )
  
  export const myAppointments =catchAsync( async (req, res) => {
      const { userId } = req.body;
      const appointments = await appointmentModel.find({ userId });
      res.status(200).json({ success: true, appointments });
    } )
  
  export const cancelAppointment = catchAsync(async (req, res) => {
      const { userId, appointmentId } = req.body;
      const appointmentData = await appointmentModel.findById(appointmentId);
      if (!appointmentData.userId.equals(new mongoose.Types.ObjectId(userId))) {
        return res.status(400).json({ success: false, message: "unauthorized action " });
      }
      await appointmentModel.findByIdAndUpdate(appointmentData, {
        cancelled: true,
      });
      const { docId, slotDate, slotTime } = appointmentData;
      const docData = await doctorModel.findById(docId);
      let slots_booked = docData.slots_booked;
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
      }
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      res.status(200).json({ success: true, message: "Appointment Cancelled" });
    } )

  export const paymentRazorpay = catchAsync(async (req, res) => {
      console.log('dfdf')

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
          console.log('aa')
            return res.status(400).json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }


        // creation of an order
        const order = await razorpayInstance.orders.create(options)


        res.status(200).json({ success: true, order })

    } )

// API to verify payment of razorpay
export const verifyRazorpay = catchAsync(async (req, res) => {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.status(200).json({ success: true, message: "Payment Successful" })
        }
        else {
            res.status(400).json({ success: false, message: 'Payment Failed' })
        }
    } )

export const changePassword =catchAsync( async (req, res) => {
        const { email } = req.body;

        if(!email) return next(new AppError('please provide email',400));
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json({ message: "new password set successfully" });
    } )
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

export const sendEmail = catchAsync(async (req, res) => {
    const { email: userEmail, subject } = req.body;

    const existingRecord = await Token.findOne({ email: userEmail });
    if (existingRecord) await Token.deleteOne({ _id: existingRecord._id });

    let token, emailContent;

    if (subject === "EmailVerification") {
      token = crypto.randomBytes(26).toString('hex').slice(0, 35);

      await new Token({ token, email: userEmail, sub: subject }).save();


      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}/${userEmail}`;
      emailContent = {
        sender: { name: "Your App", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: userEmail }],
        subject: 'Verify Your Email Address',
        htmlContent: `<p>Please click the link below to verify your email address:</p>
                      <a href="${verificationUrl}">${verificationUrl}</a>`,
      };
    } 
   

    const response = await axios.post(BREVO_API_URL, emailContent, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    });

    if (response.status === 201) {
      res.status(200).json({ message: "Email sent successfully" });
    } else {
      return next(new AppError('Failed to send email.please try again',400))
    }
  } )

export const verifyEmail = catchAsync(async (req, res) => {
    const { email, token } = req.body;

    const record = await Token.findOne({ email });
    if (!record) {
      return res.status(401).json({ message: "No verification record found." });
    }

    if (record.token !== token) {
      return res.status(401).json({ message: "Invalid or incorrect token." });
    }

    const tokenAge = new Date() - record.createdAt;
    if (tokenAge > 45 * 60 * 1000) { 
      await Token.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "Verification link expired. Request a new link." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isVerified = true;
    await user.save();
    await Token.deleteOne({ _id: record._id });

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } )


export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    const emailContent = {
      sender: { name: "Your App", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    };

    // Send email using Brevo's API
    const response = await axios.post(BREVO_API_URL, emailContent, {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
    });

    if (response.status === 201) {
      return res.status(200).json({
        success:'true',
        message: "Password reset email sent successfully. Please check your email.",
      });
    } else {
      return res.status(400).json({ error: "Failed to send reset email. Try again later." });
    }
  } )

export const resetPassword = catchAsync(async (req, res) => {
    const { email, token, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValidToken || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpire = undefined; 
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } )

export const logout = (req, res) => {
  res.clearCookie('token', {
      httpOnly: true, 
      secure: true, 
      sameSite: 'None'
  });
  res.status(200).json({ message: "Logged out successfully" });
};

