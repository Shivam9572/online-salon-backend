import db from "../config/DB.js";
import { DataTypes } from "sequelize";

const Provider = db.define("Provider", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    salonName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salonAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salonContact: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    servicesOffered: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending"
    },
    role:{
        type: DataTypes.STRING,
        defaultValue: "provider"
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    available:{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  opening_time:{
    type: DataTypes.TIME,
    defaultValue: "09:00:00",
    allowNull: false
  },
  image:{
    type:DataTypes.STRING,
    allowNull:null
  },
  closing_time:{
    type: DataTypes.TIME,
    defaultValue: "20:00:00",
    allowNull: false
  }
});

export default Provider;