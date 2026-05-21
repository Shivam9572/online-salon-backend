import { DataTypes } from "sequelize";
import db from "../config/DB.js";

const Feedback = db.define("feedback", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    appointment_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}
);

export default Feedback;