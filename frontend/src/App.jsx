import './App.css'

import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Index from "./components/Index";           // Your landing page
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
// import Login from "./components/Login";
// import Register from "./components/Register";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
