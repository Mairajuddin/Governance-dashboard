import USER from "../Models/UserSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";
import fs from "fs";
import cloudinary from '../services/cloudinaryUtil.js';

import { encryptPassword, generateOTP, sendEmail } from "../services/common_utils.js";
import { readSingle, updateSingleUser } from "../db/db.js";
import PROJECT from "../Models/ProjectSchema.js";
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
console.log(user, 'user')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if(user.is_active === false) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact support.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
console.log(isMatch, 'isMatch')
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' }); // you can adjust expiry

    
    const { password: pwd, ...userWithoutPassword } = user.toObject();

if (user.role === 'project-manager') {
      const assignedProject = await PROJECT.findOne({ assigned_to: user._id, is_active: true }).lean();
      userWithoutPassword.assignedProject = assignedProject || null;
    }

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

    const user = await readSingle(USER, { email });

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

    const user = await readSingle(USER, { email });

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

    const user = await readSingle(USER, { email });

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

// ------------------------CHANGE PROFILE DATA------------------------------------


// export const changeProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: 'Name is required' });
//     }

//     const updatedFields = { name };

//     if (req.file) {
      
//       const avatarPath = `/uploads/avatars/${req.file.filename}`;
//       updatedFields.avatar = avatarPath;
//     }


//     const updatedUser = await USER.findByIdAndUpdate(userId, updatedFields, { new: true });

//     res.status(200).json({ message: 'Profile updated', user: updatedUser });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



export const changeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedFields = { name };

    // If file is uploaded
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user_avatars', // optional: folder name in your Cloudinary account
        public_id: `avatar_${userId}`, // optional: custom public_id
        overwrite: true, // overwrite previous image if same public_id
      });

      // Set the avatar URL from Cloudinary
      updatedFields.avatar = uploadResult.secure_url;

      // Remove the local file after upload
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await USER.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.status(200).json({
      message: 'Profile updated',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------CHANGE PASSWORD--------------------------------------------------------

export const changePassword = async (req, res) => {
  try {
    const { password, newpassword } = req.body;
    const { _id } = req.user;

    if (!password || !newpassword) {
      return res.status(400).json({ message: 'Old and new password are required' });
    }

    const user = await USER.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// -----------------GET MY PROFILE-----------------------------------------------
// export const getMyProfile=async(req,res)=>{
//   try {
//     const {_id}=req.user;
//   const user=await USER.findOne({_id:_id})
//   return  res.status(200).json({data:user})
//   } catch (error) {
//     console.log(error)
//     return  res.status(500).json({message:'Internal Sever Error'})
//   }
// }
export const getMyProfile = async (req, res) => {
  try {
    const { _id } = req.user;

    // Fetch user
    const user = await USER.findOne({ _id }).lean(); // .lean() returns a plain JS object

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is project-manager, fetch assigned project
    if (user.role === 'project-manager') {
      const assignedProject = await PROJECT.findOne({ assigned_to: _id, is_active: true }).lean();
      user.assignedProject = assignedProject || null;
    }

    // Return user with embedded assignedProject
    return res.status(200).json({ data: user });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};