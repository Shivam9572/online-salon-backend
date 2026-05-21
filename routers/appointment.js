// routes/appointment.routes.js

import express from "express";

import {
  createAppointment,
  getUserAppointments,
  getAppointmentDetails,
  cancelAppointment,getAvailableSlots,getProviderAppointment,setAppointmentStatus
} from "../controllers/appointment.js";

import { validProvider, validUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", validUser,createAppointment);

router.get("/", validUser, getUserAppointments);
router.get("/provider",validProvider,getProviderAppointment);

router.get("/:appointmentId", validUser, getAppointmentDetails);

router.delete("/:appointmentId/cancel", validUser, cancelAppointment);
router.patch("/:appointmentId/status-set", validProvider, setAppointmentStatus);

router.post("/slots", validUser, getAvailableSlots);

export default router;