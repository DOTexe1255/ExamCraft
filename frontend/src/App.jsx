import './App.css'

import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Index from "./components/Index";           // Your landing page
import StudentDashboard from "./components/student/StudentDashboard";
import DepartmentDashboard from "./components/department/DepartmentDashboard";
import AdministrationLogin from "./components/AdministrationLogin";
import AdministrationRegister from "./components/InstituteRegister";
import StudentLogin from "./components/StudentLogin";
import InstituteDashboard from "./components/institute/InstituteDashboard";
import ExamDashboard from './components/exam/ExamDashboard';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<AdministrationLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/register" element={<AdministrationRegister />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/department-dashboard" element={<DepartmentDashboard />} />
        <Route path="/institute-dashboard" element={<InstituteDashboard />} />
        <Route path="/exam/:examId" element={<ExamDashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
