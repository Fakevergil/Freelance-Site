import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../NavBar";
import api from "../api";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Invoice Drawer State
  const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    projectId: "",
    total: "",
    status: "sent",
  });

  // Lock body scroll when drawer is active
  useEffect(() => {
    document.title = "Dashboard | My FreeLance Site";
    if (isInvoiceDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isInvoiceDrawerOpen]);

  // --- FETCH INITIAL DASHBOARD DATA ---
  useEffect(() => {
    // Invoices
    api
      .get("/invoices/invoice")
      .then((res) => setInvoices(res.data || []))
      .catch((err) => console.error("Error fetching invoices:", err));

    // Projects
    api
      .get("/projects/project")
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.error("Error fetching projects:", err));

    // Clients
    api
      .get("/client/clients")
      .then((res) => setClientsCount((res.data || []).length))
      .catch((err) => console.error("Error fetching clients:", err));
  }, []);

  // --- DERIVED METRICS (Single-pass computation) ---
  const { paidRevenue, unpaidRevenue, overdueAmount, overdueCount } =
    useMemo(() => {
      return invoices.reduce(
        (acc, inv) => {
          const total = Number(inv.total) || 0;
          if (inv.status === "paid") {
            acc.paidRevenue += total;
          } else {
            acc.unpaidRevenue += total;
          }

          if (inv.status === "overdue") {
            acc.overdueAmount += total;
            acc.overdueCount += 1;
          }
          return acc;
        },
        { paidRevenue: 0, unpaidRevenue: 0, overdueAmount: 0, overdueCount: 0 },
      );
    }, [invoices]);

  const totalRevenue = paidRevenue + unpaidRevenue;

  // Active Projects Count
  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status === "active");
  }, [projects]);

  // Chart Data: Sparkline for Total Revenue
  const sparklineData = useMemo(() => {
    if (!invoices.length) return [{ value: 0 }, { value: 10 }];
    return invoices.map((inv, idx) => ({
      name: `Inv ${idx + 1}`,
      value: inv.total || 0,
    }));
  }, [invoices]);

  // Chart Data: Project Status Breakdown
  const projectStatusChartData = useMemo(() => {
    const counts = projects.reduce(
      (acc, proj) => {
        const st = proj.status ? proj.status.toLowerCase() : "active";
        if (acc[st] !== undefined) acc[st] += 1;
        return acc;
      },
      { active: 0, completed: 0, rejected: 0 },
    );

    return [
      {
        group: "All Projects",
        active: counts.active,
        completed: counts.completed,
        rejected: counts.rejected,
      },
    ];
  }, [projects]);

  // Search Filter for Invoices
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter((inv) => {
      const proj = projects.find((p) => p._id === inv.project);
      const projTitle = proj?.title?.toLowerCase() || "";
      const invNum = inv.invoiceNumber?.toLowerCase() || "";
      return invNum.includes(q) || projTitle.includes(q);
    });
  }, [invoices, projects, searchQuery]);

  // Quick Invoice Submission Handlers
  const handleQuickInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!newInvoice.invoiceNumber || !newInvoice.total) return;

    const payload = {
      invoiceNumber: newInvoice.invoiceNumber,
      project: newInvoice.projectId || null,
      total: Number(newInvoice.total),
      status: newInvoice.status,
    };

    api
      .post("/invoices/invoice", payload)
      .then((res) => {
        setInvoices((prev) => [res.data, ...prev]);
        setIsInvoiceDrawerOpen(false);
        setNewInvoice({
          invoiceNumber: "",
          projectId: "",
          total: "",
          status: "sent",
        });
      })
      .catch((err) => console.error("Error creating quick invoice:", err));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* ================= PAGE HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time financial performance and active project status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice or project..."
                  className="w-full pl-9 pr-4 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <button
                onClick={() => setIsInvoiceDrawerOpen(true)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm px-4 py-2.5 sm:py-2 rounded-xl shadow-sm transition text-center flex items-center justify-center gap-2"
              >
                <span>+</span> Quick Invoice
              </button>
            </div>
          </div>

          {/* ================= METRIC CARDS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Revenue Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Total Revenue ($)
                </p>
                <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    $
                    {totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  +12.5% this month
                </p>
              </div>
              <div className="h-12 w-full mt-3 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4F46E5"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4F46E5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Projects Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Active Projects
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {activeProjects.length}
                </h2>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Overdue Invoices Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Overdue Invoices
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  $
                  {overdueAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </h2>
                <p className="text-xs font-semibold text-rose-500 mt-1">
                  {overdueCount} items
                </p>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Total Clients Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Total Clients
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {clientsCount}
                </h2>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ================= MAIN SPLIT GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left Column: Recent Invoices */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent Invoices
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Showing top {Math.min(5, filteredInvoices.length)}
                </span>
              </div>

              {/* Mobile View: Invoice Cards */}
              <div className="block md:hidden space-y-3">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice._id}
                      className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {invoice.invoiceNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            invoice.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : invoice.status === "sent"
                                ? "bg-blue-100 text-blue-700"
                                : invoice.status === "overdue"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium truncate max-w-[180px]">
                          {projects?.find((p) => p._id === invoice.project)
                            ?.title || "Unassigned"}
                        </span>
                        <span className="font-bold text-slate-900">
                          ${invoice.total}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-slate-400 text-xs">
                    No matching invoices found.
                  </p>
                )}
              </div>

              {/* Desktop View: Invoice Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] sm:text-xs font-semibold uppercase text-slate-400">
                      <th className="py-3 px-2">INVOICE #</th>
                      <th className="py-3 px-2">PROJECT</th>
                      <th className="py-3 px-2">TOTAL</th>
                      <th className="py-3 px-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.slice(0, 5).map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="hover:bg-slate-50/50 transition"
                        >
                          <td className="py-3 px-2 font-medium text-slate-700 whitespace-nowrap">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="py-3 px-2 text-slate-900 font-semibold max-w-[120px] truncate">
                            {projects?.find((p) => p._id === invoice.project)
                              ?.title || "Unassigned"}
                          </td>
                          <td className="py-3 px-2 text-slate-900 font-medium whitespace-nowrap">
                            ${invoice.total}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${
                                invoice.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : invoice.status === "sent"
                                    ? "bg-blue-100 text-blue-700"
                                    : invoice.status === "overdue"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-8 text-slate-400 text-sm"
                        >
                          No matching invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Active Projects List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-4">
                Active Projects
              </h3>
              <div className="space-y-3">
                {activeProjects.length > 0 ? (
                  activeProjects.slice(0, 4).map((project) => (
                    <div
                      key={project._id}
                      className="p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {project.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                          {project.description || "No description specified..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-xs font-semibold text-slate-700">
                          ${project.rate || 0}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {project.title ? project.title.charAt(0) : "P"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No active projects
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= BOTTOM CHART: PROJECT STATUS BREAKDOWN ================= */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Project Status Breakdown
              </h3>
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                  Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>{" "}
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>{" "}
                  Rejected
                </span>
              </div>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectStatusChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="group"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="completed" fill="#4F46E5" stackId="status" />
                  <Bar dataKey="active" fill="#10B981" stackId="status" />
                  <Bar
                    dataKey="rejected"
                    fill="#EF4444"
                    stackId="status"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ================= QUICK INVOICE DRAWER ================= */}
        {isInvoiceDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-white h-dvh max-h-dvh flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="flex-none p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Create Quick Invoice
                </h2>
                <button
                  onClick={() => setIsInvoiceDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form
                id="quick-invoice-form"
                onSubmit={handleQuickInvoiceSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-001"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={newInvoice.invoiceNumber}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        invoiceNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Select Project
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={newInvoice.projectId}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        projectId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Optional / Unassigned --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={newInvoice.total}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, total: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={newInvoice.status}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, status: e.target.value })
                    }
                  >
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="flex-none p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsInvoiceDrawerOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="quick-invoice-form"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  Save Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
