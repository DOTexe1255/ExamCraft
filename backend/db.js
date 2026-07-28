const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

let pool;

const createPool = () => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || 'password';
  const database = process.env.MYSQL_DATABASE || 'examcraft';
  const port = Number(process.env.MYSQL_PORT) || 3306;

  const config = {
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

  if (process.env.MYSQL_CA_CERT_PATH) {
    config.ssl = {
      ca: fs.readFileSync(process.env.MYSQL_CA_CERT_PATH),
    };
  } else if (process.env.MYSQL_SSL === 'true') {
    config.ssl = { rejectUnauthorized: true };
  }

  console.log('MySQL pool config in use:', {
    host,
    user,
    database,
    port,
    ssl: config.ssl ? 'enabled' : 'disabled',
  });

  return mysql.createPool(config);
};

const connectToMySQL = async () => {
  try {
    if (!pool) {
      pool = createPool();
    }

    const connection = await pool.getConnection();
    console.log('Connected to MySQL successfully');
    return connection;
  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
};

module.exports = connectToMySQL;