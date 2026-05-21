import {adminLogin, adminRegister,frogetPassword,resetPassword} from "../controllers/authController.js";
import express from 'express';
const router = express.Router();

router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/forgot-password/:userType', frogetPassword);
router.post('/reset-password/:userType', resetPassword);

export default router;