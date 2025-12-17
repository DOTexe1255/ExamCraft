import React, { useState } from "react";
import { Link } from "react-router-dom";

const BookOpen = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6.5C3 5.12 4.12 4 5.5 4h0C7 4 9 4.75 11 6c2-1.25 4-2 5.5-2h0C19.88 4 21 5.12 21 6.5v11c0 1.38-1.12 2.5-2.5 2.5H16c-2.5 0-4.5-1.25-6-2.5-1.5 1.25-3.5 2.5-6 2.5H5.5C4.12 19 3 17.88 3 16.5v-10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((s) => ({ ...s, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise((res) => setTimeout(res, 800));
      console.log("Register payload:", formData);
      // Optionally navigate or show a success message here
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl border-4 border-white/30 backdrop-blur-sm">
              <BookOpen className="h-12 w-12 text-white drop-shadow-2xl" />
            </div>
          </div>
        <h1 className="text-4xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
          ExamCraft
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-3 font-medium max-w-xs mx-auto leading-relaxed">
          Join the Digital Examination Platform
        </p>
      </div>

      {/* Register Form - Glassmorphism Card */}
      <div className="animate-slideUp bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="bg-gradient-to-b from-white/80 via-white to-white/60 backdrop-blur-2xl p-8 space-y-8 border-b border-white/50">
          
          {/* Card Header */}
          <div className="space-y-3 text-center">
            <h2 className="text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              Sign up to get started with ExamCraft
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div className="space-y-3">
              <label 
                htmlFor="name" 
                className="text-sm font-semibold text-gray-700 block tracking-wide"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                data-testid="register-name-input"
                required
                className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label 
                htmlFor="email" 
                className="text-sm font-semibold text-gray-700 block tracking-wide"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                data-testid="register-email-input"
                required
                className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label 
                htmlFor="password" 
                className="text-sm font-semibold text-gray-700 block tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                data-testid="register-password-input"
                required
                minLength="6"
                className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400"
              />
            </div>

            {/* Role Select */}
            <div className="space-y-3">
              <label 
                htmlFor="role" 
                className="text-sm font-semibold text-gray-700 block tracking-wide"
              >
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  data-testid="register-role-select"
                  required
                  className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm appearance-none cursor-pointer pr-12"
                >
                  <option value="" disabled className="text-gray-400">
                    Select your role
                  </option>
                  <option value="student" data-testid="role-student-option" className="text-gray-900">
                    👨‍🎓 Student
                  </option>
                  <option value="teacher" data-testid="role-teacher-option" className="text-gray-900">
                    👨‍🏫 Teacher
                  </option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              data-testid="register-submit-button"
              className="group/btn w-full h-14 px-8 py-4 text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-white flex items-center justify-center gap-3 overflow-hidden relative btn-animate"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-8 pb-6 text-center border-t-2 border-gray-100/50">
            <p className="text-base text-gray-600 leading-relaxed">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-emerald-600 hover:text-emerald-700 px-1 py-0.5 rounded-lg text-lg inline-block hover:-translate-y-0.5 hover:shadow-md"
                data-testid="login-link"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default RegisterPage;