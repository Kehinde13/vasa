"use client";
import { useState } from "react";
import { format, isBefore, parseISO } from "date-fns";
import { Plus, X } from "lucide-react";
import jsPDF from "jspdf";


type InvoiceStatus = "sent" | "paid" | "overdue";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1",
      client: "Alpha Co.",
      amount: 2500,
      dueDate: "2025-06-10",
      isPaid: false,
    },
    {
      id: "2",
      client: "Beta Ltd.",
      amount: 1300,
      dueDate: "2025-05-28",
      isPaid: true,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    client: "",
    amount: "",
    dueDate: "",
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addInvoice = () => {
    if (!form.client || !form.amount || !form.dueDate) return;
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      client: form.client,
      amount: parseFloat(form.amount),
      dueDate: form.dueDate,
      isPaid: false,
    };
    setInvoices([...invoices, newInvoice]);
    setForm({ client: "", amount: "", dueDate: "" });
    setModalOpen(false);
  };

  const togglePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, isPaid: !inv.isPaid } : inv))
    );
  };

  const exportInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Invoice", 20, 20);

  doc.setFontSize(12);
  doc.text(`Client: ${invoice.client}`, 20, 40);
  doc.text(`Amount: $${invoice.amount.toFixed(2)}`, 20, 50);
  doc.text(`Due Date: ${invoice.dueDate}`, 20, 60);
  doc.text(`Status: ${getStatus(invoice).toUpperCase()}`, 20, 70);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 80);

  doc.save(`invoice-${invoice.client}.pdf`);
};

  const getStatus = (inv: Invoice): InvoiceStatus => {
    if (inv.isPaid) return "paid";
    const today = new Date();
    const due = parseISO(inv.dueDate);
    return isBefore(due, today) ? "overdue" : "sent";
  };

  const statusStyle = (status: InvoiceStatus) => {
    return status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "overdue"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">💰 Invoice Tracker</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Invoice
        </button>
      </div>

      <div className="grid gap-4">
        {invoices.map((inv) => {
          const status = getStatus(inv);
          return (
            <div
              key={inv.id}
              className="p-4 border rounded shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{inv.client}</p>
                <p className="text-sm text-gray-600">
                  💵 ${inv.amount.toFixed(2)} | 📅 Due:{" "}
                  {format(parseISO(inv.dueDate), "PPP")}
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <span
                  className={`text-xs px-2 py-1 rounded ${statusStyle(status)}`}
                >
                  {status.toUpperCase()}
                </span>
                <button
                  onClick={() => togglePaid(inv.id)}
                  className="text-xs underline text-blue-600"
                >
                  Mark as {inv.isPaid ? "Unpaid" : "Paid"}
                </button>
                <button
                  onClick={() => exportInvoicePDF(inv)}
                  className="text-xs underline text-gray-500"
                >
                  Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">New Invoice</h2>
            <input
              name="client"
              value={form.client}
              onChange={handleInput}
              placeholder="Client Name"
              className="border px-3 py-2 rounded w-full mb-3"
            />
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleInput}
              placeholder="Amount"
              className="border px-3 py-2 rounded w-full mb-3"
            />
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleInput}
              className="border px-3 py-2 rounded w-full mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={addInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
