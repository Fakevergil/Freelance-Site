import React, { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../NavBar";

function Clients() {
  const [clients, setClients] = useState([]);

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Input States
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);

  // Prevent background scrolling when modal drawer is open
  useEffect(() => {
    document.title = "Clients | My FreeLance Site";
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // --- FETCH CLIENTS ---
  useEffect(() => {
    api
      .get("/client/clients")
      .then((res) => setClients(res.data || []))
      .catch((err) => console.error("Error fetching clients:", err));
  }, []);

  // --- RESET FORM STATE ---
  const resetForm = () => {
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setEditingId(null);
    setInvalidEmail(false);
    setIsDrawerOpen(false);
  };

  // --- OPEN CREATE DRAWER ---
  const handleOpenCreate = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  // --- OPEN EDIT DRAWER ---
  const handleEditStart = (client) => {
    setEditingId(client._id);
    setName(client.name || "");
    setCompany(client.company || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setInvalidEmail(false);
    setIsDrawerOpen(true);
  };

  // --- SUBMIT (CREATE OR EDIT) ---
  const handleSubmit = () => {
    setInvalidEmail(false);

    const payload = { name, company, email, phone };

    if (editingId) {
      // EDIT CLIENT
      api
        .put(`/client/clients/${editingId}`, payload)
        .then((res) => {
          setClients(
            clients.map((client) =>
              client._id === editingId ? res.data : client,
            ),
          );
          resetForm();
        })
        .catch((err) => {
          console.error("Error updating client:", err);
          if (err.response?.status === 400) {
            setInvalidEmail(true);
          }
        });
    } else {
      // CREATE CLIENT
      api
        .post("/client/clients", payload)
        .then((res) => {
          setClients([...clients, res.data]);
          resetForm();
        })
        .catch((err) => {
          console.error("Error creating client:", err);
          if (err.response?.status === 400) {
            setInvalidEmail(true);
          }
        });
    }
  };

  // --- DELETE CLIENT ---
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    api
      .delete(`/client/clients/${id}`)
      .then(() => {
        setClients(clients.filter((client) => client._id !== id));
      })
      .catch((err) => console.error("Error deleting client:", err));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Clients
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your client roster, contact information, and
                organizations.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 sm:py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span> Add Client
            </button>
          </div>

          {/* ================= MOBILE VIEW (CARDS) ================= */}
          <div className="block md:hidden space-y-3">
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {client.company || "No Company Specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-medium truncate max-w-[200px]">
                        {client.email || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-medium">{client.phone || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleEditStart(client)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No clients found. Add your first client to get started.
              </div>
            )}
          </div>

          {/* ================= DESKTOP VIEW (TABLE) ================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
                  <th className="py-4 px-6">Client Name</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <tr
                      key={client._id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {client.name}
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-700">
                        {client.company || "—"}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {client.email || "—"}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {client.phone || "—"}
                      </td>

                      <td className="py-4 px-6 text-right space-x-3">
                        <button
                          onClick={() => handleEditStart(client)}
                          className="text-slate-600 hover:text-indigo-600 font-medium text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-rose-500 hover:text-rose-700 font-medium text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      No clients found. Add your first client to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL DRAWER (CREATE / EDIT) ================= */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <div className="w-full sm:max-w-lg bg-white h-dvh max-h-dvh flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Header (Fixed) */}
              <div className="flex-none p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Edit Client" : "Add New Client"}
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
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="e.g. Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2.5 sm:py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                      invalidEmail
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                    placeholder="e.g. jane@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {invalidEmail && (
                    <p className="text-xs font-semibold text-rose-500 mt-1.5">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="e.g. +1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
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
                  {editingId ? "Update Client" : "Create Client"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Clients;
