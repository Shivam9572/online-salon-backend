import {registerUser,loginUser,frogetPassword,resetPassword} from '../controllers/authController.js';
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password/:userType', frogetPassword);
router.post('/reset-password/:userType', resetPassword);


export default router;