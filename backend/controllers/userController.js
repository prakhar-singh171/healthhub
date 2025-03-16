import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import Token from '../models/tokenModel.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';


import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay';


const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})
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
  
  export const googleAuth = async (req, res) => {
    try {
      const { name, email, image } = req.body;
      if (!name || !email || !image) {
        return res.status(400).json({
          success: false,
          message: "Missing details from Google sign-in",
        });
      }
  
      let user = await userModel.findOne({ email });
      if (!user) {
        const newUser = new userModel({
          name,
          email,
          image: image,
          authMethod: "google",
        });
  
        user = await newUser.save();
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        success: true,
        message: "Google sign-in successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });
    } catch (error) {
      console.error("Google Authentication Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
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
  
  export const bookAppointment = async (req, res) => {
    try {
      console.log(req.body);
      const { userId, docId, slotDate, slotTime } = req.body;
      const docData = await doctorModel.findById(docId).select("-password");
      console.log(docData.available);
      if (!Boolean(docData.available)) {
        console.log('11');
        return res
          .status(200)
          .json({ success: false, message: "Doctor not available" });
      }
      console.log('sdfsdf');

      let slots_booked = docData.slots_booked;
      if (slots_booked[slotDate]) {
        if (slots_booked[slotDate].includes(slotTime)) {
          return res.json({ success: false, message: "Slot already booked" });
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
        userData,
        docData,
        amount: docData.fees,
        slotDate,
        slotTime,
        date: Date.now(),
      };
      const newappointment = new appointmentModel(appointmentData);
      await newappointment.save();
      await doctorModel.findByIdAndUpdate(docData, { slots_booked });
      res.json({ success: true, message: "Appointment booked successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const myAppointments = async (req, res) => {
    try {
      const { userId } = req.body;
      const appointments = await appointmentModel.find({ userId });
      res.json({ success: true, appointments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const cancelAppointment = async (req, res) => {
    try {
      const { userId, appointmentId } = req.body;
      const appointmentData = await appointmentModel.findById(appointmentId);
      if (appointmentData.userId !== userId) {
        return res.json({ success: false, message: "unauthorized action " });
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
      res.json({ success: true, message: "Appoitment Cancelled" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  export const paymentRazorpay = async (req, res) => {
    try {
      console.log('dfdf')

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        console.log(appointmentData);
        if (!appointmentData || appointmentData.cancelled) {
          console.log('aa')
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
export const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export const changePassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.password = await bcrypt.hash(req.body.newPassword, 10);
        await user.save();

        res.status(200).json({ message: "new password set successfully" });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ error: error.message })
    }
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Function to send email
export const sendEmail = async (req, res) => {
  try {
    const { email: userEmail, subject } = req.body;

    // Remove existing token if it exists
    const existingRecord = await Token.findOne({ email: userEmail });
    if (existingRecord) await Token.deleteOne({ _id: existingRecord._id });

    let token, emailContent;

    if (subject === "EmailVerification") {
      // Generate token
      token = crypto.randomBytes(26).toString('hex').slice(0, 35);

      // Save token to database
      await new Token({ token, email: userEmail, sub: subject }).save();


      // Verification link
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}/${userEmail}`;
      emailContent = {
        sender: { name: "Your App", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: userEmail }],
        subject: 'Verify Your Email Address',
        htmlContent: `<p>Please click the link below to verify your email address:</p>
                      <a href="${verificationUrl}">${verificationUrl}</a>`,
      };
    } 
   

    // Send email using Brevo
    const response = await axios.post(BREVO_API_URL, emailContent, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    });

    if (response.status === 201) {
      res.status(200).json({ message: "Email sent successfully" });
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to verify email 
export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    const record = await Token.findOne({ email });
    if (!record) {
      return res.status(401).json({ message: "No verification record found." });
    }

    if (record.token !== token) {
      return res.status(401).json({ message: "Invalid or incorrect token." });
    }

    const tokenAge = new Date() - record.createdAt;
    if (tokenAge > 45 * 60 * 1000) { // Token expired after 45 minutes
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const sendForgotPasswordEmailWithBrevo = async (email, resetUrl) => {
  try {
    // Email content
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

    // Check response status
    if (response.status === 201) {
      console.log(`Forgot password email sent to ${email}`);
      return true;
    } else {
      console.error(`Failed to send email: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending forgot password email with Brevo:", error.message);
    return false;
  }
};

// Forgot password controller function
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Save the token and its expiration in the user's record
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Construct reset password URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Send the reset password email
    const emailSent = await sendForgotPasswordEmailWithBrevo(email, resetUrl);
    if (emailSent) {
      return res.status(200).json({
        success:'true',
        message: "Password reset email sent successfully. Please check your email.",
      });
    } else {
      return res.status(500).json({ error: "Failed to send reset email. Try again later." });
    }
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the token
    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValidToken || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update the password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear token
    user.resetPasswordExpire = undefined; // Clear expiration
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Server error" });
  }
};
