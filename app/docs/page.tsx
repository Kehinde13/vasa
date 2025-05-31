"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import mammoth from "mammoth";
import {
  Plus, FileText, FileInput, FilePlus,
  Eye, Pencil, Trash2, Download, ArrowLeft
} from "lucide-react";

type Doc = {
  id: string;
  title: string;
  category: string;
  file: File | null;
  content: string;
};

export default function DocCentre() {
  const router = useRouter();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [form, setForm] = useState<Doc>({
    id: "", title: "", category: "", file: null, content: ""
  });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [docxHTML, setDocxHTML] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(docs.map((d) => d.category)));
    return ["All", ...cats];
  }, [docs]);

  const filteredDocs = docs.filter(doc => {
    const matchesTitle = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
    return matchesTitle && matchesCategory;
  });

  const resetForm = () => setForm({ id: "", title: "", category: "", file: null, content: "" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "file" && files?.length) {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = () => {
    if (!form.title || (!form.file && !form.content.trim())) return;
    if (editingDocId) {
      setDocs(docs.map(doc => doc.id === editingDocId ? { ...form, id: editingDocId } : doc));
    } else {
      setDocs([...docs, { ...form, id: crypto.randomUUID() }]);
    }
    setShowModal(false);
    setEditingDocId(null);
    resetForm();
  };

  const handleEdit = (doc: Doc) => {
    setForm(doc);
    setEditingDocId(doc.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(doc => doc.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return <FileInput className="text-blue-600 w-5 h-5" />;
    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) return <FileInput className="text-green-600 w-5 h-5" />;
    if (fileName.endsWith(".pdf")) return <FileText className="text-red-600 w-5 h-5" />;
    return <FilePlus className="text-gray-500 w-5 h-5" />;
  };

  useEffect(() => {
    if (previewDoc?.file && previewDoc.file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHTML(result.value);
        }
      };
      reader.readAsArrayBuffer(previewDoc.file);
    } else {
      setDocxHTML("");
    }
  }, [previewDoc]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📁 Doc Centre</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingDocId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title..."
          className="w-full md:w-1/2 border px-4 py-2 rounded"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/4"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
          >
            <div className="flex items-center gap-2">
              {doc.file ? getFileIcon(doc.file.name) : <FileText className="w-5 h-5" />}
              <h3 className="font-semibold text-sm">{doc.title}</h3>
            </div>
            <p className="text-xs text-gray-500">📂 {doc.category}</p>
            {doc.file && (
              <p className="text-xs">📎 {doc.file.name}</p>
            )}
            <div className="flex gap-2 mt-2 text-xs">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={() => handleEdit(doc)}
                className="text-green-600 hover:underline flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{previewDoc.title}</h2>
                <p className="text-xs text-gray-500">📂 {previewDoc.category}</p>
                {previewDoc.file && (
                  <p className="text-xs text-gray-500 mt-1">
                    📎 {previewDoc.file.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* DOCX preview */}
            {previewDoc.file?.name.endsWith(".docx") ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: docxHTML }}
              />
            ) : previewDoc.file?.type === "application/pdf" ? (
              <iframe
                src={URL.createObjectURL(previewDoc.file)}
                className="w-full h-96 border rounded"
              />
            ) : (
              <p className="text-sm text-gray-600">No preview available</p>
            )}

            {previewDoc.file && (
              <a
                href={URL.createObjectURL(previewDoc.file)}
                download={previewDoc.file.name}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        </div>
      )}

      {/* ➕ Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingDocId ? "Edit Document" : "Upload New Document"}
            </h2>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Document Title"
              className="w-full border px-4 py-2 rounded-lg"
            />
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category (e.g. Legal, Finance)"
              className="w-full border px-4 py-2 rounded-lg"
            />

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
            >
              <p className="text-sm text-blue-700">📎 Upload a file</p>
              <p className="text-xs text-gray-500">(Word, Excel, PDF)</p>
              <input
                id="file-upload"
                name="file"
                type="file"
                accept=".doc,.docx,.xls,.xlsx,.pdf"
                onChange={handleChange}
                className="hidden"
              />
            </label>

            {form.file && (
              <p className="text-sm text-gray-600">📄 {form.file.name}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDocId(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
