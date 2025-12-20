import React from 'react';
import Header from './Header';
import StatesCards from './StatesCards';
import ExamList from './ExamList';
import QuickActions from './QuickActions';

const TeacherDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 p-6">
      {/* Header */}
      <Header />

      {/* Stats Cards */}
      <StatesCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exams List */}
        <ExamList />

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
};

export default TeacherDashboard;
