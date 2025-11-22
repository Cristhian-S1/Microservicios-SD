const { Pool } = require("pg");
const { dbConfig } = require("./config");

function createPool(databaseName) {
  const pool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.pass,
    database: databaseName,
  });

  pool.on("connect", () => {
    console.log(`Conectado a PostgreSQL -> DB: ${databaseName}`);
  });

  return pool;
}

module.exports = { createPool };
