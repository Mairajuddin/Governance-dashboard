import USER from "../Models/UserSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";
import fs from "fs";

import { encryptPassword, generateOTP, sendEmail } from "../services/common_utils.js";
import { readSingleUser, updateSingleUser } from "../db/db.js";
const JWT_SECRET = process.env.JWT_SECRET; // Make sure it's in your .env
// -----------------------------REGISTER-------------------------------------
export const registerUser=async(req,res)=>{
try {
    const {name,email,password,role}=req.body 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }   
   const existingUser =await USER.findOne({ email: email });
   if(existingUser){
    return res.status(400).json({ message: 'User already exists' });
   }
 const saltRounds = 10;

const hashedPassword = await encryptPassword(password);


const newUser = new USER({
  name,
  email,
  password: hashedPassword,
  role: role || 'governance',
});
     await newUser.save();
     res.status(201).json({ message: 'User registered successfully', user: newUser });
} catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
// -----------------------------LOGIN-------------------------------------

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await USER.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ✅ Create JWT Token
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' }); // you can adjust expiry

    // ✅ Remove password before sending response
    const { password: pwd, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token, // ✅ JWT token
    });

  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// -----------------------------FORGET PASSWORD-------------------------------------

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await readSingleUser(USER, { email });

    if (user) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      const filePath = path.join(
        __dirname,
        "..",
        "services",
        "templates",
        "verifyOtp.ejs"
      );

      const otp_code = generateOTP();
      const subject = "Password Reset Request";

      const body = ejs.render(fs.readFileSync(filePath, "utf-8"), {
        otp_code,
      });

      await updateSingleUser(USER, { email }, { otp_code });
      await sendEmail(email, subject, body);
    }

    return res.status(200).json({
      success: true,
      message: "Success",
    });

  } catch (error) {
    console.error("Error in forgetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// -----------------------------VERIFY OTP-------------------------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp_code } = req.body;

    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const user = await readSingleUser(USER, { email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
console.log(user.otp_code, 'ssfsdfs',otp_code)
    if (user.otp_code !== otp_code) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    await updateSingleUser(USER, { email }, { otp_code: null });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// -----------------------------RESET PASSWORD-------------------------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const user = await readSingleUser(USER, { email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await encryptPassword(new_password);

    await updateSingleUser(USER, { email }, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};