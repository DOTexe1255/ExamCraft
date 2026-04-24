import React, { useState } from 'react';
import AddDepartmentModal from './AddDepartmentModal';

const DepartmentList = ({ instituteId }) => {
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);

  const handleAddDepartment = async ({ departmentData, departmentAdminData }) => {
    try {
      // 1. Create department first
      const departmentResponse = await fetch('/api/department', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add your auth token here if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(departmentData)
      });

      if (!departmentResponse.ok) {
        const errorData = await departmentResponse.json();
        throw new Error(errorData.message || 'Failed to create department');
      }

      const department = await departmentResponse.json();
      const departmentId = department.department_id || department.id;

      // 2. Create department admin if head details provided
      if (departmentAdminData) {
        const adminData = {
          ...departmentAdminData,
          department_id: departmentId
        };

        const adminResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(adminData)
        });

        if (!adminResponse.ok) {
          console.warn('Department admin creation failed (department created):', await adminResponse.json());
          // Department was created successfully, admin can be added later
        }
      }

      // Success
      setIsAddDepartmentOpen(false);
      console.log('✅ Department created:', department);
      
      // TODO: Refresh departments list, show success toast
      window.location.reload(); // Quick refresh for demo
      
    } catch (error) {
      console.error('❌ Error creating department:', error);
      alert(error.message || 'Failed to create department');
    }
  };

  return (
    <>
      {/* Departments & Exams List */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Departments Overview</h2>
          <button 
            onClick={() => setIsAddDepartmentOpen(true)}
            className="px-4 py-2 bg-institute-600 text-white rounded-xl text-sm font-semibold 
                      hover:bg-institute-700 shadow-dashboard hover:shadow-dashboard-hover 
                      flex items-center gap-2 transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Department
          </button>
        </div>

        <div className="space-y-4">
          {/* Computer Science Department */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-institute-200 p-6 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Computer Science (CS)</h3>
                <p className="text-gray-600 mt-1">CS Head: CS Head</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>12 Faculty</span>
                  <span className="text-student-600 font-medium">450 Students</span>
                  <span className="text-status-active font-medium">8 Active Exams</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-status-active/10 text-status-active text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border-2 border-gray-200 rounded-lg text-xs font-medium 
                                text-gray-700 hover:bg-gray-50 hover:border-institute-300 
                                flex items-center gap-1 transition-all duration-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
              <button className="px-3 py-1 bg-status-completed text-white rounded-lg text-xs font-medium 
                                hover:bg-status-completed/90 shadow-dashboard 
                                flex items-center gap-1 transition-all duration-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exam Analytics
              </button>
            </div>
          </div>

          {/* Electronics Department */}
          <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-institute-200 p-6 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Electronics (ECE)</h3>
                <p className="text-gray-600 mt-1">ECE Head: ECE Head</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>8 Faculty</span>
                  <span className="text-student-600 font-medium">320 Students</span>
                  <span className="text-status-active font-medium">3 Active Exams</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-status-active/10 text-status-active text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border-2 border-gray-200 rounded-lg text-xs font-medium 
                                text-gray-700 hover:bg-gray-50 hover:border-institute-300 
                                flex items-center gap-1 transition-all duration-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Using your existing AddDepartmentModal */}
      <AddDepartmentModal
        isOpen={isAddDepartmentOpen}
        onClose={() => setIsAddDepartmentOpen(false)}
        onSubmit={handleAddDepartment}
        instituteId={instituteId}
      />
    </>
  );
};

export default DepartmentList;
