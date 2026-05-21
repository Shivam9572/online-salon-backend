import User from "../models/user.js";
import Admin from "../models/admin.js";
import Provider from "../models/provider.js";
import NewProvider from "../models/newProvider.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import db from "../config/DB.js";
import { sendOTPEmail } from "../services/mailer.js";
import e from "express";

export const registerUser = async (req, res) => {
    const { name, email, password, role, address, mobile } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = gernateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        if (existingUser) {
            // Resend OTP to unverified user
            await existingUser.update({ name, password: hashedPassword, role, address, mobile, otp, otpExpiry });
        } else {
            await User.create({ name, email, password: hashedPassword, role, address, mobile, otp, otpExpiry });
        }
        await sendOTPEmail(email, otp);

        res.json({ message: 'OTP sent to your email. Verify to complete registration.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error registering user", error });
    }
};

const generateToken = (user) => {
    
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}
const gernateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = await generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,      // ❌ JS can't access (secure)
            secure: true,       // true in production (HTTPS)
            sameSite: "none",
            maxAge:7*24* 60 * 60 * 1000 // 1 hour
        });
        let userData=user.toJSON();
        delete userData.password;
        delete userData.otp;
        delete userData.otpExpiry;
        delete userData.id;
    
        res.status(200).json({ message: "Login successful" ,data:userData});
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ where: { email, role: "admin" } });
        if (!user ) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = await generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,      // ❌ JS can't access (secure)
            secure: true,       // true in production (HTTPS)
            sameSite: "none",
            maxAge: 7*24*60 * 60 * 1000 // 1 hour
        });
        res.status(200).json({ message: "Admin login successful" });
    } catch (error) {
        console.log("Error during admin login:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

export const adminRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await Admin.findOne({ where: { email } });
        if (existingUser ) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = gernateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        await Admin.create({ name, email, password: hashedPassword, role: "admin"});
        
        res.json({ message: 'OTP sent to your email. Verify to complete registration.' });
    } catch (error) {
        res.status(500).json({ message: "Error registering admin", error });
    }
};

export const providerLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const provider = await Provider.findOne({ where: { email, role: "provider" } });
        if (!provider || !provider.isVerified) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await comparePassword(password, provider.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = await generateToken(provider);

        res.cookie("token", token, {
            httpOnly: false,      // ❌ JS can't access (secure)
            secure: true,       // true in production (HTTPS)
            sameSite: "none",
            maxAge:7* 24*60 * 60 * 1000 // 1 hour
        });
        res.status(200).json({ message: "Provider login successful",user:provider });
    } catch (error) {
        console.log("Error during provider login:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

export const providerRegister = async (req, res) => {
    const { name, email, password, salonName, salonAddress, salonContact } = req.body;
    console.log(name,email,password);
    const t = await db.transaction();
    try {
        // Validate required fields for provider registration
        if (!name || !email || !password || !salonName || !salonAddress || !salonContact) {
            return res.status(400).json({ message: "Missing required provider fields" });
        }
        const existingUser = await Provider.findOne({ where: { email } });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = gernateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            if (existingUser) {
                // Resend OTP to unverified provider
                await existingUser.update({ name, password: hashedPassword, salonName, salonAddress, salonContact, otp, otpExpiry },{transaction:t});
            } else {
                await Provider.create({ name, email, password: hashedPassword, salonName, salonAddress, salonContact, otp, otpExpiry },{transaction:t});
            }
          await sendOTPEmail(email, otp);
          await t.commit();
       res.json({ message: 'OTP sent to your email. Verify to complete registration.' });
    } catch (error) {

        await t.rollback();
        res.status(500).json({ message: "Error registering provider", error });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    
        const { userType } = req.params;    
         try {
     
        const Model = userType === "admin" ? Admin : userType === "provider" ? Provider : User;
        const user = await Model.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        await user.update({ isVerified: true, otp: null, otpExpiry: null });
        if(userType === "provider"){
            await NewProvider.create({  email: user.email});
        }
        res.json({ message: "Email verified successfully" ,data:{email,name:(user.toJSON()).name}});
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }   
};

// backend/routes/auth.js
export const verifyAuth = async (req, res) => {
  try {
    // Token is automatically available from httpOnly cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        message: "No token found" 
      });
    }
    
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if(!decode){
      return res.status(401).json({ 
        authenticated: false, 
        message: "unauthorized" 
      });
    }
    
    const Model = decode.role === "admin" ? Admin : decode.role === "provider" ? Provider : User;
    const user = await Model.findByPk(decode.id, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
    });
    
    if (!user) {
      return res.status(401).json({ 
        authenticated: false, 
        message: "User not found" 
      });
    }
    
    return res.status(200).json({
      authenticated: true,
      role:decode.role,
      user
    });
    
  } catch (error) {
    return res.status(401).json({ 
      authenticated: false, 
      message: "Invalid token" 
    });
  }
};

export const frogetPassword = async (req, res) => {
    const { email } = req.body;
    const { userType } = req.params;
    const Model = userType === "admin" ? Admin : userType === "provider" ? Provider : User;
    try {
        const user = await Model.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const otp = gernateOtp();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.update({ otp, otpExpiry });
        await sendOTPEmail(email, otp);
        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Error processing request", error });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newpassword } = req.body;
    const { userType } = req.params;
    const Model = userType === "admin" ? Admin : userType === "provider" ? Provider : User;
    try {
        const user = await Model.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        await user.update({ password: hashedPassword, otp: null, otpExpiry: null });
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        
        res.status(500).json({ message: "Error resetting password", error:error.message});
    }   
};


