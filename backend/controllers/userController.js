import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

export const registeruser = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
      }
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Enter a valid email" });
      }
  
      if (password.length < 4) {
        return res.json({ success: false, message: "Enter a strong pasword" });
      }
      const salt = await bcrypt.genSalt(10);
      const hasedpassword = await bcrypt.hash(password, salt);
  
      const userData = {
        name,
        email,
        password: hasedpassword,
      };
      const newuser = new userModel(userData);
      const user = await newuser.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res
        .status(200)
        .json({ success: true, message: "User registered successfully", token });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  export const userLogin = async (req, res) => {
    try {
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
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      return res.status(200).json({ success: true, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
 
  export const getProfile = async (req, res) => {
    try {
      const { userId } = req.body;
      const userData = await userModel.findById(userId).select("-password");
      res.json({ success: true, userData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const updateProfile = async (req, res) => {
    try {
      const { userId, name, address, phone, dob, gender } = req.body;
      const imageFile = req.file;
      if (!name || !address || !phone || !dob || !gender) {
        return res
          .status(400)
          .json({ success: false, message: "Missing details" });
      }
      await userModel.findByIdAndUpdate(userId, {
        name,
        phone,
        dob,
        gender,
        address: JSON.parse(address),
      });
      if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        const imageURL = imageUpload.secure_url;
        await userModel.findByIdAndUpdate(userId, { image: imageURL });
        return res.json({
          success: true,
          message: "image updated successfully!",
        });
      }
      res.json({ success: true, message: "profile updated" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const bookAppointment = async () => {
    try {
      const { userId, docId, slotDate, slotTime } = req.body;
      const docData = await doctorModel.findById(docId).select("-password");
      if (!docData.available) {
        return res
          .status(400)
          .json({ success: false, message: "Doctor not Found" });
      }
      let slots_booked = docData.slots_booked;
      if (slots_booked[slotDate]) {
        if (slots_booked[slotDate].includes(slotTime)) {
          return res
            .status(400)
            .json({ success: false, message: "slots are not found" });
        } else {
          slots_booked[slotDate].push(slotTime);
        }
      } else {
        slots_booked[slotDate] = [];
        slots_booked[slotDate].push(slotTime);
      }
  
      const userData = await userModel.findById(userId).select('-password')
      delete docData.slots_booked;
  
      const appointmentData = {
        userId,
        docId,
        userData,
        docData,
        amount:docData.fees,
        slotDate,
        slotTime,
        date:Date.now()
      }
      const newappointment = new appointmentModel(appointmentData)
      await newappointment.save()
      await doctorModel.findByIdAndUpdate(docData,{slots_booked})
      res.json({success:true,message:"Appointment Booked"})
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
};
  