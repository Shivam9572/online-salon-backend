import razorpay from "../config/razoypay.js";
import crypto from "crypto";
export const createOrderId=async(amount)=>{
   const order= await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise mein convert
            currency: "INR",
            receipt: `appt_${Date.now()}`,
          });
          return order.id;
}

export const verifyPaymentService = async (razorpay_order_id, razorpay_payment_id,razorpay_signature) => {

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("orderId not found");
    }

    // --- Signature verify karo ---
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === razorpay_signature;

    
  
};