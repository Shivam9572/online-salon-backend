import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const db=new sequelize(process.env.MYSQLDATABASE,process.env.MYSQLUSER,process.env.MYSQLPASSWORD,{
    host:process.env.MYSQLHOST,
    port:process.env.MYSQLPORT,
    dialect:"mysql",
    logging:false,
    timezone:"+00:00",
    dialectOptions:{
        timezone:"+00:00"
    }
});

export default db;
