import React, { useState } from 'react';
import AddStudentModal from './AddStudentModal';
import CreateExamModal from './CreateExamModal';

const QuickActions = ({ instituteId, departmentId }) => {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);

  const handleAddStudent = async (studentData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
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

  const handleCreateExam = async (examData) => {
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(examData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create exam');
      }

      const exam = await response.json();
      setIsCreateExamOpen(false);
      console.log('✅ Exam created:', exam);
      
    } catch (error) {
      console.error('❌ Error creating exam:', error);
      alert(error.message || 'Failed to create exam');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover border hover:border-teacher-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            {/* Create Exam Button - NOW FUNCTIONAL */}
            <button 
              onClick={() => setIsCreateExamOpen(true)}
              className="w-full px-4 py-3 bg-teacher-600 text-white rounded-xl text-sm font-semibold 
                        hover:bg-teacher-700 shadow-dashboard hover:shadow-dashboard-hover 
                        flex items-center gap-2 transition-all duration-300 justify-start"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Exam
            </button>
            
            <button 
              onClick={() => setIsAddStudentOpen(true)}
              className="w-full px-4 py-3 bg-student-600 text-white rounded-xl text-sm font-semibold 
                        hover:bg-student-700 shadow-dashboard hover:shadow-dashboard-hover 
                        flex items-center gap-2 transition-all duration-300 justify-start"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Student
            </button>

            <button className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium 
                            text-gray-700 hover:bg-teacher-50 hover:border-teacher-300 
                            hover:shadow-dashboard flex items-center gap-2 transition-all duration-200 justify-start">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Student Analytics
            </button>
            <button className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium 
                            text-gray-700 hover:bg-teacher-50 hover:border-teacher-300 
                            hover:shadow-dashboard flex items-center gap-2 transition-all duration-200 justify-start">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Performance Reports
            </button>
          </div>
        </div>

        {/* Question Types section - unchanged */}
        {/* ... your existing Question Types code ... */}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleAddStudent}
        instituteId={instituteId}
        departmentId={departmentId}
      />

      <CreateExamModal
        isOpen={isCreateExamOpen}
        onClose={() => setIsCreateExamOpen(false)}
        onSubmit={handleCreateExam}
        instituteId={instituteId}
        departmentId={departmentId}
      />
    </>
  );
};

export default QuickActions;
