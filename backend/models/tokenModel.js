import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
    },
    sub: {
        type: String,
        required: true, 
        default: "EmailVerification", 
    },
    createdAt: {
        type: Date,
        default: Date.now, 
        expires: 45 * 60, 
    },
});

// Create the model
const Token = mongoose.model('Token', tokenSchema);

export default Token;
