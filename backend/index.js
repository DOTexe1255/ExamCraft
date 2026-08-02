require('dotenv').config();

const connectToMySQL = require('./db');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT || 5173}`,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectToMySQL();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/institute', require('./routes/institute'));
app.use('/api/institute/dashboard', require('./routes/instituteDashboard'));
app.use('/api/departments', require('./routes/department'));
app.use('/api/department', require('./routes/department'));
app.use('/api/department/dashboard', require('./routes/departmentDashboard'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/question-banks', require('./routes/questionBanks'));
app.use('/api/user', require('./routes/userdata'));
app.use('/api/student/dashboard', require('./routes/studentDashboard'));

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
