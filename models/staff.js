import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
const Staff = sequelize.define("Staff", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  provider_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  available:{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
});
export default Staff;