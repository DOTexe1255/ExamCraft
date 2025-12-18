import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate?.() || (() => {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setError("");
  };

  const handleRoleChange = (value) => {
    setFormData((s) => ({ ...s, role: value }));
    setError("");
  };

  const validate = () => {
    if (!formData.name) return "Full name is required";
    if (!formData.email) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) return "Enter a valid email";
    if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.role) return "Please select a role";
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
      // TODO: call real API to register
      await new Promise((r) => setTimeout(r, 800));
      console.log("Register payload:", formData);
      // on success, navigate to login or dashboard
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try again.");
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
          <h3 className="text-3xl font-extrabold text-gray-900">Create your ExamCraft account</h3>
          <p className="text-gray-600">Sign up as a student or teacher to access role-based dashboards and manage exams.</p>
          <ul className="mt-2 text-sm text-gray-700 space-y-2">
            <li>• Secure prototype</li>
            <li>• Quick onboarding</li>
            <li>• Responsive UI</li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 6.5C3 5.12 4.12 4 5.5 4h0C7 4 9 4.75 11 6c2-1.25 4-2 5.5-2h0C19.88 4 21 5.12 21 6.5v11c0 1.38-1.12 2.5-2.5 2.5H16c-2.5 0-4.5-1.25-6-2.5-1.5 1.25-3.5 2.5-6 2.5H5.5C4.12 19 3 17.88 3 16.5v-10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
              <p className="text-sm text-gray-600">Fill in details to join ExamCraft</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            />

            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            />

            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            />

            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/90"
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow hover:shadow-lg transition"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/></svg>
              ) : null}
              <span>{loading ? 'Creating...' : 'Create Account'}</span>
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;