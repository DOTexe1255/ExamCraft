import React from 'react';

const AvailableExams = () => {
  return (
    <>
      {/* Available Exams */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Exams</h2>
        
        <div className="space-y-4">
          {/* Exam Card 1 - Available */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-student-200 p-6 transition-all duration-300 
                          group hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Data Structures & Algorithms</h3>
                  <span className="px-3 py-1 bg-status-scheduled/10 text-status-scheduled text-xs font-semibold rounded-full">
                    Available
                  </span>
                </div>
                <p className="text-gray-600 mb-3">Test your knowledge on arrays, linked lists, trees, and sorting algorithms</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>25 questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>60 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full px-6 py-3 bg-student-600 text-white rounded-xl text-sm font-semibold 
                              hover:bg-student-700 shadow-dashboard hover:shadow-dashboard-hover 
                              flex items-center justify-center gap-2 transition-all duration-300 
                              group-hover:scale-[1.05]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Start Exam
            </button>
          </div>

          {/* Exam Card 2 - In Progress */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-status-active/20 p-6 transition-all duration-300 
                          group hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
                  <span className="px-3 py-1 bg-status-active/10 text-status-active text-xs font-semibold rounded-full">
                    In Progress
                  </span>
                </div>
                <p className="text-gray-600 mb-3">SQL queries, normalization, transactions, and database design</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>20 questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>45 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full px-6 py-3 border-2 border-student-200 text-student-700 
                              rounded-xl text-sm font-semibold hover:bg-student-50 
                              hover:border-student-400 hover:shadow-dashboard 
                              flex items-center justify-center gap-2 transition-all duration-300">
              Resume Exam
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailableExams;
