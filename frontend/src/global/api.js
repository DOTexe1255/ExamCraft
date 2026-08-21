const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const normalizeBaseUrl = (value) => {
  if (!value) {
    return DEFAULT_API_BASE_URL;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const buildApiUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

import { clearStoredAuth } from './authStorage';

export const requestJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string'
      ? data
      : data?.message || data?.error || 'Request failed';

    if (response.status === 401 || response.status === 403) {
      clearStoredAuth();

      if (typeof window !== 'undefined') {
        const currentPath = window.location.hash || '';
        if (currentPath.includes('student-dashboard') || currentPath.includes('department-dashboard') || currentPath.includes('institute-dashboard')) {
          window.location.hash = '#/login';
        }
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};