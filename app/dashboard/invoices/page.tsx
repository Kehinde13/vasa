"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Invoice {
  _id: string;
  client: string;
  amount: number;
  dueDate: string;
  recurrence: string;
  isPaid?: boolean;
}

interface FormValues {
  client: string;
  amount: number;
  dueDate: string;
  recurrence: "none" | "weekly" | "monthly" | "quarterly";
}

export default function InvoicesPage() {
  const [form, setForm] = useState<FormValues>({
    client: "",
    amount: 0,
    dueDate: "",
    recurrence: "none",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fetching, setFetching] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const fetchInvoices = async () => {
    if (!token) return;
    setFetching(true);

    try {
      const res = await fetch(`https://vasabackend.onrender.com/api/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch invoices");

      setInvoices(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Error loading invoices");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `https://vasabackend.onrender.com/api/invoices/${editingId}`
        : "https://vasabackend.onrender.com/api/invoices";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving invoice");

      toast.success(editingId ? "Invoice updated!" : "Invoice created!");
      setForm({ client: "", amount: 0, dueDate: "", recurrence: "none" });
      setEditingId(null);
      fetchInvoices();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setForm({
      client: invoice.client,
      amount: invoice.amount,
      dueDate: invoice.dueDate.slice(0, 10),
      recurrence: invoice.recurrence as FormValues["recurrence"],
    });
    setEditingId(invoice._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this invoice?")) return;

    try {
      const res = await fetch(
        `https://vasabackend.onrender.com/api/invoices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("Invoice deleted");
      fetchInvoices();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Error deleting invoice");
    }
  };

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token]);

  return (
    <section className="max-w-3xl mx-auto py-8 px-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
        {editingId ? "Edit Invoice" : "Create New Invoice"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Client Name
          </label>
          <input
            name="client"
            value={form.client}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (₦)
          </label>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recurrence
          </label>
          <select
            name="recurrence"
            value={form.recurrence}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Invoice"
              : "Create Invoice"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  client: "",
                  amount: 0,
                  dueDate: "",
                  recurrence: "none",
                });
              }}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr className="my-10 border-gray-300 dark:border-gray-600" />

      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Your Invoices
      </h3>

      {fetching ? (
        <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No invoices found.</p>
      ) : (
        <ul className="space-y-4">
          {invoices.map((invoice) => (
            <li
              key={invoice._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {invoice.client}
                </h4>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    invoice.isPaid
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {invoice.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Amount:</strong> ₦{invoice.amount.toLocaleString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Due:</strong>{" "}
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Recurrence:</strong> {invoice.recurrence}
              </p>

              <div className="flex gap-6 mt-4">
                <button
                  onClick={() => handleEdit(invoice)}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(invoice._id)}
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
