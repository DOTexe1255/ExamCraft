const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const connectToMySQL = async () => {
  try {
    const config = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number(process.env.MYSQL_PORT) || 3306,
    };

    // Enable SSL because Aiven uses ssl-mode=REQUIRED
    if (process.env.MYSQL_CA_CERT_PATH) {
      config.ssl = {
        ca: fs.readFileSync(process.env.MYSQL_CA_CERT_PATH)
      };
    } else {
      // Basic SSL without custom CA (often still works)
      config.ssl = { rejectUnauthorized: true };
    }

    const connection = await mysql.createConnection(config);
    console.log('Connected to MySQL successfully');
    return connection;
  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
};

module.exports = connectToMySQL;
