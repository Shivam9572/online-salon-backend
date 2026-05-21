import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'smtp',
  port:465,
  secure:true,
  auth:{
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
});

export const sendOTPEmail = async (to, otp) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_SENDER, name: 'onlinesalon' },
      to: [{ email: to }],
      subject: 'Your appointment status',
      htmlContent: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:8px;color:#4F46E5">${otp}</h1>
          <p>Valid for <b>5 minutes</b>. Do not share it.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("❌ Brevo error:", err);
    throw new Error(err.message);
  }

  console.log("✅ Email sent to:", to);
};

export const sendAppointmentStatusEmail = async (to, customerName, start_time, end_time, status, salonName, appointmentId) => {
  const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const statusMessages = {
    confirmed: 'has been confirmed',
    pending: 'is pending confirmation',
    cancelled: 'has been cancelled',
    completed: 'has been completed',
    rejected: 'has been rejected'
  };

  const statusColors = {
    confirmed: '#10B981',
    pending: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#3B82F6',
    rejected: '#DC2626'
  };

   const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API,
      'Content-Type': 'application/json'
    },

  body: JSON.stringify({
    from: `"Online Salon" <${process.env.GMAIL_USER}>`,
     sender: { email: process.env.BREVO_SENDER, name: 'onlinesalon' },
      to: [{ email: to }],
    subject: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} - ${salonName}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 550px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #c9a96e 0%, #e8c88a 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #0a0a0f; margin: 0; font-size: 24px;">
              Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear <strong>${customerName}</strong>,</p>
            <p style="color: #555; margin-bottom: 25px;">
              Your appointment ${statusMessages[status] || 'status updated'}.
            </p>
            
            <!-- Appointment Details -->
            <div style="background: #f8f8f8; border-left: 4px solid ${statusColors[status] || '#c9a96e'}; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📋 Appointment Details</h3>
              <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${formatDateTime(start_time)}</p>
              <p style="margin: 8px 0;"><strong>⏰ Time:</strong> ${formatDateTime(start_time)} - ${new Date(end_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              <p style="margin: 8px 0;"><strong>📍 Salon:</strong> ${salonName}</p>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <span style="display: inline-block; padding: 4px 12px; background: ${statusColors[status]}20; color: ${statusColors[status]}; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  Status: ${status.toUpperCase()}
                </span>
              </div>
            </div>
            
           
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">Thank you for choosing us!</p>
              <p style="color: #999; font-size: 11px;">© 2024 Online Salon. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
     })
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("❌ Brevo error:", err);
    throw new Error(err.message);
  }

  console.log("✅ Email sent to:", to);
};


export const sendAppointmentReminderEmail = async (
  to,
  customerName,
  providerName,
  staffName,
  start_time,
  end_time
) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_SENDER, name: 'onlinesalon' },
      to: [{ email: to }],
      subject: 'remainder your appointment',
      htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>

    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">

      <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#111827,#1f2937);padding:35px 20px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
            Appointment Reminder
          </h1>

          <p style="margin-top:10px;color:#d1d5db;font-size:15px;">
            Your salon appointment is coming up soon
          </p>
        </div>

        <!-- Body -->
        <div style="padding:35px 30px;">

          <p style="font-size:16px;color:#374151;margin-bottom:18px;">
            Hi <strong>${customerName}</strong>,
          </p>

          <p style="font-size:15px;line-height:1.7;color:#6b7280;margin-bottom:28px;">
            This is a friendly reminder about your upcoming appointment.
            Please arrive 10 minutes early for a smooth experience.
          </p>

          <!-- Appointment Card -->
          <div style="
            background:#fafafa;
            border:1px solid #e5e7eb;
            border-radius:14px;
            padding:24px;
            margin-bottom:30px;
          ">

            <h2 style="
              margin-top:0;
              margin-bottom:20px;
              font-size:20px;
              color:#111827;
            ">
              📋 Appointment Details
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-size:14px;">
                  📍 Salon
                </td>

                <td style="
                  padding:10px 0;
                  color:#111827;
                  font-weight:600;
                  text-align:right;
                  font-size:14px;
                ">
                  ${providerName}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#6b7280;font-size:14px;">
                  💇 Staff
                </td>

                <td style="
                  padding:10px 0;
                  color:#111827;
                  font-weight:600;
                  text-align:right;
                  font-size:14px;
                ">
                  ${staffName}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#6b7280;font-size:14px;">
                  📅 Date
                </td>

                <td style="
                  padding:10px 0;
                  color:#111827;
                  font-weight:600;
                  text-align:right;
                  font-size:14px;
                ">
                  ${formatDate(start_time)}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#6b7280;font-size:14px;">
                  ⏰ Time
                </td>

                <td style="
                  padding:10px 0;
                  color:#111827;
                  font-weight:600;
                  text-align:right;
                  font-size:14px;
                ">
                  ${formatTime(start_time)} - ${formatTime(end_time)}
                </td>
              </tr>
            </table>

          </div>

          <!-- Note -->
          <div style="
            background:#fff7ed;
            border-left:4px solid #f59e0b;
            padding:16px;
            border-radius:10px;
            margin-bottom:28px;
          ">
            <p style="
              margin:0;
              color:#92400e;
              font-size:14px;
              line-height:1.6;
            ">
              Please make sure to arrive on time. If you need to reschedule or cancel,
              kindly contact the salon before your appointment time.
            </p>
          </div>

          <!-- Footer -->
          <div style="
            border-top:1px solid #e5e7eb;
            padding-top:22px;
            text-align:center;
          ">

            <p style="
              margin:0 0 8px 0;
              color:#111827;
              font-size:15px;
              font-weight:600;
            ">
              Thank you for choosing us ✨
            </p>

            <p style="
              margin:0;
              color:#9ca3af;
              font-size:12px;
            ">
              © 2026 Online Salon. All rights reserved.
            </p>

          </div>

        </div>
      </div>

    </body>
    </html>
    `
     })
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("❌ Brevo error:", err);
    throw new Error(err.message);
  }

  console.log("✅ Email sent to:", to);
};