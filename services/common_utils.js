import { compare, genSalt, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import {  readSingle, registerSingle } from "../db/db.js";
import USER from "../Models/UserSchema.js";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config(); 


const {SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_ROLE, SUPER_ADMIN_PASSWORD,OTP_LENGTH,EMAIL_USER,EMAIL_PASSWORD} = process.env;



export const encryptPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for encryption.");
  }
  const salt = await genSalt(10);
  return hashSync(password, salt);
};

export const createSuperAdmin = async () => {
  try {
    if (!SUPER_ADMIN_NAME || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_ROLE || !SUPER_ADMIN_PASSWORD) {
      console.error("❌ Missing one or more SUPER_ADMIN environment variables:");
      console.error({
        SUPER_ADMIN_NAME,
        SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_ROLE,
        SUPER_ADMIN_PASSWORD,
      });
      return;
    }

    const data = {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      role: SUPER_ADMIN_ROLE,
      password: await encryptPassword(SUPER_ADMIN_PASSWORD),
    };

    const superAdmin = await readSingle(USER, { email: data.email });

    if (!superAdmin) {
      await registerSingle(USER, data);
      console.log("✅ Super Admin Created Successfully");
    } else {
      console.log("ℹ️ Super Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error);
  }
};

export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateJWT = (data, tokenExpiry = false) => {
  return tokenExpiry
    ? jwt.sign(data, JWT_SECRET, { expiresIn: "1h" })
    : jwt.sign(data, JWT_SECRET);
};
export const sendEmail = async (to, subject, html) => {
  try {
    

    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      require: true,
      auth: {
         user: process.env.EMAIL_USER,     
    pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.verify((error, success) => {
      error ? console.log({ error }) : null;
    });

    const from = `Governance Services ${process.env.EMAIL_USER}`;

    var options = { from, to, subject, html };
    console.log(to,'ssss',from, subject);
    transporter.sendMail(options, (error, info) => {
      error
        ? console.error({ error })
        : console.log(`Mail has been sent successfully to: ${to}`);
    });
    console.log(`Mail has been sent successfully to: ${to}`);
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};
