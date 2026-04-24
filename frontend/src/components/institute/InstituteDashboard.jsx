import React from 'react';
import Header from './InstituteHeader';
import StatesCards from './InstituteStatesCards';
import DepartmentList from './DepartmentList';
import QuickActions from './InstituteQuickActions';

const InstituteDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { institute_id } = user;

  return (
    <div className="min-h-screen bg-institute-bg p-6">
      {/* Header */}
      <Header />

      {/* Stats Cards */}
      <StatesCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departments & Exams List */}
        <DepartmentList instituteId={institute_id} />

        {/* Quick Actions */}
        <QuickActions instituteId={institute_id} />
      </div>
    </div>
  );
};

export default InstituteDashboard;
