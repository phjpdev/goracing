"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

type UserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  referral_source: string | null;
  vip_expiry_date: string | null;
  age_range: string | null;
  price: number | null;
  created_at: string;
};

type AddMemberForm = {
  email: string;
  password: string;
  referral_source: string;
};

const REFERRAL_OPTIONS = ["FACEBOOK", "INSTAGRAM", "THREADS"] as const;
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

function daysUntil(iso: string): number | null {
  const now = new Date();
  const target = new Date(iso);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  labels,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  labels: { previous: string; next: string; page: string };
}) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg bg-[#1A1F2E] border border-white/10 text-white disabled:opacity-30 hover:border-white/20"
      >
        {labels.previous}
      </button>
      <span className="text-[#B3B3B3]">
        {labels.page} {page}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg bg-[#1A1F2E] border border-white/10 text-white disabled:opacity-30 hover:border-white/20"
      >
        {labels.next}
      </button>
    </div>
  );
}

export default function SubadminDashboard() {
  const { t, locale } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddMemberForm>({ email: "", password: "", referral_source: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.referral_source && u.referral_source.toLowerCase().includes(q))
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const inputClass =
    "w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#28E88E]/50";

  const handleAdd = async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: addForm.email.trim(),
        password: addForm.password,
        role: "member",
        referral_source: addForm.referral_source || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    setShowAdd(false);
    setAddForm({ email: "", password: "", referral_source: "" });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-[#020308] text-white p-6 sm:p-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#28E88E]">{t.subadmin.members}</h2>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1A1F2E] border border-white/10 text-white hover:border-white/20 text-lg"
        >
          +
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t.admin.searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-[#666] outline-none focus:border-[#28E88E]/50"
          />
        </div>
      </div>

      {/* Members table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#B3B3B3] border-b border-white/10">
              <th className="text-left py-3 pr-4 font-medium">{t.admin.email}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.vipExpiry}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.referralSource}</th>
              <th className="text-left py-3 font-medium">{t.admin.createdAt}</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#B3B3B3]">
                  {t.subadmin.noMembers}
                </td>
              </tr>
            ) : (
              paged.map((u) => {
                const days = u.vip_expiry_date ? daysUntil(u.vip_expiry_date) : null;
                return (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white">{u.email}</td>
                    <td className="py-3 pr-4">
                      {days != null ? (
                        <span className="inline-block bg-[#28E88E] text-[#020308] text-xs font-bold px-2.5 py-1 rounded-md">
                          {days}{t.admin.daysLeft}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-white">{u.referral_source ?? ""}</td>
                    <td className="py-3 text-[#B3B3B3]">{formatDate(u.created_at, locale)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        labels={{ previous: t.admin.previous, next: t.admin.next, page: t.admin.page }}
      />

      {/* Add Member Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 className="text-lg font-semibold mb-4">{t.subadmin.addMember}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.email}</label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.password}</label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.referralSource}</label>
            <select
              value={addForm.referral_source}
              onChange={(e) => setAddForm((f) => ({ ...f, referral_source: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t.admin.referralSource}</option>
              {REFERRAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setShowAdd(false)} className="text-sm text-[#B3B3B3] hover:text-white">
              {t.admin.cancel}
            </button>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50"
            >
              {t.admin.save}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
