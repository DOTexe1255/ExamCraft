import './App.css'

import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Index from "./components/Index";           // Your landing page
import StudentDashboard from "./components/student/StudentDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import InstituteDashboard from "./components/institute/InstituteDashboard";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/institute-dashboard" element={<InstituteDashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
