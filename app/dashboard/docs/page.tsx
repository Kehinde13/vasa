"use client";

import { useState, useMemo, useEffect } from "react";
import mammoth from "mammoth";
import {
  Plus, FileText, FileInput, FilePlus,
  Eye, Pencil, Trash2, Download, Cloud
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
 
 /* const PICKER_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; */

if (!API_KEY) console.error("Missing GOOGLE_API_KEY");
 
 /* if (!PICKER_CLIENT_ID) console.error("Missing GOOGLE_CLIENT_ID"); */

declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    gapi: any;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    google: any;
  }
}

type Doc = {
  _id?: string; // MongoDB ID
  id: string;
  title: string;
  category: string;
  file: File | null;
  content: string;
};

export default function DocCentre() {
  const { data: session } = useSession();
  const { user } = useAuth();

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


  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const handleChange = (e: any) => {
  const { name, value, files } = e.target;

  if (name === "file" && files?.length) {
    const newFile = files[0];
    setForm({ ...form, file: newFile });
  } else {
    setForm({ ...form, [name]: value });
  }
};


  const handleSave = async () => {
  if (!form.title || (!form.file && !form.content.trim())) return;
  if (!user?.id) return alert("User not authenticated");

  try {
    let content = form.content;

    // If it's a .docx, convert to HTML before upload
    if (form.file && form.file.name.endsWith(".docx")) {
      const arrayBuffer = await form.file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      content = result.value;
    }

    if (form.file) {
      // Upload file + metadata via FormData
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category || "Uploaded");
      formData.append("owner", user.id);
      formData.append("type", "upload");
      formData.append("content", content || "");
      formData.append("file", form.file);

      const res = await fetch("https://vasabackend.onrender.com/api/documents", {
        method: "POST",
        body: formData,
      });

      const newDoc = await res.json();
      setDocs((prev) => [...prev, newDoc]);
      toast.success("Document uploaded successfully");
    } else {
      // Manual content (no file)
      const payload = {
        title: form.title,
        category: form.category || "Manual",
        owner: user.id,
        content: content,
        type: "manual",
      };

      const res = await fetch("https://vasabackend.onrender.com/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const newDoc = await res.json();
      setDocs((prev) => [...prev, newDoc]);
      toast.success("Document saved successfully");
    }
  } catch (err) {
    console.error("Failed to save document:", err);
    toast.error("Error saving document");
  }

  setShowModal(false);
  setEditingDocId(null);
  resetForm();
};


const handleDelete = async (id: string) => {
  try {
    // Make sure we're using the right ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docId = id || docs.find(d => d.id === id || (d as any)._id === id)?._id;
    
    if (!docId) {
      toast.error('Document ID not found');
      return;
    }

    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    // Delete from backend
    const response = await fetch(`https://vasabackend.onrender.com/api/documents/${docId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // If backend deletion successful, remove from frontend state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDocs(docs.filter(doc => (doc.id || (doc as any)._id) !== docId));
    
    toast.success("Document deleted successfully");
  } catch (error) {
    toast.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handleEdit = (doc: Doc) => {
  setForm(doc);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEditingDocId(doc.id || (doc as any)._id);
  setShowModal(true);
};

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return <FileInput className="text-blue-600 dark:text-blue-400 w-5 h-5" />;
    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) return <FileInput className="text-green-600 dark:text-green-400 w-5 h-5" />;
    if (fileName.endsWith(".pdf")) return <FileText className="text-red-600 dark:text-red-400 w-5 h-5" />;
    return <FilePlus className="text-gray-500 dark:text-gray-400 w-5 h-5" />;
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => window.gapi.load("client:picker", () => {});
    document.body.appendChild(script);
  }, []);

useEffect(() => {
  const userId = user?.id;
  if (!userId) return;

  (async () => {
    try {
      const res = await fetch(
        `https://vasabackend.onrender.com/api/documents?owner=${userId}`
      );
      const data = await res.json();
      
      // Fix the mapping - make sure id is properly set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedDocs = data.map((d: any) => ({
        ...d,
        id: d._id || d.id, // Use _id from MongoDB or fallback to id
      }));
      
      
      setDocs(mappedDocs);
    } catch (err) {
      console.error('Failed fetching docs', err);
    }
  })();
}, [user]);



 const openPicker = () => {
  if (!session) return signIn("google");

  if (!session?.accessToken || !window.google?.picker)
    return alert("Google Picker not loaded or session missing");

  const view = new window.google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true);

  const picker = new window.google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(session.accessToken)
    .setDeveloperKey(API_KEY)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .setCallback(async (data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const picked = data.docs[0];
        const fileId = picked.id;
        const fileName = picked.name;

        try {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });

          let content = "";
          if (fileName.endsWith(".docx")) {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            content = result.value;
          }


          if (!user?.id) return alert("User not authenticated");

          // ✅ Upload to backend
          const formData = new FormData();
          formData.append("title", fileName);
          formData.append("category", "Google Drive");
          formData.append("owner", user.id);
          formData.append("type", "upload");
          formData.append("file", file);
          formData.append("content", content);

          const res = await fetch("https://vasabackend.onrender.com/api/documents", {
            method: "POST",
            body: formData,
          });

          const newDoc = await res.json();
          setDocs((prev) => [...prev, newDoc]);
          setPreviewDoc(newDoc);
        } catch (err) {
          console.error("Failed to download Google Drive file:", err);
          alert("Unable to fetch the file from Google Drive.");
        }
      }
    })
    .build();

  picker.setVisible(true);
};


