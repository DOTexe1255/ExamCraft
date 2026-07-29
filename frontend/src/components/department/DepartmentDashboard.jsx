import React from 'react';
import Header from './Header';
import StatesCards from './StatesCards';
import ExamList from './ExamList';
import QuickActions from './QuickActions';
import { getStoredAuth } from '../ProtectedRoute';

const DpartmentDashboard = () => {
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id ?? 1;
  const departmentId = auth?.departmentId ?? auth?.user?.department_id ?? 1;

  return (
    <div className="min-h-screen bg-teacher-bg p-6">
      {/* Header */}
      <Header />

      {/* Stats Cards */}
      <StatesCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exams List */}
        <ExamList instituteId={instituteId} departmentId={departmentId} />

        {/* Quick Actions */}
        <QuickActions instituteId={instituteId} departmentId={departmentId} />
      </div>
    </div>
  );
};

export default DpartmentDashboard;
