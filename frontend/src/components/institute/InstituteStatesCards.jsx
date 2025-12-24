import React from 'react';

const InstituteStatesCards = () => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Departments */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-institute-200 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Departments</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-institute-600 to-institute-700 bg-clip-text text-transparent">
                2
              </p>
            </div>
            <svg className="h-12 w-12 text-institute-600 group-hover:text-institute-700 transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-student-200 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">1500</p>
            </div>
            <svg className="h-12 w-12 text-student-600 group-hover:text-student-700 transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Active Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-status-active/20 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Exams</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <svg className="h-12 w-12 text-status-active group-hover:text-status-active transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-teacher-200 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Faculty</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
            <svg className="h-12 w-12 text-teacher-600 group-hover:text-teacher-700 transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstituteStatesCards;
