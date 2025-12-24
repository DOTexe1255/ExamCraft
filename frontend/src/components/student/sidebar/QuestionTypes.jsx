import React from 'react';

const QuestionTypes = () => {
  return (
    <>
      {/* Question Types Content */}
      <div className="space-y-4">
        {/* Multiple Choice */}
        <div className="flex items-center gap-4 p-4 bg-student-50/30 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-10 h-10 bg-status-scheduled/20 rounded-xl flex items-center justify-center 
                          group-hover:bg-status-scheduled/30 border border-status-scheduled/30">
            <svg className="h-5 w-5 text-status-scheduled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-student-700">Multiple Choice</p>
            <p className="text-xs text-gray-600 mt-0.5">Auto-graded MCQs (1 mark each)</p>
          </div>
        </div>

        {/* Code Questions */}
        <div className="flex items-center gap-4 p-4 bg-student-50/30 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-10 h-10 bg-status-active/20 rounded-xl flex items-center justify-center 
                          group-hover:bg-status-active/30 border border-status-active/30">
            <svg className="h-5 w-5 text-status-active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-student-700">Code Questions</p>
            <p className="text-xs text-gray-600 mt-0.5">Programming challenges (3-5 marks)</p>
          </div>
        </div>

        {/* Essays */}
        <div className="flex items-center gap-4 p-4 bg-student-50/30 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-10 h-10 bg-status-completed/20 rounded-xl flex items-center justify-center 
                          group-hover:bg-status-completed/30 border border-status-completed/30">
            <svg className="h-5 w-5 text-status-completed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-student-700">Essays</p>
            <p className="text-xs text-gray-600 mt-0.5">Detailed written responses (5-10 marks)</p>
          </div>
        </div>

        {/* True/False - Bonus */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 
                        rounded-xl hover:bg-gray-100 transition-all duration-200 group hover:shadow-sm">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center 
                          group-hover:bg-gray-200 border border-gray-200">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-gray-800">True/False</p>
            <p className="text-xs text-gray-600 mt-0.5">Quick binary questions (1 mark)</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionTypes;
