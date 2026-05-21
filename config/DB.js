import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const db=new sequelize(process.env.MYSQLDATABASE,process.env.MYSQLUSER,process.env.MYSQLPASSWORD,{
    host:process.env.MYSQLHOST,
    port:process.env.MYSQLPORT,
    dialect:"mysql",
    logging:false,
    timezone:"+05:30"
});

export default db;
