import {providerLogin, providerRegister,frogetPassword,resetPassword} from "../controllers/authController.js";
import express from 'express';
const router = express.Router();

router.post('/register', providerRegister);
router.post('/login', providerLogin);
router.post('/forgot-password/:userType', frogetPassword);
router.post('/reset-password/:userType', resetPassword);
export default router;