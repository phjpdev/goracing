"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

type RecordRow = {
  id: string;
  date: string;
  description: string;
  media_urls: string[];
  created_at: string;
};

type RecordForm = {
  date: string;
  description: string;
  files: File[];
};

// Convert backend media path to frontend proxy path
// /uploads/records/uuid.png → /api/uploads/records/uuid.png
function mediaUrl(path: string) {
  return `/api${path}`;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#0D1117] border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays =
    locale === "zh-TW"
      ? ["日", "一", "二", "三", "四", "五", "六"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const wd = weekdays[d.getDay()];

  if (locale === "zh-TW") {
    return `${year}年${month}月${day}日(週${wd})`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${day}, ${year} (${wd})`;
}

function isVideo(path: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(path);
}

// Upload with XHR for progress tracking
function uploadWithProgress(
  url: string,
  method: string,
  formData: FormData,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });

    xhr.addEventListener("error", () => {
      resolve({ ok: false, status: 0, data: { error: "Network error" } });
    });

    xhr.send(formData);
  });
}

export default function RecordsPage() {
  const { t, locale } = useLanguage();
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<RecordForm>({ date: "", description: "", files: [] });
  const [editingRecord, setEditingRecord] = useState<RecordRow | null>(null);
  const [editForm, setEditForm] = useState<RecordForm>({ date: "", description: "", files: [] });
  const [deletingRecord, setDeletingRecord] = useState<RecordRow | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchRecords = useCallback(async () => {
    const res = await fetch("/api/records");
    if (res.ok) setRecords(await res.json());
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const inputClass =
    "w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#28E88E]/50";

  const handleAdd = async () => {
    setError("");
    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("date", addForm.date);
    formData.append("description", addForm.description);
    for (const file of addForm.files) {
      formData.append("files", file);
    }

    const result = await uploadWithProgress("/api/records", "POST", formData, setUploadProgress);
    setLoading(false);
    setUploadProgress(0);
    if (!result.ok) {
      setError((result.data.error as string) ?? "Failed");
      return;
    }
    setShowAdd(false);
    setAddForm({ date: "", description: "", files: [] });
    fetchRecords();
  };

  const openEdit = (r: RecordRow) => {
    setEditingRecord(r);
    setEditForm({
      date: r.date,
      description: r.description,
      files: [],
    });
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setError("");
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("date", editForm.date);
    formData.append("description", editForm.description);
    for (const file of editForm.files) {
      formData.append("files", file);
    }

    const result = await uploadWithProgress(`/api/records/${editingRecord.id}`, "PUT", formData, setUploadProgress);
    setLoading(false);
    setUploadProgress(0);
    if (!result.ok) {
      setError((result.data.error as string) ?? "Failed");
      return;
    }
    setEditingRecord(null);
    fetchRecords();
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setLoading(true);
    await fetch(`/api/records/${deletingRecord.id}`, { method: "DELETE" });
    setLoading(false);
    setDeletingRecord(null);
    fetchRecords();
  };

  // Progress bar component
  const ProgressBar = () => {
    if (!loading || uploadProgress === 0) return null;
    return (
      <div className="flex flex-col gap-1 mt-2">
        <div className="w-full h-2 bg-[#1A1F2E] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#28E88E] rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-[#B3B3B3] text-right">{uploadProgress}%</p>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#28E88E]">{t.records.title}</h2>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1A1F2E] border border-white/10 text-white hover:border-white/20 text-lg"
        >
          +
        </button>
      </div>

      {/* Records list */}
      <div className="flex flex-col gap-4">
        {records.length === 0 ? (
          <p className="py-6 text-center text-[#B3B3B3]">No records yet.</p>
        ) : (
          records.map((r) => {
            const firstMedia = r.media_urls?.[0];
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 bg-[#1A1F2E] border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#0D1117] flex items-center justify-center">
                  {firstMedia ? (
                    isVideo(firstMedia) ? (
                      <video src={mediaUrl(firstMedia)} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={mediaUrl(firstMedia)} alt="" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <svg className="w-8 h-8 text-[#B3B3B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#28E88E] font-medium">{formatDate(r.date, locale)}</p>
                  <p className="text-sm text-white/70 mt-1 truncate">{r.description}</p>
                  {r.media_urls && r.media_urls.length > 0 && (
                    <p className="text-xs text-[#B3B3B3] mt-1">{r.media_urls.length} {t.records.media.toLowerCase()}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => openEdit(r)} className="text-[#B3B3B3] hover:text-white" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeletingRecord(r)} className="text-[#B3B3B3] hover:text-red-400" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Record Modal */}
      <Modal open={showAdd} onClose={() => !loading && setShowAdd(false)}>
        <h3 className="text-lg font-semibold mb-4">{t.records.addNew}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.date}</label>
            <input
              type="date"
              value={addForm.date}
              onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.description}</label>
            <textarea
              value={addForm.description}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.media}</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                const files = e.target.files;
                if (files) setAddForm((f) => ({ ...f, files: Array.from(files) }));
              }}
              className="text-sm text-[#B3B3B3] file:mr-3 file:rounded-lg file:border-0 file:bg-[#28E88E]/10 file:px-4 file:py-2 file:text-sm file:text-[#28E88E] file:cursor-pointer hover:file:bg-[#28E88E]/20"
            />
            {addForm.files.length > 0 && (
              <p className="text-xs text-[#B3B3B3] mt-1">{addForm.files.length} file(s) selected</p>
            )}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <ProgressBar />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setShowAdd(false)} disabled={loading} className="text-sm text-[#B3B3B3] hover:text-white disabled:opacity-50">{t.records.cancel}</button>
            <button onClick={handleAdd} disabled={loading} className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50">
              {loading ? `${locale === "zh-TW" ? "上傳中" : "Uploading"}...` : t.records.save}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Record Modal */}
      <Modal open={!!editingRecord} onClose={() => !loading && setEditingRecord(null)}>
        <h3 className="text-lg font-semibold mb-4">{t.admin.edit}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.date}</label>
            <input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.description}</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className={inputClass + " resize-none"}
            />
          </div>
          {/* Existing media preview */}
          {editingRecord && editingRecord.media_urls && editingRecord.media_urls.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-[#B3B3B3]">Current {t.records.media}</label>
              <div className="flex gap-2 flex-wrap">
                {editingRecord.media_urls.map((url, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-[#1A1F2E]">
                    {isVideo(url) ? (
                      <video src={mediaUrl(url)} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={mediaUrl(url)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.records.media} (replace)</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                const files = e.target.files;
                if (files) setEditForm((f) => ({ ...f, files: Array.from(files) }));
              }}
              className="text-sm text-[#B3B3B3] file:mr-3 file:rounded-lg file:border-0 file:bg-[#28E88E]/10 file:px-4 file:py-2 file:text-sm file:text-[#28E88E] file:cursor-pointer hover:file:bg-[#28E88E]/20"
            />
            {editForm.files.length > 0 && (
              <p className="text-xs text-[#B3B3B3] mt-1">{editForm.files.length} file(s) selected</p>
            )}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <ProgressBar />
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setEditingRecord(null)} disabled={loading} className="text-sm text-[#B3B3B3] hover:text-white disabled:opacity-50">{t.records.cancel}</button>
            <button onClick={handleSaveEdit} disabled={loading} className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50">
              {loading ? `${locale === "zh-TW" ? "上傳中" : "Uploading"}...` : t.records.save}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deletingRecord} onClose={() => setDeletingRecord(null)}>
        <h3 className="text-lg font-semibold mb-4">{t.records.delete}</h3>
        <p className="text-[#B3B3B3] text-sm mb-6">{t.admin.confirmDelete}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeletingRecord(null)} className="text-sm text-[#B3B3B3] hover:text-white">{t.records.cancel}</button>
          <button onClick={handleDelete} disabled={loading} className="text-sm text-red-400 font-medium hover:opacity-80 disabled:opacity-50">{t.records.delete}</button>
        </div>
      </Modal>
    </div>
  );
}
