import React from 'react';

const StatesCards = () => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-teacher-200 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Exams</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-teacher-600 to-teacher-700 bg-clip-text text-transparent">
                8
              </p>
            </div>
            <svg className="h-12 w-12 text-teacher-600 group-hover:text-teacher-700 transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        {/* Published Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-status-active/20 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
              <p className="text-3xl font-bold text-status-active">5</p>
            </div>
            <svg className="h-12 w-12 text-status-active group-hover:text-status-active transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        {/* Draft Exams */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                        border hover:border-status-draft/20 p-6 transition-all duration-300 
                        group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
              <p className="text-3xl font-bold text-status-draft">3</p>
            </div>
            <svg className="h-12 w-12 text-status-draft group-hover:text-status-draft transition-all duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatesCards;
