"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Check, Target, AlertTriangle } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Oziq-ovqat", "Transport", "Uy-joy", "Sog'liqni saqlash",
  "Ta'lim", "Kiyim", "Ko'ngilochar", "Kommunal",
  "Internet", "Telefon", "Boshqa xarajat",
];

type Budget = {
  id: string;
  category: string;
  limitAmount: number;
  currency: string;
  month: number;
  year: number;
  spent: number;
  remaining: number;
};

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

function formatAmount(amount: number, currency: string) {
  if (currency === "USD") return `$${amount.toLocaleString()}`;
  return `${amount.toLocaleString()} so'm`;
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [budgetList, setBudgetList] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: "",
    limitAmount: "",
    currency: "UZS",
  });

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
    const data = await res.json();
    setBudgetList(data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpen = (budget?: Budget) => {
    if (budget) {
      setEditing(budget);
      setForm({
        category: budget.category,
        limitAmount: String(budget.limitAmount),
        currency: budget.currency,
      });
    } else {
      setEditing(null);
      setForm({ category: "", limitAmount: "", currency: "UZS" });
    }
    setError("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ category: "", limitAmount: "", currency: "UZS" });
    setError("");
  };

  const handleSave = async () => {
    if (!form.category || !form.limitAmount) return;
    setSaving(true);
    setError("");

    try {
      if (editing) {
        const res = await fetch(`/api/budgets/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limitAmount: Number(form.limitAmount) }),
        });
        const updated = await res.json();
        setBudgetList(budgetList.map((b) =>
          b.id === updated.id ? { ...b, limitAmount: updated.limitAmount, remaining: updated.limitAmount - b.spent } : b
        ));
      } else {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            limitAmount: Number(form.limitAmount),
            month,
            year,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          return;
        }
        await fetchBudgets();
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Budgetni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    setBudgetList(budgetList.filter((b) => b.id !== id));
  };

  const totalLimit = budgetList.reduce((s, b) => {
    if (b.currency === "UZS") return { ...s, uzs: s.uzs + b.limitAmount };
    return { ...s, usd: s.usd + b.limitAmount };
  }, { uzs: 0, usd: 0 });

  const totalSpent = budgetList.reduce((s, b) => {
    if (b.currency === "UZS") return { ...s, uzs: s.uzs + b.spent };
    return { ...s, usd: s.usd + b.spent };
  }, { uzs: 0, usd: 0 });

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Budjetlar
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Xarajat limitlarini belgilang
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Oy tanlash */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={{ ...INPUT_STYLE, width: "auto" }}
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>

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
            Budget qo'shish
          </button>
        </div>
      </div>

      {/* Umumiy statistika */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "UZS Jami limit", value: formatAmount(totalLimit.uzs, "UZS"), color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "UZS Sarflandi", value: formatAmount(totalSpent.uzs, "UZS"), color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          { label: "UZS Qoldi", value: formatAmount(totalLimit.uzs - totalSpent.uzs, "UZS"), color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "USD Jami limit", value: formatAmount(totalLimit.usd, "USD"), color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "USD Sarflandi", value: formatAmount(totalSpent.usd, "USD"), color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          { label: "USD Qoldi", value: formatAmount(totalLimit.usd - totalSpent.usd, "USD"), color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: stat.bg,
            borderRadius: "1rem",
            padding: "1rem",
            border: `1px solid ${stat.border}`,
          }}>
            <p style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.375rem" }}>{stat.label}</p>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Budget kartalar */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          Yuklanmoqda...
        </div>
      ) : budgetList.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          background: "white",
          borderRadius: "1rem",
          border: "1px solid #e2e8f0",
          color: "#94a3b8",
        }}>
          <Target size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ fontWeight: 500 }}>Budget belgilanmagan</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Kategoriyalar uchun limit qo'shing
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {budgetList.map((budget) => {
            const percent = Math.min(Math.round((budget.spent / budget.limitAmount) * 100), 100);
            const isOver = budget.spent > budget.limitAmount;
            const isWarning = percent >= 80 && !isOver;

            return (
              <div key={budget.id} style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.25rem",
                border: `1px solid ${isOver ? "#fecaca" : isWarning ? "#fde68a" : "#e2e8f0"}`,
                boxShadow: isOver ? "0 0 0 1px #fecaca" : "none",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
                        {budget.category}
                      </p>
                      {isOver && <AlertTriangle size={14} color="#ef4444" />}
                      {isWarning && <AlertTriangle size={14} color="#f59e0b" />}
                    </div>
                    <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.125rem" }}>
                      {MONTH_NAMES[budget.month - 1]} {budget.year} · {budget.currency}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button
                      onClick={() => handleOpen(budget)}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        padding: "0.25rem",
                        cursor: "pointer",
                        display: "flex",
                        color: "#64748b",
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "0.5rem",
                        padding: "0.25rem",
                        cursor: "pointer",
                        display: "flex",
                        color: "#ef4444",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${percent}%`,
                      background: isOver ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981",
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.375rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {percent}% ishlatildi
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: isOver ? "#ef4444" : "#10b981",
                    }}>
                      {isOver ? "Limit oshib ketdi!" : `${formatAmount(budget.remaining, budget.currency)} qoldi`}
                    </span>
                  </div>
                </div>

                {/* Amount info */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  background: "#f8fafc",
                  borderRadius: "0.75rem",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "0.125rem" }}>Limit</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                      {formatAmount(budget.limitAmount, budget.currency)}
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "0.125rem" }}>Sarflandi</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: isOver ? "#ef4444" : "#374151" }}>
                      {formatAmount(budget.spent, budget.currency)}
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "0.125rem" }}>Qoldi</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: isOver ? "#ef4444" : "#10b981" }}>
                      {formatAmount(Math.abs(budget.remaining), budget.currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
            maxWidth: "420px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, color: "#0f172a" }}>
                {editing ? "Budgetni tahrirlash" : "Yangi budget"}
              </h2>
              <button
                onClick={handleClose}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.375rem", cursor: "pointer", display: "flex" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Kategoriya */}
              {!editing && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.5rem" }}>
                    Kategoriya *
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {EXPENSE_CATEGORIES.map((cat) => (
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
              )}

              {/* Limit + Valyuta */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                    Limit *
                  </label>
                  <input
                    type="number"
                    value={form.limitAmount}
                    onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                    placeholder="1,000,000"
                    style={INPUT_STYLE}
                  />
                </div>
                {!editing && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#64748b", marginBottom: "0.375rem" }}>
                      Valyuta
                    </label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      style={{ ...INPUT_STYLE, width: "90px" }}
                    >
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: "#dc2626",
                }}>
                  {error}
                </div>
              )}

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
                  disabled={saving || !form.limitAmount || (!editing && !form.category)}
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