const handlePreview = async (doc: Doc) => {
  try {
    
    // Use either doc.id or doc._id, whichever exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentId = doc.id || (doc as any)._id;
    
    if (!documentId) {
      toast.error('Document ID not found');
      return;
    }
    
    setDocxHTML(""); // Reset previous content
    
    // Case 1: File already exists in memory (uploaded in same session)
    if (doc.file instanceof File) {
      if (doc.file.name.endsWith(".docx")) {
        const arrayBuffer = await doc.file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHTML(result.value);
      }
      setPreviewDoc(doc);
      return;
    }

    // Case 2: Need to fetch from backend
    const fileUrl = `https://vasabackend.onrender.com/api/documents/${documentId}/file`;
    
    const res = await fetch(fileUrl);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Check if response is JSON (content-only) or a file
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // This is a content-only document
      const data = await res.json();
      setPreviewDoc({
        ...doc,
        content: data.content,
        file: null
      });
      return;
    }

    // This is a file response
    const blob = await res.blob();
    
    // Create filename from content-disposition header or use doc title
    let fileName = doc.title || 'document';
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const filenameMatch = disposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        fileName = filenameMatch[1];
      }
    } else {
      // Guess extension from content-type
      const mimeType = res.headers.get('content-type');
      if (mimeType?.includes('pdf')) fileName += '.pdf';
      else if (mimeType?.includes('wordprocessingml')) fileName += '.docx';
      else if (mimeType?.includes('msword')) fileName += '.doc';
      else if (mimeType?.includes('spreadsheetml')) fileName += '.xlsx';
      else if (mimeType?.includes('ms-excel')) fileName += '.xls';
    }

    const file = new File([blob], fileName, { type: blob.type });

    // Convert DOCX to HTML for preview
    if (fileName.endsWith('.docx')) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHTML(result.value);
      } catch (conversionError) {
        console.error('Error converting DOCX:', conversionError);
        toast.error('Error converting document for preview');
      }
    }

    setPreviewDoc({ ...doc, file });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Failed to fetch file for preview:', err);
    toast.error(`Unable to preview document: ${err.message}`);
  }
};

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">📁 Doc Centre</h1>
        <div className="flex gap-2 flex-wrap">
          
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
      </div>

       {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title..."
          className="w-full md:w-1/2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-2 rounded"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-2 rounded w-full md:w-1/4"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc, index) => (
          <div
            key={index}
            className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm space-y-2"
          >
            <div className="flex items-center gap-2">
              {doc.file ? getFileIcon(doc.file.name) : <FileText className="w-5 h-5 dark:text-white" />}
              <h3 className="font-semibold text-sm dark:text-white">{doc.title}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">📂 {doc.category}</p>
            {doc.file && (
              <p className="text-xs text-gray-600 dark:text-gray-300">📎 {doc.file.name}</p>
            )}
            <div className="flex gap-2 mt-2 text-xs">
              <button
                onClick={() => handlePreview(doc)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> View
              </button> 
              <button
                onClick={() => handleEdit(doc)}
                className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
     {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-auto">
            {/* Header remains the same */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{previewDoc.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">📂 {previewDoc.category}</p>
                {previewDoc.file && (
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    📎 {previewDoc.file.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Fixed content rendering */}
            <div className="border rounded p-4 max-h-96 overflow-y-auto">
              {previewDoc.file?.name.endsWith(".docx") ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: previewDoc.content || docxHTML || "Converting document..." 
                  }}
                />
              ) : previewDoc.file?.type === "application/pdf" ? (
                <iframe
                  src={URL.createObjectURL(previewDoc.file)}
                  className="w-full h-96 border rounded"
                  title="PDF Preview"
                />
              ) : previewDoc.content ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {previewDoc.content}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">No preview available</p>
              )}
            </div>

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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {editingDocId ? "Edit Document" : "Upload New Document"}
            </h2>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Document Title"
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-2 rounded-lg"
            />
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category (e.g. Legal, Finance)"
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-2 rounded-lg"
            />

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              <p className="text-sm text-blue-700 dark:text-blue-300">📎 Upload a file</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">(Word, Excel, PDF)</p>
              <input
                id="file-upload"
                name="file"
                type="file"
                accept=".doc,.docx,.xls,.xlsx,.pdf"
                onChange={handleChange}
                className="hidden"
              />
            </label>

             {session?.accessToken ? (
                <button
                  onClick={() => {
                    openPicker();
                    toast.success("Google Drive connected!");
                    setShowModal(false);
                  }}
                  className="flex items-center gap-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40"
                >
                  <Cloud className="w-4 h-4" /> Import from Google Drive
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center gap-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40"
                >
                  <Cloud className="w-4 h-4" /> Connect Google Drive
                </button>
              )}



            {form.file && (
              <p className="text-sm text-gray-600 dark:text-gray-300">📄 {form.file.name}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDocId(null);
                  resetForm();
                }}
                className="px-4 py-2 border dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
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
