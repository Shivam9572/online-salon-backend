// controllers/appointment.controller.js

import { Sequelize, Op, where } from "sequelize";

import { Appointment, Provider, Service, Staff, Chair, User, ProviderService, Category, Feedback } from "../models/association.js";
import db from "../config/DB.js";
import razorpay from "../config/razoypay.js";
import { createOrderId } from "../services/razorpay.js";
import { sendAppointmentStatusEmail } from "../services/mailer.js";

// controllers/appointmentController.js



export const getAvailableSlots = async (req, res) => {
  try {
    const customerId = req.user.id;
    let { staffId, serviceId, providerId, date } = req.body;

    // ─── 1. User check ───────────────────────────────────────
    const customer = await User.findOne({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ─── 2. Provider check ───────────────────────────────────
    let provider = await Provider.findOne({
      where: { id: providerId, status: "approved" },
    });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // ─── 3. Service check + duration lena ────────────────────
    const service = await Service.findOne({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    // Make sure this exists in your DB

    // ─── 4. Staff check ──────────────────────────────────────
    const staff = await Staff.findOne({
      where: { id: staffId, provider_id: providerId },
    });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    if (!staff.available) {
      return res.status(400).json({ success: false, message: "Staff is not available" });
    }
    let providerService = await ProviderService.findOne({ where: { provider_id: providerId, service_id: serviceId, staff_id: staffId } });
    if (!providerService) {
      return res.status(404).json({ success: false, message: "staff services not found" });
    }
    let nowDate = new Date();


    let duration = parseInt((providerService.toJSON()).custom_duration);
    if (!date) {
      date = nowDate;
    } else {
      date = new Date(date);
      if (date.getDate() < nowDate.getDate()) {
        return res.status(409).json({ success: false, message: "Appoinment not allow previous date" });
      }
    }
    const istToUtc = (date, hours, minutes) => {
      const d = new Date(date);
      // IST = UTC + 5:30, toh UTC = IST - 5:30
      d.setUTCHours(hours - 5, minutes - 30, 0, 0);
      // Handle negative minutes/hours
      return d;
    };

    provider = provider.toJSON();
    let providerClosingTime = provider.closing_time.split(":");
    let providerOpeningTime = provider.opening_time.split(":");
    providerOpeningTime = providerOpeningTime.map((s) => {
      return parseInt(s);
    });
    providerClosingTime = providerClosingTime.map((s) => {
      return parseInt(s);
    });
    let starttime = istToUtc(date, openH, openM); // 9:00 IST → 03:30 UTC
    let endTime = istToUtc(date, closeH, closeM);

    if (date.getDate() == nowDate.getDate() && nowDate.getTime() > endTime.getTime()) {
      return res.status(404).json({ success: false, message: "shop is now close" });
    }

    if (date.getDate() == nowDate.getDate()) {
      const nowUtc = new Date(); // new Date() hamesha UTC hota hai internally
      if (nowUtc > starttime) starttime = nowUtc;
    }

    // ─── 7. Get booked appointments for that date ─────────────
    let bookedAppointments = await Appointment.findAll({
      where: {
        [Op.or]: [{ customer_id: customerId }, { staff_id: staffId }],
        status: { [Op.notIn]: ["cancelled", "completed"] },
        start_time: { [Op.between]: [starttime, endTime] }
      },
      attributes: ["start_time", "end_time"],
      order: [["start_time", "ASC"]]
    });


    bookedAppointments = JSON.parse(JSON.stringify(bookedAppointments));


    let timeSlots = [];
    const toIST = (minutes) => minutes + 330;
    let initTime = starttime.getUTCHours() * 60 + starttime.getUTCMinutes();

    bookedAppointments.map((t) => {
      let start_time = new Date(t.start_time);
      let end_time = new Date(t.end_time);

      let start_hour = start_time.getUTCHours();
      let end_hour = end_time.getUTCHours();
      let start_minute = start_time.getUTCMinutes();
      let end_minute = end_time.getUTCMinutes();

      if (start_hour * 60 + start_minute - duration > initTime) {

        

        timeSlots.push({
          start: [
            parseInt(toIST(initTime) / 60),
            toIST(initTime) % 60
          ],
          end: [
            parseInt(toIST((start_hour * 60) + start_minute - duration) / 60),
            toIST((start_hour * 60) + start_minute - duration) % 60
          ]
        });

      }

      initTime = end_hour * 60 + end_minute;
    });


    if (initTime < (providerClosingTime[0] * 60 + providerClosingTime[1] - 330) - duration) {
      timeSlots.push({
        start: [parseInt(toIST(initTime)  / 60), initTime % 60],
        end: [parseInt(((providerClosingTime[0] * 60) + providerClosingTime[1] - duration) / 60), ((providerClosingTime[0] * 60) + providerClosingTime[1] - duration) % 60]
      });
    }

    return res.status(200).json({ success: true, timeSlots });

  } catch (error) {
    console.error("Error in getAvailableSlots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
      error: error.message
    });
  }
};

// Helper function to format time to 12-hour format
function formatTimeTo12Hour(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}


// ======================================
// CREATE APPOINTMENT
// ======================================
// Backend controller (updated)
export const createAppointment = async (req, res) => {
  try {
    const customer_id = req.user.id; // Get from auth middleware

    const {
      provider_id,
      service_id,
      staff_id,
      start_time,
      end_time,
      notes,
      amount,
      duration, payment_type,

    } = req.body;

    if (
      !provider_id ||
      !service_id ||
      !staff_id ||
      !start_time ||
      !end_time ||
      !payment_type ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (payment_type == "online" || payment_type == "cash") {
      const startOfDay = new Date(start_time);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(start_time);
      endOfDay.setHours(23, 59, 59, 999);
      const existingAppointment = await Appointment.findOne({
        where: {
          staff_id,
          start_time: {
            [Op.between]: [startOfDay, endOfDay]
          }, status: {
            [Op.notIn]: ["cancelled", "completed"],
          },

          [Op.and]: [
            { start_time: { [Op.lt]: end_time } },   // existing starts before new ends
            { end_time: { [Op.gt]: start_time } },  // existing ends after new starts
          ],
        },
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: "Selected time slot already booked",
        });
      }
      const customer = await Appointment.findOne({
        where: {
          customer_id,
          start_time: {
            [Op.between]: [startOfDay, endOfDay]
          },
          status: {
            [Op.notIn]: ["cancelled", "completed"],
          },
          [Op.and]: [
            { start_time: { [Op.lt]: end_time } },   // existing starts before new ends
            { end_time: { [Op.gt]: start_time } },  // existing ends after new starts
          ],

        }
      });
      if (customer) {
        return res.status(402).json({ success: false, message: `your appointemnt already booked in this time` });
      }
      let orderId;
      if (payment_type == "online") {
        orderId = await createOrderId(amount);
      }

      const appointment = await Appointment.create({
        customer_id,
        provider_id,
        service_id,
        staff_id,
        start_time,
        end_time,
        razorpay_order_id: orderId || null,
        status: "pending",
        payment_status: "unpaid",
        amount,
        notes: notes || null,
        payment_type

      });

      // Optionally store customer details and notes in a separate table
      // or update the appointment with additional info

      return res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment,
        orderId
      });
    } else {
      return res.status(429).json({ success: false, message: "payment type not valid" });
    }
    // CHECK OVERLAPPING APPOINTMENTS

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
};




// ======================================
// GET USER APPOINTMENTS
// ======================================

export const getUserAppointments = async (req, res) => {
  try {
    const id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: "user not found" });
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: {
        customer_id: id,
      },
      include: [
        {
          model: Provider,
          attributes: [
            "id",
            "salonName",
            "salonAddress",
            "salonContact",
          ],
          as: "provider"
        }, {
          model: Feedback,
          attributes: ["rating", "comment"],
          as: "feedback"
        },
        {
          model: ProviderService,
          attributes: [
            "custom_price",
            "custom_duration",
            "custom_description",
          ],
          on: {
            service_id: { [Op.col]: 'Appointment.service_id' },
            staff_id: { [Op.col]: 'Appointment.staff_id' }
          },
          required: true,
          include: [{
            model: Service,
            attributes: ["name"]
          }]
        },

        {
          model: Staff,
          attributes: [
            "id",
            "name",
            "phone",
          ],
          as: "staff"
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};




// ======================================
// GET SINGLE APPOINTMENT
// ======================================

export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const customer_id = req.user.id;

    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        customer_id,
      },
      include: [
        {
          model: Provider,
          attributes: [
            "id",
            "salonName",
            "salonAddress",
            "salonContact",
          ],
        },
        {
          model: Service,
          attributes: [
            "id",
            "name",
            "price",
            "duration",
          ],
        },
        {
          model: Staff,
          attributes: [
            "id",
            "name",
            "phone",
          ],
        },
        {
          model: Chair,
          attributes: [
            "id",
            "name",
          ],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
};




// ======================================
// CANCEL APPOINTMENT
// ======================================

export const cancelAppointment = async (req, res) => {
  const t = await db.transaction();
  try {

    const { appointmentId } = req.params;

    const customer_id = req.user.id;



    const appointment = await Appointment.findOne({

      where: {
        id: appointmentId,
        customer_id,
      },
      include: [{
        model: User,
        attributes: ["email", "name"],
        as: "customer"
      }, {
        model: Provider,
        attributes: ["salonName"],
        as: "provider"
      }]

    });



    if (!appointment) {

      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });

    }

    if (appointment.status === "completed") {

      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });

    }

    await appointment.destroy({ transaction: t });
    const appointDetails = JSON.parse(JSON.stringify(appointment));

    await sendAppointmentStatusEmail(appointDetails.customer.email, appointDetails.customer.name, appointDetails.start_time, appointDetails.end_time, "cancelled",
      appointDetails.provider.salonName, appointmentId
    );
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });

  }

  catch (error) {
    await t.rollback();
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });

  }

};

