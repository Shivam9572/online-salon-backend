import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Service = sequelize.define("Service", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  default_price: DataTypes.DECIMAL(10,2),
  default_duration: DataTypes.INTEGER
});
export default Service;