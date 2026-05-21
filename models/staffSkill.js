import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
const StaffSkill = sequelize.define("StaffSkill", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  staff_id: { type: DataTypes.UUID, allowNull: false },
  service_id: { type: DataTypes.UUID, allowNull: false }
});
export default StaffSkill;