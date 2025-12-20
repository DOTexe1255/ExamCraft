import React from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import AvailableExams from './AvailableExams';
import Sidebar from './sidebar/Sidebar';

const StudentDashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 p-6">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsCards/>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Exams */}
          <AvailableExams />

          {/* Sidebar */}
          <Sidebar />

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
