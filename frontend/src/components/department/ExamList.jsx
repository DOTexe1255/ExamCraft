import React, { useState } from 'react';
import CreateExamModal from './CreateExamModal';
import AddStudentModal from './AddStudentModal';

const ExamList = ({ instituteId, departmentId }) => {
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const handleCreateExam = async (examData) => {
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(examData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create exam');
      }

      const exam = await response.json();
      setIsCreateExamOpen(false);
      console.log('✅ Exam created:', exam);
      // TODO: Refresh exam list, show success toast
      
    } catch (error) {
      console.error('❌ Error creating exam:', error);
      alert(error.message || 'Failed to create exam');
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/api/auth/student-register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...studentData,
          role: 'student',
          institute_id: instituteId || user.institute_id,
          department_id: departmentId || user.department_id,
          password: studentData.password || Math.random().toString(36).slice(-8)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create student');
      }

      const student = await response.json();
      setIsAddStudentOpen(false);
      console.log('✅ Student created:', student);
      
    } catch (error) {
      console.error('❌ Error creating student:', error);
      alert(error.message || 'Failed to create student');
    }
  };

  return (
    <>
      {/* Exams List */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Exams</h2>
          <div className="flex items-center gap-3">
            {/* Create Exam Button */}
            <button 
              onClick={() => setIsCreateExamOpen(true)}
              className="px-4 py-2 bg-teacher-600 text-white rounded-xl text-sm font-semibold 
                        hover:bg-teacher-700 shadow-dashboard hover:shadow-dashboard-hover 
                        flex items-center gap-2 transition-all duration-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Exam
            </button>
            
            {/* NEW: Add Student Button */}
            <button 
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2 bg-student-600 text-white rounded-xl text-sm font-semibold 
                        hover:bg-student-700 shadow-dashboard hover:shadow-dashboard-hover 
                        flex items-center gap-2 transition-all duration-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Student
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Exam Card 1 - Published */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-teacher-200 p-6 transition-all duration-300 
                          group hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teacher-700">
                  JavaScript Fundamentals
                </h3>
                <p className="text-gray-600 mt-1">Test core JavaScript concepts and DOM manipulation</p>
                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>25 questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>60 minutes</span>
                  </div>
                  <span className="text-xs text-gray-400">Dec 10, 2025</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-status-active/10 text-status-active text-xs font-semibold rounded-full">
                Published
              </span>
            </div>
            <button className="w-full px-4 py-2 border-2 border-teacher-200 text-teacher-700 
                              rounded-xl text-sm font-medium hover:bg-teacher-50 
                              hover:border-teacher-400 hover:shadow-dashboard 
                              flex items-center justify-center gap-1 transition-all duration-200">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Results
            </button>
          </div>

          {/* Exam Card 2 - Draft */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-status-draft/20 p-6 transition-all duration-300 
                          group hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teacher-700">
                  Database Design
                </h3>
                <p className="text-gray-600 mt-1">SQL, normalization, transactions and indexing</p>
                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>18 questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>45 minutes</span>
                  </div>
                  <span className="text-xs text-gray-400">Dec 15, 2025</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-status-draft/10 text-status-draft text-xs font-semibold rounded-full">
                Draft
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-status-active text-white rounded-xl text-xs font-semibold 
                                hover:bg-status-active/90 shadow-dashboard flex items-center justify-center 
                                gap-1 transition-all duration-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Publish
              </button>
              <button className="px-3 py-2 border-2 border-teacher-200 text-teacher-700 
                                rounded-xl text-xs font-medium hover:bg-teacher-50 
                                hover:border-teacher-400 hover:shadow-dashboard 
                                flex items-center gap-1 transition-all duration-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Results
              </button>
            </div>
          </div>

          {/* Exam Card 3 - Published */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-teacher-200 p-6 transition-all duration-300 
                          group hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teacher-700">
                  React Components
                </h3>
                <p className="text-gray-600 mt-1">Hooks, state management and component lifecycle</p>
                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>22 questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-teacher-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>75 minutes</span>
                  </div>
                  <span className="text-xs text-gray-400">Dec 12, 2025</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-status-active/10 text-status-active text-xs font-semibold rounded-full">
                Published
              </span>
            </div>
            <button className="w-full px-4 py-2 border-2 border-teacher-200 text-teacher-700 
                              rounded-xl text-sm font-medium hover:bg-teacher-50 
                              hover:border-teacher-400 hover:shadow-dashboard 
                              flex items-center justify-center gap-1 transition-all duration-200">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Results
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateExamModal
        isOpen={isCreateExamOpen}
        onClose={() => setIsCreateExamOpen(false)}
        onSubmit={handleCreateExam}
        instituteId={instituteId}
        departmentId={departmentId}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleAddStudent}
        instituteId={instituteId}
        departmentId={departmentId}
      />
    </>
  );
};

export default ExamList;
