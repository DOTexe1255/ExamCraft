import React, { useState } from 'react';
import AddDepartmentModal from './AddDepartmentModal';

const InstituteQuickActions = () => {
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);

const handleAddDepartment = async ({ departmentData, departmentAdminData }) => {
  try {
    // 1. First create department
    const departmentResponse = await fetch('/api/department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departmentData)
    });

    if (!departmentResponse.ok) {
      throw new Error('Failed to create department');
    }

    const department = await departmentResponse.json();
    const departmentId = department.department_id || department.id;

    // 2. Then create department admin (if head details provided)
    if (departmentAdminData) {
      const adminData = {
        ...departmentAdminData,
        department_id: departmentId
      };

      const adminResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });

      if (!adminResponse.ok) {
        console.error('Admin creation failed, but department was created:', await adminResponse.json());
      }
    }

    console.log('Department created successfully:', department);
    // Show success notification, refresh data, etc.
    
  } catch (error) {
    console.error('Error creating department:', error);
    // Show error notification
  } finally {
    setIsAddDepartmentOpen(false);
  }
};


  return (
    <>
      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover border hover:border-institute-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button 
              onClick={() => setIsAddDepartmentOpen(true)}
              className="w-full px-4 py-3 bg-institute-600 text-white rounded-xl text-sm font-semibold 
                        hover:bg-institute-700 shadow-dashboard hover:shadow-dashboard-hover 
                        flex items-center gap-2 transition-all duration-300 justify-start"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Department
            </button>
            {/* Rest of your buttons remain the same */}
            {/* <button className="w-full px-4 py-3 bg-student-600 text-white rounded-xl text-sm font-semibold 
                            hover:bg-student-700 shadow-dashboard hover:shadow-dashboard-hover 
                            flex items-center gap-2 transition-all duration-300 justify-start">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Users in Bulk
            </button> */}
            <button className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium 
                            text-gray-700 hover:bg-gray-50 hover:border-institute-300 
                            hover:shadow-dashboard flex items-center gap-2 transition-all duration-200 justify-start">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Institute Reports
            </button>
            <button className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium 
                            text-gray-700 hover:bg-gray-50 hover:border-institute-300 
                            hover:shadow-dashboard flex items-center gap-2 transition-all duration-200 justify-start">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Audit Logs
            </button>
          </div>
        </div>

        {/* Institute Settings - unchanged */}
        <div className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover border hover:border-institute-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Institute Settings</h3>
            <p className="text-sm text-gray-600">Current configuration</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">Max Exam Duration</span>
              <span className="font-semibold text-institute-600">120 min</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">SEB Quit Password</span>
              <span className="font-semibold text-status-active">exam123</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Total Storage Used</span>
              <span className="font-semibold text-status-scheduled">2.4 GB / 50 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={isAddDepartmentOpen}
        onClose={() => setIsAddDepartmentOpen(false)}
        onSubmit={handleAddDepartment}
      />
    </>
  );
};

export default InstituteQuickActions;
