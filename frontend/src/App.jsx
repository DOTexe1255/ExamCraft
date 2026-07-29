import './App.css'

import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./components/Index";
import StudentDashboard from "./components/student/StudentDashboard";
import DepartmentDashboard from "./components/department/DepartmentDashboard";
import AdministrationLogin from "./components/AdministrationLogin";
import AdministrationRegister from "./components/InstituteRegister";
import StudentLogin from "./components/StudentLogin";
import InstituteDashboard from "./components/institute/InstituteDashboard";
import ExamDashboard from './components/exam/ExamDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getStoredAuth } from './components/ProtectedRoute';

const getDashboardPath = (role) => {
  if (role === 'student') return '/student-dashboard';
  if (role === 'department') return '/department-dashboard';
  if (role === 'institute') return '/institute-dashboard';
  return '/';
};

const App = () => {
  const auth = getStoredAuth();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={auth?.isAuthenticated ? <Navigate to={getDashboardPath(auth.role)} replace /> : <AdministrationLogin />} />
        <Route path="/student-login" element={auth?.isAuthenticated ? <Navigate to="/student-dashboard" replace /> : <StudentLogin />} />
        <Route path="/register" element={<AdministrationRegister />} />
        <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/department-dashboard" element={<ProtectedRoute allowedRoles={['department']}><DepartmentDashboard /></ProtectedRoute>} />
        <Route path="/institute-dashboard" element={<ProtectedRoute allowedRoles={['institute']}><InstituteDashboard /></ProtectedRoute>} />
        <Route path="/exam/:examId" element={<ProtectedRoute allowedRoles={['student', 'institute', 'department']}><ExamDashboard /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
