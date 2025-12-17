import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LockIcon = ({ className = "h-10 w-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate?.() || (() => {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: call real API
      await new Promise((r) => setTimeout(r, 700));
      console.log("login payload", form);
      // navigate to dashboard (example)
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl border-4 border-white/30 backdrop-blur-sm">
              <LockIcon className="h-12 w-12 text-white drop-shadow-2xl" />
            </div>
          </div>

          <h1 className="text-4xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
            ExamCraft
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-3 font-medium max-w-xs mx-auto leading-relaxed">
            Sign in to continue
          </p>
        </div>

        <div className="animate-slideUp bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="bg-gradient-to-b from-white/80 via-white to-white/60 backdrop-blur-2xl p-8 space-y-8 border-b border-white/50">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 block tracking-wide">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  data-testid="login-email-input"
                  className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 block tracking-wide">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  data-testid="login-password-input"
                  className="w-full h-14 px-5 py-4 text-lg border-2 border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="group/btn w-full h-14 px-8 py-4 text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-white flex items-center justify-center gap-3 overflow-hidden relative btn-animate"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </button>
            </form>

            <div className="pt-8 pb-6 text-center border-t-2 border-gray-100/50">
              <p className="text-base text-gray-600 leading-relaxed">
                New to ExamCraft?{' '}
                <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 px-1 py-0.5 rounded-lg text-lg inline-block hover:-translate-y-0.5 hover:shadow-md" data-testid="register-link">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
