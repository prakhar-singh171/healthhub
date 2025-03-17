import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        console.log(req.cookies);
        // console.log(req.cookie.token);
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
    } catch (error) {
        console.log('tt')

        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
};

export default authUser;