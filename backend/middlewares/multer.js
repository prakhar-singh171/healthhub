import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "../utils/appError.js";

// Resolve the __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else
    cb(new AppError('Only image files are allowed', 400), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
