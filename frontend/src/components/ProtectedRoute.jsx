import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredAuth } from '../global/authStorage';

const getDashboardPath = (role) => {
  if (role === 'student') return '/student-dashboard';
  if (role === 'department') return '/department-dashboard';
  if (role === 'institute') return '/institute-dashboard';
  return '/';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth?.isAuthenticated) {
    if (location.pathname === '/login') {
      return children;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    const dashboardPath = getDashboardPath(auth.role);

    if (location.pathname === dashboardPath) {
      return children;
    }

    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
