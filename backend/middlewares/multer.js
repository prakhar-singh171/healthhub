import multer from "multer";
import AppError from "../utils/appError.js";

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new AppError("Only image files are allowed", 400), false);
    }
};

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;
