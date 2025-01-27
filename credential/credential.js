const dotenv = require("dotenv");
dotenv.config();

const credentials = {
  SERVER_PORT: process.env.PORT || 6000,
  DB_URL: process.env.DB || "mongodb://127.0.0.1:27017/timecamp_db",
  JWT_SECRET: process.env.SECRET,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

module.exports = credentials;
