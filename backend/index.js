const connectToMySQL = require('./db'); // Updated to MySQL connection
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const cors = require("cors");

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Connect to MySQL using the connectToMySQL function from db.js
connectToMySQL();

// Route for authentication only (kept as requested)
app.use('/api/auth', require('./routes/auth'));

// Route for user data
app.use('/api/user', require('./routes/userdata'));

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
