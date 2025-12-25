import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotWarning, setShowForgotWarning] = useState(false);
  const navigate = useNavigate?.() || (() => {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!form.email) return "Student email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Enter a valid student email";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
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
      // TODO: call real API for student CBT login
      await new Promise((r) => setTimeout(r, 700));
      console.log("student CBT login payload", form);
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotWarning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white/60 to-cyan-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left: Illustration / Hero */}
        <div className="hidden md:flex flex-col items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-white/70 to-white/50 shadow-xl backdrop-blur-md border border-white/40">
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
            <path d="M3 7v10a2 2 0 002 2h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 7v10a2 2 0 01-2 2h-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 7a9 9 0 0118 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-3xl font-extrabold text-gray-900">Student CBT Portal</h3>
          <p className="text-gray-600">Secure access to conduct your Computer Based Test (CBT) exams.</p>
          <ul className="mt-2 text-sm text-gray-700 space-y-2">
            <li>• Secure CBT exam access</li>
            <li>• Real-time exam dashboard</li>
            <li>• Student-only interface</li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 11v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student CBT Login</h2>
              <p className="text-sm text-gray-600">Access your CBT exams securely</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700">Student Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@yourinstitute.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
              autoComplete="email"
            />

            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                Remember me
              </label>
              <button
                onClick={handleForgotPassword}
                className="text-amber-700 font-medium hover:text-amber-900 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200 rounded"
              >
                Forgot Password?
              </button>
            </div>

            {/* Forgot Password Warning - Shows only after click */}
            {showForgotWarning && (
              <div className="text-sm text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p className="font-medium">Password Reset Not Available</p>
                    <p className="text-xs mt-1">Please contact your institute administration for password assistance.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotWarning(false)}
                  className="mt-2 text-xs text-amber-700 underline hover:text-amber-900 ml-auto"
                >
                  Dismiss
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                </svg>
              ) : null}
              <span>{loading ? 'Accessing CBT...' : 'Login for CBT Exam'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
