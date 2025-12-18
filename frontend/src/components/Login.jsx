import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
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
      // TODO: call real API
      await new Promise((r) => setTimeout(r, 700));
      console.log("login payload", form);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
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
          <h3 className="text-3xl font-extrabold text-gray-900">Welcome to ExamCraft</h3>
          <p className="text-gray-600">Securely manage exams, view results, and collaborate with teachers and students.</p>
          <ul className="mt-2 text-sm text-gray-700 space-y-2">
            <li>• Fast, responsive UI</li>
            <li>• Role-based dashboards</li>
            <li>• Prototype-ready</li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 11v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
              <p className="text-sm text-gray-600">Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            />

            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                Remember me
              </label>
              <Link to="/forgot" className="text-emerald-600 font-medium hover:underline">Forgot?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow hover:shadow-lg transition"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/></svg>
              ) : null}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
