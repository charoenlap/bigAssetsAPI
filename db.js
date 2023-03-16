const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // use SSL encryption
    trustServerCertificate: true // accept the server's SSL certificate
  }
};
async function connect() {
  try {
    await sql.connect(config);
    console.log('Database connection successful');
  } catch (err) {
    console.log('Database connection failed', err);
  }
}

module.exports = { connect, sql,config };