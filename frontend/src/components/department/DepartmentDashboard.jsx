import React from 'react';
import Header from './Header';
import StatesCards from './StatesCards';
import ExamList from './ExamList';
import QuickActions from './QuickActions';

const DpartmentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { institute_id, department_id } = user;

  return (
    <div className="min-h-screen bg-teacher-bg p-6">
      {/* Header */}
      <Header />

      {/* Stats Cards */}
      <StatesCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exams List */}
        <ExamList instituteId={institute_id} departmentId={department_id} />

        {/* Quick Actions */}
        <QuickActions instituteId={institute_id} departmentId={department_id} />
      </div>
    </div>
  );
};

export default DpartmentDashboard;
