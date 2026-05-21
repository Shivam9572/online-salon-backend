import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const ProviderService = sequelize.define("ProviderService", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  provider_id: { type: DataTypes.UUID, allowNull: false },
  category_id: { type: DataTypes.UUID, allowNull: false },
  service_id: { type: DataTypes.UUID, allowNull: false },
  staff_id: { type: DataTypes.UUID, allowNull: false },
  custom_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  custom_duration: { type: DataTypes.INTEGER, allowNull: false },
  custom_description: { type: DataTypes.TEXT, allowNull: false }
});
export default ProviderService;