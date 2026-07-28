const connectToMySQL = require('./db'); // Updated to MySQL connection
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const cors = require("cors");
const cookieParser = require('cookie-parser');


app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:${process.env.FRONTEND_PORT || 5173}', // Replace with your frontend URL
  credentials: true
}));
app.use(express.json());

// Connect to MySQL using the connectToMySQL function from db.js
connectToMySQL();

app.use('/api/auth', require('./routes/auth'));          // user auth (admin/department/student)
app.use('/api/institute', require('./routes/institute')); // institute registration
app.use('/api/department', require('./routes/department')); // department registration
app.use('/api/user', require('./routes/userdata'));      // getuserdata via JWT

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
