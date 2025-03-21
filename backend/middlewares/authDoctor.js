import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";

const authDoctor = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('aaa',authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.docId = decoded.id;

    next(); // Proceed to the next middleware or route handler
  } )

export default authDoctor;