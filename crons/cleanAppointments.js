import cron from 'node-cron';
import  { Op } from 'sequelize';
import  {Appointment,User,Staff,Provider} from '../models/association.js'; // Your Appointment model
import { sendAppointmentReminderEmail } from '../services/mailer.js';

// Run at 00:01:00 every day (1 minute past midnight)
export const cleanupPendingAppointments = async () => {
  try {
   
    
    // Get current date at midnight (start of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all pending appointments from previous dates
    const expiredAppointments = await Appointment.findAll({
      where: {
        status: 'pending',
        start_time: {
          [Op.lt]: today // Start time is before today
        }
      }
    });

    if (expiredAppointments.length === 0) {
      return;
    }


    // Delete or update status based on your requirement
    // Option 1: Delete permanently
    const deletedCount = await Appointment.destroy({
      where: {
        id: expiredAppointments.map(apt => apt.id)
      }
    });

    // Option 2: Update status to 'cancelled' instead of deleting
    // const updatedCount = await Appointment.update(
    //   { status: 'cancelled', updatedAt: new Date() },
    //   {
    //     where: {
    //       id: expiredAppointments.map(apt => apt.id)
    //     }
    //   }
    // );

    
   

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in cleanup job:`, error);
  }
};
const sendremainder=async () => {
  try {


    // Current time
    const now = new Date();

    // Next 1 hour
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
     
    // Find appointments between now and next 1 hour
    const appointments = await Appointment.findAll({
      where: {
        status: {
          [Op.in]: ["confirmed"]
        },
        sent_remainder:false,
        start_time: {
          [Op.between]: [new Date(now.getTime()+(5.5*60*60*1000)), new Date(oneHourLater.getTime()+(5.5 * 60 *60 * 1000))]
        }
      },

      include: [
        {
          model: User,
          attributes: ["name", "email"],
          as:"customer"
        },

        {
          model: Provider,
          attributes: ["salonName"],
          as:"provider"
        },

        {
          model: Staff,
          attributes: ["name"],
          as:"staff"
        }
      ]
    });

    if (appointments.length === 0) {
     
      return;
    }


    for (const appointment of appointments) {

      // Optional protection
      // Avoid duplicate reminder emails
      if (appointment.sent_remainder) {
        continue;
      }

      await sendAppointmentReminderEmail(
        appointment.customer.email,
        appointment.customer.name,
        appointment.provider.salonName,
        appointment.staff.name,
        appointment.start_time,
        appointment.end_time
      );


      // Mark reminder as sent
      appointment.sent_remainder = true;

      await appointment.save();
    }

  } catch (error) {

    console.error("Reminder cron error:", error);

  }
}

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

