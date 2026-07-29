import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuth } from '../ProtectedRoute';
import { useMyContext } from '../../global/MyContext';

const Header = () => {
  const navigate = useNavigate();
  const authContext = useMyContext();
  const auth = authContext?.auth || null;
  const displayName = [auth?.firstName || auth?.user?.first_name, auth?.lastName || auth?.user?.last_name]
    .filter(Boolean)
    .join(' ') || 'Department Admin';
  const departmentLabel = auth?.departmentId || auth?.user?.department_id
    ? `Department #${auth.departmentId || auth?.user?.department_id}`
    : 'Department Admin Access';

  const handleLogout = () => {
    authContext?.clearAuth?.();
    clearStoredAuth();
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('departmentRole');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teacher-600 to-teacher-700 bg-clip-text text-transparent">
            Department Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back, {displayName}</p>
          <p className="text-sm text-teacher-600 font-medium mt-1">{departmentLabel}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold 
                    text-gray-700 hover:bg-gray-50 hover:border-teacher-300 
                    hover:shadow-dashboard flex items-center gap-2 transition-all duration-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </>
  );
};

export default Header;
