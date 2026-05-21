import db from "../config/DB.js";
import { DataTypes } from "sequelize";

const NewProvider = db.define("NewProvider", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

export default NewProvider;