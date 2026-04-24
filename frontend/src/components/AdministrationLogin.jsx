import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdministrationLogin = () => {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    role: "institute" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate?.() || (() => {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!form.email) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Enter a valid email";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.role) return "Please select your role";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: form.email, password: form.password, role: form.role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid credentials. Please try again.');
        return;
      }

      // Store user info for use in dashboard components
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      const redirectPath = form.role === "institute" ? "/institute-dashboard" : "/department-dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError("Contact your institute administration for password assistance.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/70 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/70 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-sky-200/70 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Hero */}
          <div className="hidden lg:flex flex-col gap-8 p-10 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V8a4 4 0 118 0v3" />
              </svg>
            </div>
            
            <div className="text-center lg:text-left">
              <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-4">
                Admin Portal
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Secure access for institute and department administrators
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Institute Management</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Department Control</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Real-time Analytics</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 lg:p-12 max-w-md w-full mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-emerald-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Admin Login
              </h2>
              <p className="text-lg text-gray-600 font-medium">Select your role to access dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Role Selection - CLEAN & CLEAR */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4">Admin Role <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {/* Institute Admin */}
                  <label className={`
                    relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg flex items-center gap-4
                    ${form.role === "institute" 
                      ? "bg-emerald-500 border-emerald-400 shadow-2xl ring-4 ring-emerald-100/50 scale-[1.02]" 
                      : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }
                  `}>
                    <input
                      type="radio"
                      name="role"
                      value="institute"
                      checked={form.role === "institute"}
                      onChange={handleChange}
                      className="absolute opacity-0 h-0 w-0"
                    />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      form.role === "institute" ? "bg-white shadow-md" : "bg-emerald-500"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3" />
                      </svg>
                    </div>
                    <div>
                      <div className={`font-bold text-xl transition-colors ${
                        form.role === "institute" ? "text-white" : "text-gray-900"
                      }`}>
                        Institute Admin
                      </div>
                      <div className={`text-sm font-medium transition-colors ${
                        form.role === "institute" ? "text-white/90" : "text-gray-600"
                      }`}>
                        Full system access
                      </div>
                    </div>
                  </label>

                  {/* Department Admin */}
                  <label className={`
                    relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg flex items-center gap-4
                    ${form.role === "department" 
                      ? "bg-indigo-500 border-indigo-400 shadow-2xl ring-4 ring-indigo-100/50 scale-[1.02]" 
                      : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }
                  `}>
                    <input
                      type="radio"
                      name="role"
                      value="department"
                      checked={form.role === "department"}
                      onChange={handleChange}
                      className="absolute opacity-0 h-0 w-0"
                    />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      form.role === "department" ? "bg-white shadow-md" : "bg-indigo-500"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
                      </svg>
                    </div>
                    <div>
                      <div className={`font-bold text-xl transition-colors ${
                        form.role === "department" ? "text-white" : "text-gray-900"
                      }`}>
                        Department Admin
                      </div>
                      <div className={`text-sm font-medium transition-colors ${
                        form.role === "department" ? "text-white/90" : "text-gray-600"
                      }`}>
                        Department-level access
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@yourinstitute.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white transition-all duration-200 hover:border-gray-300"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white transition-all duration-200 hover:border-gray-300"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 focus:ring-emerald-400" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In as Admin
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 pt-4 text-sm text-gray-600 border-t border-gray-200">
              <Link to="/" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AdministrationLogin;
