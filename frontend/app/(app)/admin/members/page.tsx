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

type EditForm = {
  email: string;
  password: string;
  referral_source: string;
  price: string;
  isVip: boolean;
  vipDuration: string;
};

type AddMemberForm = {
  email: string;
  password: string;
  referral_source: string;
  price: string;
  isVip: boolean;
  vipDuration: string;
};

const REFERRAL_OPTIONS = ["FACEBOOK", "INSTAGRAM", "THREADS"] as const;
const VIP_DURATIONS = [
  { value: "3", labelKey: "days3" },
  { value: "15", labelKey: "days15" },
  { value: "30", labelKey: "days30" },
  { value: "90", labelKey: "days90" },
  { value: "365", labelKey: "days365" },
] as const;
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

function computeVipExpiry(days: string): string {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toISOString();
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

/* Eye icon SVGs */
const EyeOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeClosed = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white"
      >
        {show ? <EyeOpen /> : <EyeClosed />}
      </button>
    </div>
  );
}

export default function MembersPage() {
  const { t, locale } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [vipFilter, setVipFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddMemberForm>({ email: "", password: "", referral_source: "", price: "", isVip: false, vipDuration: "30" });
  const [editingMember, setEditingMember] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ email: "", password: "", referral_source: "", price: "", isVip: false, vipDuration: "30" });
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const members = useMemo(() => users.filter((u) => u.role === "member"), [users]);

  const filtered = useMemo(() => {
    let list = members;
    if (vipFilter) {
      list = list.filter((u) => u.vip_expiry_date && daysUntil(u.vip_expiry_date) != null);
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.referral_source && u.referral_source.toLowerCase().includes(q))
    );
  }, [members, search, vipFilter]);

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
        price: addForm.price ? Number(addForm.price) : undefined,
        vip_expiry_date: addForm.isVip ? computeVipExpiry(addForm.vipDuration) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    setShowAdd(false);
    setAddForm({ email: "", password: "", referral_source: "", price: "", isVip: false, vipDuration: "30" });
    fetchUsers();
  };

  const openEdit = (u: UserRow) => {
    const remaining = u.vip_expiry_date ? daysUntil(u.vip_expiry_date) : null;
    const hasVip = remaining != null;
    // Find closest matching duration option
    const durations = [3, 15, 30, 90, 365];
    const closestDuration = hasVip
      ? String(durations.reduce((prev, curr) => Math.abs(curr - remaining!) < Math.abs(prev - remaining!) ? curr : prev))
      : "30";
    setEditingMember(u);
    setEditForm({
      email: u.email,
      password: "",
      referral_source: u.referral_source ?? "",
      price: u.price != null ? String(u.price) : "",
      isVip: hasVip,
      vipDuration: closestDuration,
    });
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    setError("");
    setLoading(true);

    const body: Record<string, unknown> = {};
    if (editForm.email && editForm.email !== editingMember.email) body.email = editForm.email;
    if (editForm.password) body.password = editForm.password;
    if (editForm.referral_source !== (editingMember.referral_source ?? "")) body.referral_source = editForm.referral_source || null;
    if (editForm.price !== (editingMember.price != null ? String(editingMember.price) : ""))
      body.price = editForm.price ? Number(editForm.price) : null;

    // VIP: if checkbox is on, set expiry from duration; if off, clear it
    const hadVip = editingMember.vip_expiry_date && daysUntil(editingMember.vip_expiry_date) != null;
    if (editForm.isVip && !hadVip) {
      body.vip_expiry_date = computeVipExpiry(editForm.vipDuration);
    } else if (editForm.isVip && hadVip) {
      // Only update if duration was explicitly changed (re-send new expiry)
      body.vip_expiry_date = computeVipExpiry(editForm.vipDuration);
    } else if (!editForm.isVip && hadVip) {
      body.vip_expiry_date = null;
    }

    const res = await fetch(`/api/users/${editingMember.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    setEditingMember(null);
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

  // Type helper for duration label keys
  const durationLabel = (key: string) => t.admin[key as keyof typeof t.admin] ?? key;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#28E88E]">{t.admin.members}</h2>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1A1F2E] border border-white/10 text-white hover:border-white/20 text-lg"
        >
          +
        </button>
      </div>

      {/* Search + VIP filter */}
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
        <button
          onClick={() => { setVipFilter((v) => !v); setPage(1); }}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition border ${
            vipFilter
              ? "bg-[#28E88E] text-[#020308] border-[#28E88E]"
              : "bg-[#1A1F2E] text-[#B3B3B3] border-white/10 hover:border-white/20"
          }`}
        >
          {t.admin.vip}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#B3B3B3] border-b border-white/10">
              <th className="text-left py-3 pr-4 font-medium">{t.admin.email}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.vipExpiry}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.referralSource}</th>
              <th className="text-left py-3 pr-4 font-medium">{t.admin.createdAt}</th>
              <th className="text-left py-3 font-medium">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#B3B3B3]">
                  {t.admin.noMembers}
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
                    <td className="py-3 pr-4 text-[#B3B3B3]">{formatDate(u.created_at, locale)}</td>
                    <td className="py-3 flex items-center gap-3">
                      <button onClick={() => openEdit(u)} className="text-[#B3B3B3] hover:text-white" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeletingUser(u)} className="text-[#B3B3B3] hover:text-red-400" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
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

      {/* ═══ Add Member Modal ═══ */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 className="text-lg font-semibold mb-4">{t.admin.add}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.email}</label>
            <input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.password}</label>
            <PasswordInput value={addForm.password} onChange={(v) => setAddForm((f) => ({ ...f, password: v }))} className={inputClass + " pr-10"} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.auth.referralSource}</label>
            <select value={addForm.referral_source} onChange={(e) => setAddForm((f) => ({ ...f, referral_source: e.target.value }))} className={inputClass}>
              <option value="">{t.auth.referralSource}</option>
              {REFERRAL_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.price}</label>
            <input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} />
          </div>

          {/* VIP checkbox + duration */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.isVip}
                onChange={(e) => setAddForm((f) => ({ ...f, isVip: e.target.checked }))}
                className="w-4 h-4 accent-[#28E88E]"
              />
              <span className="text-sm text-white">{t.admin.setVip}</span>
            </label>
          </div>
          {addForm.isVip && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-[#B3B3B3]">{t.admin.vipDuration}</label>
              <select value={addForm.vipDuration} onChange={(e) => setAddForm((f) => ({ ...f, vipDuration: e.target.value }))} className={inputClass}>
                {VIP_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{durationLabel(d.labelKey)}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setShowAdd(false)} className="text-sm text-[#B3B3B3] hover:text-white">{t.admin.cancel}</button>
            <button onClick={handleAdd} disabled={loading} className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50">{t.admin.save}</button>
          </div>
        </div>
      </Modal>

      {/* ═══ Edit Member Modal ═══ */}
      <Modal open={!!editingMember} onClose={() => setEditingMember(null)}>
        <h3 className="text-lg font-semibold mb-4">{t.admin.edit}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.email}</label>
            <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.password}</label>
            <PasswordInput value={editForm.password} onChange={(v) => setEditForm((f) => ({ ...f, password: v }))} placeholder="••••••••" className={inputClass + " pr-10"} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.auth.referralSource}</label>
            <select value={editForm.referral_source} onChange={(e) => setEditForm((f) => ({ ...f, referral_source: e.target.value }))} className={inputClass}>
              <option value="">{t.auth.referralSource}</option>
              {REFERRAL_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B3B3B3]">{t.admin.price}</label>
            <input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} />
          </div>

          {/* VIP checkbox + duration */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isVip}
                onChange={(e) => setEditForm((f) => ({ ...f, isVip: e.target.checked }))}
                className="w-4 h-4 accent-[#28E88E]"
              />
              <span className="text-sm text-white">{t.admin.setVip}</span>
            </label>
          </div>
          {editForm.isVip && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-[#B3B3B3]">{t.admin.vipDuration}</label>
              <select value={editForm.vipDuration} onChange={(e) => setEditForm((f) => ({ ...f, vipDuration: e.target.value }))} className={inputClass}>
                {VIP_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{durationLabel(d.labelKey)}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setEditingMember(null)} className="text-sm text-[#B3B3B3] hover:text-white">{t.admin.cancel}</button>
            <button onClick={handleSaveEdit} disabled={loading} className="text-sm text-[#28E88E] font-medium hover:opacity-80 disabled:opacity-50">{t.admin.save}</button>
          </div>
        </div>
      </Modal>

      {/* ═══ Delete Confirm Modal ═══ */}
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
