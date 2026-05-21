// models/Chair.js

import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Chair = sequelize.define("Chair", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  provider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

}, {
  tableName: "Chairs",
  timestamps: true,
});

export default Chair;