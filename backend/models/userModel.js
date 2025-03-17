import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
     
    },
    image: {
      type: String,
      default:
        "https://imgs.search.brave.com/olU1frCI_rKOD3-NBWDPcqTpdn8YDMNYb2wVQ2TmqlM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc",
    },
    speciality: {
      type: String,
      
    },
    address: {
      type: Object,
      default: { 
        line1: "",
        line2: ""
      },
    },
    gender: {
      type: String,
      default: "Not Selected",
    },
    dob: {
      type: String,
      default: "Not Selected",
    },
    isVerified: { type: Boolean, default: false },
    phone: {
      type: String,
      default: "00000000000",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // Skip if the password field hasn't been modified
    return next();
  }

  // Validate password length
  console.log(this.password)
  if (this.password.length < 8) {
    const error = new Error("Password must be at least 8 characters long");
    return next(error);
  }

  // Hash the password before saving
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;