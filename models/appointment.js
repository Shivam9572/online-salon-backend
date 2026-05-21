// models/Appointment.js

import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Appointment = sequelize.define("Appointment", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  provider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  staff_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  service_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  chair_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM(
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "rejected"
    ),
    defaultValue: "pending",
  },razorpay_order_id: {
  type: DataTypes.STRING(100),
  allowNull: true,
},

razorpay_payment_id: {
  type: DataTypes.STRING(100),
  allowNull: true,
},

payment_status: {
  type: DataTypes.ENUM("unpaid", "paid", "refunded"),
  defaultValue: "unpaid",
  allowNull: false,
},

amount: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
},

notes: {
  type: DataTypes.TEXT,
  allowNull: true,
},
 payment_type:{
  type:DataTypes.ENUM("online","cash"),
  defaultValue:"cash"
 },sent_remainder:{
  type:DataTypes.BOOLEAN,
  defaultValue:false
 }
}, {
  tableName: "Appointments",
  timestamps: true,
});

export default Appointment;