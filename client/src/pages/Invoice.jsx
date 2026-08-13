import React, { useState, useEffect } from "react";
import api from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoiceTemplate from "./InvoiceTemplate";
import Navbar from "../NavBar";

function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [invoiceProjects, setInvoiceProjects] = useState([]);

  // Drawer / Form Control
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [project, setProject] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: "", rate: "" },
  ]);
  const [status, setStatus] = useState("draft");
  const [allFieldsError, setAllFieldsError] = useState(false);

  // PDF Download State
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  // Lock body scroll when drawer is open to prevent page bounce/double scroll
  useEffect(() => {
    document.title = "Invoices | My FreeLance Site";
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
      .get("/invoices/invoice")
      .then((res) => setInvoices(res.data || []))
      .catch((err) => console.error("Error fetching invoices:", err));

    api
      .get("/projects/project")
      .then((res) => setInvoiceProjects(res.data || []))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  // --- LINE ITEM HANDLERS ---
  const handleLineItemChange = (index, field, value) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setLineItems(updated);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "", rate: "" }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // --- RESET FORM ---
  const resetForm = () => {
    setProject("");
    setLineItems([{ description: "", quantity: "", rate: "" }]);
    setStatus("draft");
    setEditingId(null);
    setAllFieldsError(false);
    setIsDrawerOpen(false);
  };

  // --- START CREATE / EDIT ---
  const handleOpenCreate = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const startEdit = (invoice) => {
    setEditingId(invoice._id);
    setProject(invoice.project);
    setLineItems(
      invoice.lineItems || [{ description: "", quantity: "", rate: "" }],
    );
    setStatus(invoice.status || "draft");
    setIsDrawerOpen(true);
  };

  // --- SUBMIT (CREATE OR EDIT) ---
  const handleSubmit = () => {
    setAllFieldsError(false);

    if (!project || !status) {
      setAllFieldsError(true);
      return;
    }

    const payload = { project, lineItems, status };

    if (editingId) {
      api
        .put(`/invoices/invoice/${editingId}`, payload)
        .then((res) => {
          setInvoices(
            invoices.map((inv) => (inv._id === editingId ? res.data : inv)),
          );
          resetForm();
        })
        .catch((err) => {
          console.error("Error updating invoice:", err);
          setAllFieldsError(true);
        });
    } else {
      api
        .post("/invoices/invoice", payload)
        .then((res) => {
          setInvoices([...invoices, res.data]);
          resetForm();
        })
        .catch((err) => {
          console.error("Error creating invoice:", err);
          setAllFieldsError(true);
        });
    }
  };

  // --- DELETE INVOICE ---
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    api
      .delete(`/invoices/invoice/${id}`)
      .then(() => {
        setInvoices(invoices.filter((inv) => inv._id !== id));
      })
      .catch((err) => console.error("Error deleting invoice:", err));
  };

  // --- PDF DOWNLOAD ---
  const handlePDFDownload = async (invoice) => {
    const projectTitle = invoiceProjects.find(
      (p) => p._id === invoice.project,
    )?.title;
    setDownloadingInvoice({ invoice, projectTitle });

    setTimeout(async () => {
      const element = document.getElementById("invoice-pdf-template");
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`${invoice.invoiceNumber || "Invoice"}.pdf`);

      setDownloadingInvoice(null);
    }, 150);
  };

  // --- HELPER FOR STATUS BADGES ---
  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 sm:py-0.5 rounded-full text-[11px] sm:text-xs font-semibold capitalize ${
        status === "paid"
          ? "bg-emerald-100 text-emerald-700"
          : status === "sent"
            ? "bg-blue-100 text-blue-700"
            : status === "overdue"
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
                Invoices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage, edit, and download client billing statement records.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 sm:py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span> Create Invoice
            </button>
          </div>

          {/* ================= MOBILE VIEW (CARDS) ================= */}
          <div className="block md:hidden space-y-3">
            {Array.isArray(invoices) && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {invoice.invoiceNumber}
                    </span>
                    {renderStatusBadge(invoice.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-y border-slate-100">
                    <span className="text-slate-500">
                      {(Array.isArray(invoiceProjects)
                        ? invoiceProjects
                        : []
                      ).find((p) => p._id === invoice.project)?.title ||
                        "Unassigned"}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      ${invoice.total || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => startEdit(invoice)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePDFDownload(invoice)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(invoice._id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No invoices created yet.
              </div>
            )}
          </div>

          {/* ================= DESKTOP VIEW (TABLE) ================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-700 max-w-[200px] truncate">
                        {invoiceProjects.find((p) => p._id === invoice.project)
                          ?.title || "Unassigned"}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-900">
                        ${invoice.total || 0}
                      </td>

                      <td className="py-4 px-6">
                        {renderStatusBadge(invoice.status)}
                      </td>

                      <td className="py-4 px-6 text-right space-x-3">
                        <button
                          onClick={() => startEdit(invoice)}
                          className="text-slate-600 hover:text-indigo-600 font-medium text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePDFDownload(invoice)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs transition"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(invoice._id)}
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
                      No invoices created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL DRAWER (FIXED DOUBLE-SCROLLBAR ISSUE) ================= */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <div className="w-full sm:max-w-lg bg-white h-dvh max-h-dvh flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Header (Fixed at top) */}
              <div className="flex-none p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Edit Invoice" : "Create New Invoice"}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Form Body (ONLY THIS SECTION SCROLLS) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Project Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Project
                  </label>
                  <select
                    className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a project...
                    </option>
                    {Array.isArray(invoiceProjects) &&
                      invoiceProjects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                      Line Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-indigo-50 rounded-lg"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                      >
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            DESCRIPTION
                          </label>
                          <input
                            type="text"
                            placeholder="Item name or service description"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                            value={item.description}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                              QTY
                            </label>
                            <input
                              type="number"
                              placeholder="1"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                              RATE ($)
                            </label>
                            <input
                              type="number"
                              placeholder="0.00"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                              value={item.rate}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "rate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        {lineItems.length > 1 && (
                          <div className="text-right pt-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(index)}
                              className="text-xs font-medium text-rose-500 hover:text-rose-600"
                            >
                              Remove Item
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                {allFieldsError && (
                  <p className="text-xs font-semibold text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    Please complete all required fields before saving.
                  </p>
                )}
              </div>

              {/* Drawer Actions (Fixed at bottom) */}
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
                  {editingId ? "Update Invoice" : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PDF TEMPLATE (Hidden Capture Target) ================= */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          {downloadingInvoice && (
            <div id="invoice-pdf-template">
              <InvoiceTemplate
                invoice={downloadingInvoice.invoice}
                projectTitle={downloadingInvoice.projectTitle}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Invoice;
