"use client";

import { useEffect, useState, useCallback } from "react";
import { Transaction } from "@/lib/schema";
import {
  Plus, Trash2, Pencil, X, Check,
  ArrowUpCircle, ArrowDownCircle, Search,
} from "lucide-react";

const INCOME_CATEGORIES = [
  "Maosh", "Freelance", "Biznes", "Investitsiya",
  "Sovg'a", "Ijara", "Boshqa kirim",
];

const EXPENSE_CATEGORIES = [
  "Oziq-ovqat", "Transport", "Uy-joy", "Sog'liqni saqlash",
  "Ta'lim", "Kiyim", "Ko'ngilochar", "Kommunal",
  "Internet", "Telefon", "Boshqa xarajat",
];

const CURRENCIES = ["UZS", "USD"];

const EMPTY_FORM = {
  type: "expense" as "income" | "expense",
  amount: "",
  currency: "UZS",
  category: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

function formatAmount(amount: number, currency: string) {
  if (currency === "USD") {
    return `$${amount.toLocaleString()}`;
  }
  return `${amount.toLocaleString()} so'm`;
}

export default function TransactionsPage() {
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCurrency, setFilterCurrency] = useState("all");

  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const fetchTransactions = useCallback(async () => {
    const res = await fetch(`/api/transactions?month=${month}&year=${year}`);
    const data = await res.json();
    setTxList(data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchTransactionsns();
  }, [fetchTransactions]);

  const handleOpen = (tx?: Transaction) => {
    if (tx) {
      setEditing(tx);
      setForm({
        type: tx.type,
        amount: String(tx.amount),
        currency: tx.currency,
        category: tx.category,
        description: tx.description || "",
        date: new Date(tx.date!).toISOString().split("T")[0],
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.amount || !form.category) return;
    setSaving(true);

    try {
      const payload = { ...form, amount: Number(form.amount) };

      if (editing) {
        const res = await fetch(`/api/transactions/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setTxList(txList.map((t) => t.id === updated.id ? updated : t));
      } else {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setTxList([created, ...txList]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTxList(txList.filter((t) => t.id !== id));
  };

  // Statistika
  const uzsIncome = txList.filter((t) => t.type === "income" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);
  const uzsExpense = txList.filter((t) => t.type === "expense" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);
  const usdIncome = txList.filter((t) => t.type === "income" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);
  const usdExpense = txList.filter((t) => t.type === "expense" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);

  // Filter
  const filtered = txList.filter((t) => {
    const matchSearch = t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchCurrency = filterCurrency === "all" || t.currency === filterCurrency;
    return matchSearch && matchType && matchCurrency;
  });

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid #e2e8f0",
    borderRadius: "0.625rem",
    fontSize: "0.875rem",
    outline: "none",
    color: "#0f172a",
    background: "white",
  };

  const MONTH_NAMES = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Tranzaksiyalar
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <button
          onClick={() => handleOpen()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            background: "linear-gradient(135deg, #10b981, #3b82f6)",
            color: "white",
            border: "none",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}
        >
          <Plus size={16} />
          Qo'shish
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "UZS Kirim", value: `+${uzsIncome.toLocaleString()} so'm`, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "UZS Chiqim", value: `-${uzsExpense.toLocaleString()} so'm`, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          { label: "UZS Balans", value: `${(uzsIncome - uzsExpense).toLocaleString()} so'm`, color: uzsIncome >= uzsExpense ? "#10b981" : "#ef4444", bg: "#f8fafc", border: "#e2e8f0" },
          { label: "USD Kirim", value: `+$${usdIncome.toLocaleString()}`, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "USD Chiqim", value: `-$${usdExpense.toLocaleString()}`, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          { label: "USD Balans", value: `$${(usdIncome - usdExpense).toLocaleString()}`, color: usdIncome >= usdExpense ? "#10b981" : "#ef4444", bg: "#f8fafc", border: "#e2e8f0" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: stat.bg,
            borderRadius: "1rem",
            padding: "1.25rem",
            border: `1px solid ${stat.border}`,
          }}>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.375rem" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...INPUT_STYLE, paddingLeft: "2.5rem" }}
          />
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {[
            { key: "all", label: "Hammasi" },
            { key: "income", label: "💚 Kirim" },
            { key: "expense", label: "❤️ Chiqim" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              style={{
                padding: "0.5rem 0.875rem",
                borderRadius: "999px",
                border: "1px solid",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 500,
                background: filterType === f.key ? "#0f172a" : "white",
                color: filterType === f.key ? "white" : "#64748b",
                borderColor: filterType === f.key ? "#0f172a" : "#e2e8f0",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Currency filter */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {["all", "UZS", "USD"].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCurrency(c)}
              style={{
                padding: "0.5rem 0.875rem",
                borderRadius: "999px",
                border: "1px solid",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 500,
                background: filterCurrency === c ? "#3b82f6" : "white",
                color: filterCurrency === c ? "white" : "#64748b",
                borderColor: filterCurrency === c ? "#3b82f6" : "#e2e8f0",
              }}
            >
              {c === "all" ? "Barcha valyuta" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Jadval */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <ArrowDownCircle size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p>Tranzaksiya topilmadi</p>
          </div>
        ) : (
          <div>
            {filtered.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: tx.type === "income" ? "#f0fdf4" : "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {tx.type === "income"
                    ? <ArrowUpCircle size={20} color="#10b981" />
                    : <ArrowDownCircle size={20} color="#ef4444" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>
                    {tx.category}
                  </p>
                  {tx.description && (
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.125rem" }}>
                      {tx.description}
                    </p>
                  )}
                </div>

                {/* Date */}
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(tx.date!).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}
                </p>

                {/* Currency badge */}
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "999px",
                  background: tx.currency === "USD" ? "#eff6ff" : "#fafafa",
                  color: tx.currency === "USD" ? "#3b82f6" : "#64748b",
                  border: `1px solid ${tx.currency === "USD" ? "#bfdbfe" : "#e2e8f0"}`,
                }}>
                  {tx.currency}
                </span>

                {/* Amount */}
                <p style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: tx.type === "income" ? "#10b981" : "#ef4444",
                  whiteSpace: "nowrap",
                }}>
                  {tx.type === "income" ? "+" : "-"}
                  {formatAmount(tx.amount, tx.currency)}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() => handleOpen(tx)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      padding: "0.375rem",
                      cursor: "pointer",
                      display: "flex",
                      color: "#64748b",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "0.5rem",
                      padding: "0.375rem",
                      cursor: "pointer",
                      display: "flex",
                      color: "#ef4444",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, color: "#0f172a" }}>
                {editing ? "Tahrirlash" : "Yangi tranzaksiya"}
              </h2>
              <button
                onClick={handleClose}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.375rem", cursor: "pointer", display: "flex" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t, category: "" })}
                    style={{
                      padding: "0.625rem",
                      borderRadius: "0.75rem",
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: form.type === t
                        ? t === "income" ? "#f0fdf4" : "#fef2f2"
                        : "#f8fafc",
                      color: form.type === t
                        ? t === "income" ? "#10b981" : "#ef4444"
                        : "#94a3b8",
                      borderColor: form.type === t
                        ? t === "income" ? "#bbf7d0" : "#fecaca"
                        : "#e2e8f0",
                    }}
                  >
                    {t === "income" ? "💚 Kirim" : "❤️ Chiqim"}
                  </button>
                ))}
              </div>

              {/* Amount + Currency */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                    Summa *
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                    Valyuta
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    style={{ ...INPUT_STYLE, width: "90px" }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.5rem" }}>
                  Kategoriya *
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                        border: "1px solid",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background: form.category === cat ? "#0f172a" : "white",
                        color: form.category === cat ? "white" : "#64748b",
                        borderColor: form.category === cat ? "#0f172a" : "#e2e8f0",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                  Izoh (ixtiyoriy)
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Qo'shimcha ma'lumot..."
                  style={INPUT_STYLE}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                  Sana
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={INPUT_STYLE}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Bekor
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.amount || !form.category}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: saving ? "#86efac" : "linear-gradient(135deg, #10b981, #3b82f6)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  <Check size={16} />
                  {saving ? "Saqlanmoqda..." : editing ? "Yangilash" : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}