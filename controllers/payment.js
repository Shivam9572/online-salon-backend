import { verifyPaymentService,createOrderId } from "../services/razorpay.js";
import {Appointment} from "../models/association.js";



export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details missing" });
    }

    // --- Signature verify karo ---
    

    const isValid = await verifyPaymentService(razorpay_order_id,razorpay_payment_id,razorpay_signature);

    if (!isValid) {
      // Signature match nahi hua → payment tampered
     
      return res.status(400).json({success:false, message: "Payment verification failed" });
    }

    // --- Signature valid → appointment confirm karo ---
    const appointment=await Appointment.findOne({where:{id:appointmentId}})
   
     appointment.payment_status="paid";
     appointment.razorpay_payment_id=razorpay_payment_id;
     await appointment.save();

    return res.status(200).json({success:true, message: "Payment  successfully" });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({success:false, message:  error.message });
  }
};