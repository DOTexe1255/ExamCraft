const mysql = require('mysql2/promise');
require('dotenv').config();

// Connect to MySQL
const connectToMySQL = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'examcraft',
            port: process.env.MYSQL_PORT || 3306
        });
        console.log("Connected to MySQL successfully");
        return connection; // Return connection for use in other modules
    } catch (error) {
        console.error("Failed to connect to MySQL:", error);
        throw error;
    }
};

module.exports = connectToMySQL;
