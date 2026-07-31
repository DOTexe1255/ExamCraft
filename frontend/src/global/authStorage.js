const AUTH_STORAGE_KEY = 'examcraft-auth';

export const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

export const setStoredAuth = (auth) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  if (typeof window !== 'undefined') window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
