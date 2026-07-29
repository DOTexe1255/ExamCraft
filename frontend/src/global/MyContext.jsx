import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'examcraft-auth';

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const MyContext = createContext(null);

export const MyProvider = ({ children }) => {
  const [auth, setAuthState] = useState(readStoredAuth);

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(readStoredAuth());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setAuth = (nextAuth) => {
    setAuthState(nextAuth);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    }
  };

  const clearAuth = () => {
    setAuthState(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const value = useMemo(() => ({
    auth,
    setAuth,
    clearAuth,
  }), [auth]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
