import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';

const authUser = catchAsync(async (req, res, next) => {
        // console.log('--------',req.);
         console.log(req.cookies.token);
        let token;
        if (
          req.headers.authorization &&
          req.headers.authorization.startsWith('Bearer')
        ) {
          token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
          token = req.cookies.token;
        }

        console.log(token); 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        console.log(decoded)
        req.body.userId = decoded.id;
        req.user = decoded; 
        next(); 
    } )

export default authUser;