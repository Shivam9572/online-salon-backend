import cron from 'node-cron';
import  { Op } from 'sequelize';
import  {Appointment,User,Staff,Provider} from '../models/association.js'; // Your Appointment model
import { sendAppointmentReminderEmail } from '../services/mailer.js';

// Run at 00:01:00 every day (1 minute past midnight)
export const cleanupPendingAppointments = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // ✅ UTC midnight = IST 5:30 AM... 
    
    // Better — IST midnight UTC mein
    // IST midnight = UTC 18:30 previous day
    const istMidnightUTC = new Date();
    istMidnightUTC.setUTCHours(18, 30, 0, 0); // IST 00:00 = UTC 18:30
    
    // Agar abhi UTC 18:30 se pehle hai toh kal ka 18:30 lo
    if (new Date() < istMidnightUTC) {
      istMidnightUTC.setUTCDate(istMidnightUTC.getUTCDate() - 1);
    }

    const expiredAppointments = await Appointment.findAll({
      where: {
        status: 'pending',
        start_time: { [Op.lt]: istMidnightUTC } // ✅ IST aaj se pehle
      }
    });

    if (expiredAppointments.length === 0) return;

    await Appointment.destroy({
      where: { id: expiredAppointments.map(apt => apt.id) }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in cleanup job:`, error);
  }
};
const sendRemainder = async () => {
  try {
    const now = new Date();                                    // UTC ✅
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // UTC ✅

    const appointments = await Appointment.findAll({
      where: {
        status: { [Op.in]: ["confirmed"] },
        sent_remainder: false,
        start_time: {
          [Op.between]: [now, oneHourLater] // ✅ Direct UTC compare, no offset
        }
      },
      include: [
        { model: User,     attributes: ["name", "email"], as: "customer" },
        { model: Provider, attributes: ["salonName"],     as: "provider" },
        { model: Staff,    attributes: ["name"],          as: "staff"    }
      ]
    });

    if (appointments.length === 0) return;

    for (const appointment of appointments) {
      if (appointment.sent_remainder) continue;

      await sendAppointmentReminderEmail(
        appointment.customer.email,
        appointment.customer.name,
        appointment.provider.salonName,
        appointment.staff.name,
        appointment.start_time, // UTC — email function mein IST convert karo
        appointment.end_time
      );

      appointment.sent_remainder = true;
      await appointment.save();
    }

  } catch (error) {
    console.error("Reminder cron error:", error);
  }
};

// Schedule cron job to run at 00:01:00 every day
// Cron pattern: 1 0 * * *
// ┌───────────── minute (0-59) - 1
// │ ┌─────────── hour (0-23)   - 0
// │ │ ┌───────── day of month (1-31) - *
// │ │ │ ┌─────── month (1-12) - *
// │ │ │ │ ┌───── day of week (0-6) - *
// │ │ │ │ │
// 1 0 * * *
cron.schedule('1 0 * * *', cleanupPendingAppointments, {
  scheduled: true,
  timezone: "Asia/Kolkata" // IST timezone
});




cron.schedule("*/2 * * * *", sendremainder, {
  timezone: "Asia/Kolkata"
});



// For testing purposes (uncomment to run immediately)
// cleanupPendingAppointments();

