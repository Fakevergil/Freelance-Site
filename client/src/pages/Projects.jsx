import React, { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../NavBar";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [projectClients, setProjectClients] = useState([]);

  // Drawer / Form Control
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [status, setStatus] = useState("active");
  const [client, setClient] = useState("");
  const [formError, setFormError] = useState("");

  // Lock body scroll when drawer is open to prevent page bounce/double scroll
  useEffect(() => {
    document.title = "Projects | My FreeLance Site";
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    api
      .get("/projects/project")
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.error("Error fetching projects:", err));

    api
      .get("/client/clients")
      .then((res) => setProjectClients(res.data || []))
      .catch((err) => console.error("Error fetching clients:", err));
  }, []);

  // --- RESET FORM STATE ---
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRate("");
    setStatus("active");
    setClient("");
    setEditingId(null);
    setFormError("");
    setIsDrawerOpen(false);
  };

  // --- START CREATION ---
  const handleOpenCreate = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  // --- START EDITING ---
  const handleEditStart = (project) => {
    setEditingId(project._id);
    setTitle(project.title || "");
    setDescription(project.description || "");
    setRate(project.rate || "");
    setStatus(project.status || "active");
    setClient(project.client || "");
    setFormError("");
    setIsDrawerOpen(true);
  };

  // --- SUBMIT (CREATE OR UPDATE) ---
  const handleSubmit = () => {
    if (!title || !status || !client) {
      setFormError("Please fill out Title, Status, and select a Client.");
      return;
    }

    const payload = {
      title,
      description,
      rate: Number(rate) || 0,
      status,
      client,
    };

    if (editingId) {
      // EDIT PROJECT
      api
        .put(`/projects/project/${editingId}`, payload)
        .then((res) => {
          setProjects(
            projects.map((p) => (p._id === editingId ? res.data : p)),
          );
          resetForm();
        })
        .catch((err) => {
          console.error("Error updating project:", err);
          setFormError("Failed to update project. Please try again.");
        });
    } else {
      // CREATE PROJECT
      api
        .post("/projects/project", payload)
        .then((res) => {
          setProjects([...projects, res.data]);
          resetForm();
        })
        .catch((err) => {
          console.error("Error creating project:", err);
          setFormError("Failed to create project. Please try again.");
        });
    }
  };

  // --- DELETE PROJECT ---
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    api
      .delete(`/projects/project/${id}`)
      .then(() => {
        setProjects(projects.filter((p) => p._id !== id));
      })
      .catch((err) => console.error("Error deleting project:", err));
  };

  // --- HELPER FOR STATUS BADGES ---
  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 sm:py-0.5 rounded-full text-[11px] sm:text-xs font-semibold capitalize ${
        status === "completed"
          ? "bg-emerald-100 text-emerald-700"
          : status === "active"
            ? "bg-blue-100 text-blue-700"
            : status === "rejected"
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Projects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage, monitor, and assign active client work.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 sm:py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span> Add Project
            </button>
          </div>

          {/* ================= MOBILE VIEW (CARDS) ================= */}
          <div className="block md:hidden space-y-3">
            {projects && projects.length > 0 ? (
              projects.map((project) => {
                const matchedClient = projectClients.find(
                  (c) => c._id === project.client,
                );
                return (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[200px]">
                        {project.title}
                      </span>
                      {renderStatusBadge(project.status)}
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100">
                      <span className="text-slate-600 font-medium truncate max-w-[150px]">
                        {matchedClient?.company ||
                          matchedClient?.name ||
                          "Unassigned"}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        ${project.rate || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleEditStart(project)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No projects created yet.
              </div>
            )}
          </div>

          {/* ================= DESKTOP VIEW (TABLE) ================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Rate</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {projects && projects.length > 0 ? (
                  projects.map((project) => {
                    const matchedClient = projectClients.find(
                      (c) => c._id === project.client,
                    );
                    return (
                      <tr
                        key={project._id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {project.title}
                        </td>

                        <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                          {project.description || "—"}
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-900">
                          ${project.rate || 0}
                        </td>

                        <td className="py-4 px-6">
                          {renderStatusBadge(project.status)}
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-700">
                          {matchedClient?.company ||
                            matchedClient?.name ||
                            "Unassigned"}
                        </td>

                        <td className="py-4 px-6 text-right space-x-3">
                          <button
                            onClick={() => handleEditStart(project)}
                            className="text-slate-600 hover:text-indigo-600 font-medium text-xs transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="text-rose-500 hover:text-rose-700 font-medium text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      No projects created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL DRAWER (CONTAINED SCROLLBARS) ================= */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <div className="w-full sm:max-w-lg bg-white h-dvh max-h-dvh flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Header (Fixed) */}
              <div className="flex-none p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Edit Project" : "Add New Project"}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Form Body (Scrolls inside this container only) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="e.g. Website Redesign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="Brief scope or details of the project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Rate ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="0.00"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Client Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Client
                  </label>
                  <select
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a client...
                    </option>
                    {projectClients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.company || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formError && (
                  <p className="text-xs font-semibold text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    {formError}
                  </p>
                )}
              </div>

              {/* Drawer Actions (Fixed) */}
              <div className="flex-none p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  {editingId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Projects;
