// components/Index.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="space-y-6 max-w-md w-full">
        <Link 
          to="/student-dashboard"
          className=" w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-1 transition-all duration-300 text-decoration-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          Student Dashboard
        </Link>

        <Link 
          to="/teacher-dashboard"
          className=" w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:from-cyan-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 text-decoration-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
          </svg>
          Teacher Dashboard
        </Link>

        <div className="pt-4 border-t border-white/30 mt-6">
          <p className="text-center text-sm text-gray-600 mb-3">Access your account</p>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/90 text-emerald-600 rounded-xl font-semibold hover:shadow-md transition">
              Sign In
            </Link>
            <Link to="/register" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:shadow-md transition">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Index;
