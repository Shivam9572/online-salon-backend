import express from "express";
import { verifyOTP } from "../controllers/authController.js";
const router = express.Router();

router.post("/register/:userType", verifyOTP);
export default router;