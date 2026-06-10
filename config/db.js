require("dotenv").config();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

db.getConnection()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ DB connection error:", err));

module.exports = db;/*require("dotenv").config();
const mysql = require("mysql2/promise");

// استخدم MYSQL_URL أو DATABASE_URL
const db = mysql.createPool(process.env.MYSQL_URL || process.env.DATABASE_URL);

// اختبار الاتصال
db.getConnection()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ DB connection error:", err));

module.exports = db;/*require("dotenv").config()
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.getConnection() 
    .then (()=> console.log(" base de donne connected"))
    .catch(err => console.log(err))
;

module.exports = db;*/