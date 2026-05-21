import {postFeedback} from "../controllers/feedback.js";
import { validUser } from "../middleware/authMiddleware.js";
import express from "express";

const router=express.Router();

router.post("/:appointment_id",validUser,postFeedback);

export default router;