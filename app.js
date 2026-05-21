import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import db from "./config/DB.js";

import  './models/user.js';
import  './models/admin.js';
import  './models/appointment.js';
import './models/category.js';
import  './models/chair.js';
import  './models/feedback.js';
import './models/newProvider.js';
import  './models/provider.js';
import  './models/providerCategory.js';
import  './models/providerService.js';
import  './models/service.js';
import  './models/staff.js';
import  './models/staffSkill.js';


import "./models/association.js";
import authRouter from "./routers/userAuth.js";
import adminAuthRouter from "./routers/adminAuth.js";
import providerAuthRouter from "./routers/providerAuth.js";
import feedbackRouter from "./routers/feedback.js";
import adminRouter from "./routers/admin.js";
import userRouter from "./routers/user.js";
import providerRouter from "./routers/provider.js";
import verifyOtpRouter from "./routers/verifyotp.js";
import staffRouter from "./routers/staff.js";
import categoryRouter from './routers/category.js';
import serviceRouter from './routers/service.js';
import paymentRouter from  "./routers/pament.js";
import { createServer } from 'http';
import socketConnect from './socket/connection.js';
import appointmentRouter from "./routers/appointment.js";
import { verifyAuth } from './controllers/authController.js';
import "./crons/cleanAppointments.js";


const app = express();
// Allow dev frontend (http://localhost:3000) to send/receive cookies
const corsOptions = {
    origin:[ process.env.FRONTEND_ORIGIN , process.env.FRONTEND_USER ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   
app.use(cookieParser()); 

const httpServer = createServer(app);
socketConnect(httpServer);

app.get("/api", (req, res) => {
    res.send("Welcome to the Salon Management System API");
});
app.use("/api/auth/customer", authRouter);
app.use("/api/auth/admin", adminAuthRouter);
app.use("/api/auth/provider", providerAuthRouter);
app.use("/api/admin", adminRouter);
app.use("/api/customer", userRouter);
app.use("/api/provider", providerRouter);
app.use("/api/verify", verifyOtpRouter);
app.use("/api/staff", staffRouter);
app.use("/api/category", categoryRouter);
app.use("/api/service", serviceRouter);
app.use("/api/appointment",appointmentRouter);
app.use("/api/payment",paymentRouter);
app.get("/api/verifyAuth",verifyAuth);
app.use("/api/feedback",feedbackRouter);
const port=process.env.PORT;
httpServer.listen(port, async() => {
    console.log("Server is running on port "+port);
    try {
        console.log("Connecting to the database...");
        await db.authenticate();
        console.log("Database connection established successfully.");
    } catch (error) {
       console.log("Error connecting to the database:", error); 
    }
});