import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuth } from '../ProtectedRoute';

const InstituteHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAuth();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('instituteId');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-institute-600 to-institute-700 bg-clip-text text-transparent">
            Institute Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back, Super Admin</p>
          <p className="text-sm text-institute-600 font-medium">Tech Institute Pune (TI001)</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-institute-600 text-white rounded-xl text-sm font-semibold 
                            hover:bg-institute-700 shadow-dashboard hover:shadow-dashboard-hover 
                            flex items-center gap-2 transition-all duration-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium 
                      text-gray-700 hover:bg-gray-50 hover:border-institute-300 
                      hover:shadow-dashboard flex items-center gap-2 transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default InstituteHeader;
