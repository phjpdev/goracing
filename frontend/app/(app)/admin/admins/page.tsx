"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

type UserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

type AddAdminForm = {
  email: string;
  password: string;
  role: "admin" | "subadmin";
};

const ROWS_PER_PAGE = 10;

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

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#0D1117] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminsPage() {
  const { t, locale } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddAdminForm>({ email: "", password: "", role: "subadmin" });
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const admins = useMemo(
    () => users.filter((u) => u.role === "admin" || u.role === "subadmin"),
    [users]
  );

  const totalPages = Math.max(1, Math.ceil(admins.length / ROWS_PER_PAGE));
  const paged = admins.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const inputClass =
    "w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#28E88E]/50";

  const [showPw, setShowPw] = useState(false);

  const handleAdd = async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: addForm.email.trim(),
        password: addForm.password,
        role: addForm.role,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    setShowAdd(false);
    setAddForm({ email: "", password: "", role: "subadmin" });
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setLoading(true);
    await fetch(`/api/users/${deletingUser.id}`, { method: "DELETE" });
    setLoading(false);
    setDeletingUser(null);
    fetchUsers();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#28E88E]">{t.admin.admins}</h2>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1A1F2E] border border-white/10 text-white hover:border-white/20 text-lg"
        >
          +
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#B3B3B3] border-b border-white/10">
              <th className="text-left py-3 pr-4 font-medium">{t.admin.email}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.role}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.createdAt}</th>
              <th className="text-left py-3 font-medium">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#B3B3B3]">
                  {t.admin.noAdmins}
                </td>
              </tr>
            ) : (
              paged.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-white">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-block bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#B3B3B3]">{formatDate(u.created_at, locale)}</td>
                  <td className="py-3">
                    <button onClick={() => setDeletingUser(u)} className="text-[#B3B3B3] hover:text-red-400" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg bg-[#1A1F2E] border border-white/10 text-white disabled:opacity-30 hover:border-white/20"
        >
          {t.admin.previous}
        </button>
        <span className="text-[#B3B3B3]">{t.admin.page} {page}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-[#1A1F2E] border border-white/10 text-white disabled:opacity-30 hover:border-white/20"
        >
          {t.admin.next}
        </button>
      </div>

      {/* Add Admin Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 className="text-lg font-semibold mb-4">{t.admin.add}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.email}</label>
            <input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.password}</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} className={inputClass + " pr-10"} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white">
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.role}</label>
            <select value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value as "admin" | "subadmin" }))} className={inputClass}>
              <option value="subadmin">Subadmin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setShowAdd(false)} className="text-sm text-[#B3B3B3] hover:text-white">{t.admin.cancel}</button>
            <button onClick={handleAdd} disabled={loading} className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50">{t.admin.save}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deletingUser} onClose={() => setDeletingUser(null)}>
        <h3 className="text-lg font-semibold mb-4">{t.admin.delete}</h3>
        <p className="text-[#B3B3B3] text-sm mb-6">{t.admin.confirmDelete}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeletingUser(null)} className="text-sm text-[#B3B3B3] hover:text-white">{t.admin.cancel}</button>
          <button onClick={handleDelete} disabled={loading} className="text-sm text-red-400 font-medium hover:opacity-80 disabled:opacity-50">{t.admin.delete}</button>
        </div>
      </Modal>
    </div>
  );
}
