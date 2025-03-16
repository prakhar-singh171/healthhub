import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true, // Ensures a token is always present
    },
    email: {
        type: String,
        required: true, // Ensures email is mandatory
        match: [/.+\@.+\..+/, "Please enter a valid email"], // Validates email format
    },
    sub: {
        type: String,
        required: true, // Ensures the purpose of the token is specified
        default: "EmailVerification", // Default to email verification
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date/time
        expires: 45 * 60, // TTL (time-to-live) of 45 minutes (in seconds)
    },
});

// Create the model
const Token = mongoose.model('Token', tokenSchema);

export default Token;
