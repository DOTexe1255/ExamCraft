import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <div className="mx-auto w-24 h-24 mb-8 p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight">
              ExamCraft
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-3xl mx-auto mb-8 leading-relaxed">
              Secure Computer Based Testing platform for institutes and students
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-md mx-auto grid gap-6 lg:grid-cols-2 lg:gap-8">
            <Link 
              to="/login" 
              className="group relative w-full flex items-center justify-center gap-4 px-8 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden transform hover:scale-[1.02] border-2 border-emerald-200/50"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
              <div className="absolute -right-4 group-hover:right-0 bg-white/20 w-24 h-24 rounded-full blur-xl -z-10 transition-all duration-500"></div>
            </Link>

            <Link 
              to="/register" 
              className="group relative w-full flex items-center justify-center gap-4 px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden transform hover:scale-[1.02] border-2 border-indigo-200/50"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Register</span>
              <div className="absolute -left-4 group-hover:left-0 bg-white/20 w-24 h-24 rounded-full blur-xl -z-10 transition-all duration-500"></div>
            </Link>
          </div>

          {/* Features Highlight */}
          <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure CBT</h3>
              <p className="text-gray-600 leading-relaxed">Bank-grade security for Computer Based Testing with real-time proctoring</p>
            </div>

            <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">Instant exam deployment and result processing for 1000+ students</p>
            </div>

            <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Coming Soon</h3>
              <p className="text-gray-600 leading-relaxed">Advanced analytics, AI proctoring, and mobile exam apps</p>
            </div>
          </div>

          {/* Development Notice */}
          <div className="mt-20 pt-12 border-t border-white/30">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 px-6 py-4 rounded-2xl mb-6 shadow-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Beta Development</h3>
                  <p className="text-sm text-gray-600">ExamCraft is under active development.</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 font-medium max-w-xl mx-auto leading-relaxed">
                Ready for student login and institute registration. More features rolling out weekly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Index;
