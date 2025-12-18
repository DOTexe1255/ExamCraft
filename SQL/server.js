

const DB_HOST = process.env.DB_HOST; // 'sql100.infinityfree.com';
const DB_USER = process.env.DB_USER; // 'if0_34654321';
const DB_PASS = process.env.DB_PASS; // 'GweJd9ewHU5I';
const DB_NAME = process.env.DB_NAME; // 'if0_34654321_db_examcraft';
const DB_PORT = process.env.DB_PORT; // 3306;
const DB_CHARSET = process.env.DB_CHARSET; // 'utf8mb4';

const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  charset: DB_CHARSET
});
require('dotenv').config();

module.exports = pool;
require('dotenv').config();
require('dotenv').config();
