const { Pool } = require("pg");
const { dbConfig } = require("./config");

function createPool() {
  const pool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.pass,
    database: dbConfig.database,
  });

  pool.on("connect", () => {
    console.log(`Conectado a PostgreSQL → DB: ${dbConfig.database}`);
  });

  return pool;
}

module.exports = { createPool };
