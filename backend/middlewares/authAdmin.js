import jwt from 'jsonwebtoken'
import catchAsync from '../utils/catchAsync.js';
const authAdmin = catchAsync(async (req, res, next) => {
        const authHeader = req.headers.authorization || req.headers.Authorization; 
        if (!authHeader) {
            return res.json({ success: false, message: "Not Authorized, Login Again" });
        }
        const token = authHeader.split(' ')[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: "Not Authorized, Login Again" });
        }
        req.user = decoded; 
        next();
    } )
export default authAdmin