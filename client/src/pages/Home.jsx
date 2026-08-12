import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../NavBar";
import api from "../api"; // Using your central axios API instance

function Home() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalClients: 0,
    loading: true,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.title = "Home | My FreeLance Site";
    // 1. Check Auth Status
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const loggedIn = !!token;
    setIsAuthenticated(loggedIn);

    // 2. Fetch Live Stats if authenticated or available
    if (loggedIn) {
      Promise.all([
        api.get("/projects/project").catch(() => ({ data: [] })),
        api.get("/client/clients").catch(() => ({ data: [] })),
      ])
        .then(([projectsRes, clientsRes]) => {
          const projects = projectsRes.data || [];
          const clients = clientsRes.data || [];

          const activeCount = projects.filter(
            (p) => p.status === "active" || !p.status,
          ).length;

          setStats({
            activeProjects: activeCount,
            totalClients: clients.length,
            loading: false,
          });
        })
        .catch((err) => {
          console.error("Error fetching overview stats:", err);
          setStats((prev) => ({ ...prev, loading: false }));
        });
    } else {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* ================= HERO BANNER ================= */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
              <span className="inline-block bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/20">
                {isAuthenticated
                  ? "Welcome Back"
                  : "Freelance Workflows Made Simple"}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Manage your projects, clients, and revenue in one place.
              </h1>

              <p className="text-indigo-200 text-xs sm:text-sm md:text-base leading-relaxed">
                Track deliverables, monitor client statuses, and streamline your
                entire freelance operations with ease.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/projects"
                      className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                    >
                      View Projects
                    </Link>
                    <Link
                      to="/clients"
                      className="bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl backdrop-blur-sm transition"
                    >
                      Manage Clients
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl backdrop-blur-sm transition"
                    >
                      Log In to Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Ambient Background Decorative Circle */}
            <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* ================= QUICK STATS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Active Projects Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Active Projects
                </p>
                {stats.loading ? (
                  <div className="h-7 w-24 bg-slate-100 rounded animate-pulse mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {isAuthenticated
                      ? `${stats.activeProjects} Active`
                      : "12 Active"}
                  </h3>
                )}
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                📁
              </div>
            </div>

            {/* Active Clients Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Clients
                </p>
                {stats.loading ? (
                  <div className="h-7 w-24 bg-slate-100 rounded animate-pulse mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {isAuthenticated
                      ? `${stats.totalClients} Clients`
                      : "8 Clients"}
                  </h3>
                )}
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                👥
              </div>
            </div>

            {/* Quick Overview Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Financial Overview
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  Dashboard
                </h3>
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                📊
              </div>
            </div>
          </div>

          {/* ================= FEATURE NAVIGATION CARDS ================= */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
              Quick Navigation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Dashboard Card */}
              <Link
                to="/dashboard"
                className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    ↗
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Analyze your performance metrics, income summaries, and
                    project breakdowns in real time.
                  </p>
                </div>
              </Link>

              {/* Projects Card */}
              <Link
                to="/projects"
                className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    ↗
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    Projects Page
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Track ongoing tasks, rates, status badges, and assign work
                    to existing clients.
                  </p>
                </div>
              </Link>

              {/* Clients Card */}
              <Link
                to="/clients"
                className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition space-y-3 flex flex-col justify-between sm:col-span-2 lg:col-span-1"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    ↗
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    Clients Page
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Store company details, contact information, emails, and
                    manage client profiles.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
