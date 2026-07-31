import React, { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from './authStorage';

export const MyProvider = ({ children }) => {
  const [auth, setAuthState] = useState(getStoredAuth);

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getStoredAuth());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setAuth = (nextAuth) => {
    setAuthState(nextAuth);

    if (typeof window !== 'undefined') {
      setStoredAuth(nextAuth);
    }
  };

  const clearAuth = () => {
    setAuthState(null);

    if (typeof window !== 'undefined') {
      clearStoredAuth();
    }
  };

  const value = useMemo(() => ({
    auth,
    setAuth,
    clearAuth,
  }), [auth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
