"use client";
import { useState } from "react";
import { format, isBefore, parseISO } from "date-fns";
import { Plus, X } from "lucide-react";
import jsPDF from "jspdf";

type Recurrence = "none" | "weekly" | "monthly" | "quarterly";
type InvoiceStatus = "sent" | "paid" | "overdue";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  recurrence: Recurrence;
}

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [form, setForm] = useState({
    client: "",
    amount: "",
    dueDate: "",
    recurrence: "none" as Recurrence,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      recurrence: form.recurrence,
    };
    setInvoices([...invoices, newInvoice]);
    setForm({ client: "", amount: "", dueDate: "", recurrence: "none" });
    setModalOpen(false);
  };

  const getStatus = (inv: Invoice): InvoiceStatus => {
    if (inv.isPaid) return "paid";
    const today = new Date();
    const due = parseISO(inv.dueDate);
    return isBefore(due, today) ? "overdue" : "sent";
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
    doc.text(`Recurrence: ${invoice.recurrence}`, 20, 80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 90);
    doc.save(`invoice-${invoice.client}.pdf`);
  };

  const statusStyle = (status: InvoiceStatus) =>
    status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "overdue"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🧾 Invoice Tracker</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Invoice
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {invoices.map((inv) => {
          const status = getStatus(inv);
          return (
            <div
              key={inv.id}
              onClick={() => {
                setSelectedInvoice(inv);
                setDetailOpen(true);
              }}
              className="border rounded p-4 bg-white shadow hover:shadow-md cursor-pointer"
            >
              <h3 className="font-bold">{inv.client}</h3>
              <p className="text-sm text-gray-600">${inv.amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Due: {format(parseISO(inv.dueDate), "MMM d, yyyy")}</p>
              <span className={`text-xs px-2 py-1 mt-2 inline-block rounded ${statusStyle(status)}`}>
                {status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add Invoice</h2>
            <input name="client" value={form.client} onChange={handleInput} placeholder="Client Name" className="border px-3 py-2 rounded w-full" />
            <input name="amount" value={form.amount} onChange={handleInput} placeholder="Amount" type="number" className="border px-3 py-2 rounded w-full" />
            <input name="dueDate" value={form.dueDate} onChange={handleInput} type="date" className="border px-3 py-2 rounded w-full" />
            <select name="recurrence" value={form.recurrence} onChange={handleInput} className="border px-3 py-2 rounded w-full">
              <option value="none">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="text-gray-500">Cancel</button>
              <button onClick={addInvoice} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {detailOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Invoice Details</h2>
              <button onClick={() => setDetailOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <p><strong>Client:</strong> {selectedInvoice.client}</p>
            <p><strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
            <p><strong>Due:</strong> {format(parseISO(selectedInvoice.dueDate), "PPPP")}</p>
            <p><strong>Status:</strong> {getStatus(selectedInvoice)}</p>
            <p><strong>Recurs:</strong> {selectedInvoice.recurrence}</p>
            <button
              onClick={() => exportInvoicePDF(selectedInvoice)}
              className="mt-4 text-sm underline text-blue-600"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                if (selectedInvoice) togglePaid(selectedInvoice.id);
                setDetailOpen(false);
              }}
              className="text-sm m-2 underline text-green-600"
            >
              Mark as {selectedInvoice.isPaid ? "Unpaid" : "Paid"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
