module.exports={
  "development": {
    "username": "root",
    "password": "12345",
    "database": "salon_management",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "12345",
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.MYSQLUSER,
    "password": process.env.MYSQLPASSWORD,
    "database": process.env.MYSQLDATABASE,
    "host": process.env.MYSQLHOST,
    "port": Number(process.env.MYSQLPORT),
    "dialect": "mysql"
  }
}
