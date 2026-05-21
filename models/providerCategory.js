import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";
const ProviderCategory = sequelize.define("ProviderCategory", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  provider_id: { type: DataTypes.UUID, allowNull: false },
  category_id: { type: DataTypes.UUID, allowNull: false }
});

export default ProviderCategory;