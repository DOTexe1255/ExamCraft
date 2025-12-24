import React from 'react';

const StatsCards = () => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Available Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-student-200 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available Exams</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-student-600 to-student-700 bg-clip-text text-transparent">
                3
              </p>
            </div>
            <svg className="h-12 w-12 text-student-600 group-hover:text-student-700 transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        {/* Completed Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-status-completed/20 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
            <svg className="h-12 w-12 text-status-completed group-hover:text-status-completed transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-status-active/20 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-status-active">85%</p>
            </div>
            <svg className="h-12 w-12 text-status-active group-hover:text-status-active transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsCards;
