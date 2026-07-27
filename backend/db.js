const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const connectToMySQL = async (retries = 3, delay = 3000) => {
  try {
    // Fallbacks for local dev
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || 'password';
    const database = process.env.MYSQL_DATABASE || 'examcraft';
    const port = Number(process.env.MYSQL_PORT) || 3306;

    const config = { host, user, password, database, port };

    // Decide SSL based on env
    if (process.env.MYSQL_CA_CERT_PATH) {
      // Aiven / cloud with CA
      config.ssl = { ca: fs.readFileSync(process.env.MYSQL_CA_CERT_PATH) };
    } else if (process.env.MYSQL_SSL === 'true') {
      // Cloud without custom CA (still SSL)
      config.ssl = { rejectUnauthorized: true };
    } else {
      // Local MySQL: NO SSL
      config.ssl = undefined;
    }

    console.log('MySQL config in use:', {
      host,
      user,
      database,
      port,
      ssl: config.ssl ? 'enabled' : 'disabled'
    });

    const connection = await mysql.createConnection(config);
    console.log('Connected to MySQL successfully');
    return connection;
  } catch (error) {
    if (retries > 0) {
      console.log(`Failed to connect to MySQL. Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectToMySQL(retries - 1, delay);
    }
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
};

module.exports = connectToMySQL;
