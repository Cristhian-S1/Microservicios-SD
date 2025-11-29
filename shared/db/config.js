const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  dbConfig: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "cristhian",
    pass: process.env.DB_PASS || "femayor9",
    database: process.env.DB_NAME || "dae",
  },
};
