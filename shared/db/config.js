const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  dbConfig: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    pass: process.env.DB_PASS || "1234",
  },
};
