import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../NavBar";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.title = "Home | My FreeLance Site";
    // Check Auth Status for CTA buttons
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          {/* ================= HERO BANNER ================= */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 md:p-16 shadow-sm relative overflow-hidden text-center sm:text-left">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/20">
                Freelance Workflows Made Simple
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Manage your projects, clients, and revenue in one place.
              </h1>

              <p className="text-indigo-200 text-sm sm:text-base md:text-lg leading-relaxed">
                Track deliverables, monitor client relationships, and streamline
                your entire freelance business effortlessly.
              </p>

              <div className="pt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition"
                  >
                    Go to Your Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-semibold text-sm px-6 py-3 rounded-xl backdrop-blur-sm transition"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Ambient Decorative Light */}
            <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* ================= FEATURE HIGHLIGHTS ================= */}
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Everything you need to scale your work
              </h2>
              <p className="text-sm text-slate-500">
                Stop juggling multiple spreadsheets and messy tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  📁
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Project Tracking
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Organize tasks, set deadlines, track project statuses, and
                  deliver work on time, every time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  👥
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Client Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Keep all contact details, company profiles, communication, and
                  billing history neatly organized.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  📊
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Financial Overview
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Gain clear insights into your ongoing revenues, active billing
                  rates, and business health.
                </p>
              </div>
            </div>
          </div>

          {/* ================= CALL TO ACTION SECTION ================= */}
          {!isAuthenticated && (
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Ready to optimize your freelance workflow?
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                Join freelancers who organize their client operations, track
                projects, and grow their revenue effortlessly.
              </p>
              <div>
                <Link
                  to="/signup"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition"
                >
                  Create Your Free Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
