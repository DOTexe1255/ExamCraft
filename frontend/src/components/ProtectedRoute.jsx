import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AUTH_STORAGE_KEY = 'examcraft-auth';

export const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

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
