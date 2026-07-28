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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    if (auth.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    }
    if (auth.role === 'institute') {
      return <Navigate to="/institute-dashboard" replace />;
    }
    if (auth.role === 'department') {
      return <Navigate to="/department-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
