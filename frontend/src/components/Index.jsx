import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const features = [
  [
    "Secure by design",
    "Role-based access and controlled exam delivery for every user.",
    "M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm9-9V7a3 3 0 00-6 0v3",
  ],
  [
    "One operational view",
    "Manage departments, assessments, faculty and students in one place.",
    "M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M9 21v-4h6v4M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01",
  ],
  [
    "Assessment insight",
    "Stay informed with live examination status and institute reporting.",
    "M4 19V5m4 14V9m4 10V5m4 14v-6m4 6V3",
  ],
];

const Index = () => {
  const handleDownload = () => {
    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = "application/ExamCraftV.1.0.1.exe"; // adjust if your public folder structure differs
    a.download = "ExamCraftV.1.0.1.exe";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_75%_15%,rgba(99,102,241,.35),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,.18),transparent_30%)]" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Download ExamCraft
            </button>
            <Link
              to="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
            >
              Admin login
            </Link>
          </div>
        </nav>

        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Modern examination operations
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              Assess with confidence.{" "}
              <span className="text-indigo-300">Achieve with clarity.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              A secure, focused platform for institutes to coordinate
              assessments and students to take them with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:bg-indigo-400"
              >
                Enter admin portal <span>→</span>
              </Link>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-5 py-3.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
              >
                Download ExamCraft <span>⬇</span>
              </button>
            </div>
            <div className="mt-9 flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">✓ Secure access</span>
              <span className="flex items-center gap-1.5">
                ✓ Built for institutes
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 -z-10 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      INSTITUTE OVERVIEW
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      Academic operations
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    All systems active
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["Students", "1,500"],
                    ["Departments", "12"],
                    ["Live exams", "08"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-950/60 p-3">
                      <p className="text-lg font-semibold">{value}</p>
                      <p className="mt-1 text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      Today&apos;s examination activity
                    </span>
                    <span className="text-emerald-300">On track</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-400">
                    <span>Scheduled</span>
                    <span>72% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600">
              DESIGNED FOR CLARITY
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Everything important, exactly where you need it.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(([title, description, icon]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d={icon}
                    />
                  </svg>
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <a
          href="https://github.com/DOTexe1255"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-slate-300 transition hover:text-white"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium">GitHub</span>
        </a>
        <span>Secure assessment infrastructure for modern institutions.</span>
      </footer>
    </main>
  );
};

export default Index;