export const getProviderAppointment = async (req, res) => {
  const id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const provider = await Provider.findOne({ where: { id } });
    if (!provider) {
      return res.status(404).json({ success: false, message: "provider is not found" });
    }
    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: { provider_id: id },
      attributes: ["id", "start_time", "end_time", "status", "createdAt"],
      include: [{
        model: Staff,
        attributes: ["name", "phone", "available"],
        as: "staff"
      }, {
        model: User,
        attributes: ["name", "email", "address", "mobile"],
        as: "customer"

      }, {
        model: Feedback,
        attributes: ["rating", "comment"],
        as: "feedback"
      }, {
        model: ProviderService,
        attributes: [
          "custom_price",
          "custom_duration",
          "custom_description",
        ],
        on: {
          service_id: { [Op.col]: 'Appointment.service_id' },
          staff_id: { [Op.col]: 'Appointment.staff_id' }
        },
        required: true,
        include: [{
          model: Service,
          attributes: ["name"]
        }, {
          model: Category,
          attributes: ["name"]
        }]
      }
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    }
    );
    return res.status(200).json({
      success: true, message: appointments, pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const setAppointmentStatus = async (req, res) => {
  const t = await db.transaction();
  const id = req.user.id;
  try {
    const { appointmentId } = req.params;
    const { status } = req.query;
    const provider = await Provider.findOne({ where: { id } });
    if (!provider) {
      return res.status(404).json({ success: false, message: "provider not found" });
    }
    if (status == "rejected" || status === "comfirmed" || "completed") {

      const appointment = await Appointment.findOne({

        where: {
          id: appointmentId,
        },
        include: [{
          model: User,
          attributes: ["email", "name"],
          as: "customer"
        }, {
          model: Provider,
          attributes: ["salonName"],
          as: "provider"
        }]

      }); if (!appointment) {
        return res.status(404).json({ success: false, message: "appointment not found" });

      }
      const appointDetails = JSON.parse(JSON.stringify(appointment));



      appointment.status = status;
      await appointment.save({ transaction: t });
      await sendAppointmentStatusEmail(appointDetails.customer.email, appointDetails.customer.name, appointDetails.start_time, appointDetails.end_time, status,
        appointDetails.provider.salonName, appointmentId
      );
      await t.commit();
      return res.status(200).json({ success: true, message: "status changed successfull" })
    }
    await t.rollback();
    res.status(429).json({ success: false, messgae: "invalid status" });

  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ success: "false", message: error.message });
  }
}