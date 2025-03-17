import express from "express";
import upload from "../middlewares/multer.js";
import multer from 'multer'
export const handleMulterErrors = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: "Multer error: " + err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(); 
    });
  };