"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const MONTH_NAMES = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#6366f1", "#14b8a6", "#fb923c",
];

type MonthlyData = {
  month: number;
  uzsIncome: number;
  uzsExpense: number;
  usdIncome: number;
  usdExpense: number;
};

type CategoryData = Record<string, { uzs: number; usd: number }>;

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryData>({});
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"UZS" | "USD">("UZS");
  const [year] = useState(new Date().getFullYear());

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch(`/api/analytics?year=${year}`);
    const data = await res.json();
    setMonthly(data.monthly);
    setCategoryExpenses(data.categoryExpenses);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = monthly.map((m) => ({
    name: MONTH_NAMES[m.month - 1],
    Kirim: currency === "UZS" ? m.uzsIncome : m.usdIncome,
    Chiqim: currency === "UZS" ? m.uzsExpense : m.usdExpense,
    Balans: currency === "UZS"
      ? m.uzsIncome - m.uzsExpense
      : m.usdIncome - m.usdExpense,
  }));

  const pieData = Object.entries(categoryExpenses)
    .map(([name, val]) => ({
      name,
      value: currency === "UZS" ? val.uzs : val.usd,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalIncome = monthly.reduce((s, m) => s + (currency === "UZS" ? m.uzsIncome : m.usdIncome), 0);
  const totalExpense = monthly.reduce((s, m) => s + (currency === "UZS" ? m.uzsExpense : m.usdExpense), 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  function formatValue(v: unknown) {
  const num = Number(v) || 0;
  return currency === "UZS"
    ? `${(num / 1000000).toFixed(1)}M`
    : `$${num.toLocaleString()}`;
}

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "4rem", color: "#94a3b8" }}>
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Moliyaviy tahlil
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {year} yil statistikasi
          </p>
        </div>

        {/* Currency toggle */}
        <div style={{
          display: "flex",
          background: "#f8fafc",
          borderRadius: "0.75rem",
          padding: "0.25rem",
          border: "1px solid #e2e8f0",
        }}>
          {(["UZS", "USD"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "0.625rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: currency === c ? "white" : "transparent",
                color: currency === c ? "#0f172a" : "#94a3b8",
                boxShadow: currency === c ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Yillik summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Yillik kirim", value: formatValue(totalIncome), color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Yillik chiqim", value: formatValue(totalExpense), color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
          { label: "Yillik balans", value: formatValue(totalIncome - totalExpense), color: totalIncome >= totalExpense ? "#10b981" : "#ef4444", bg: "#f8fafc", border: "#e2e8f0" },
          { label: "Tejash darajasi", value: `${savingsRate}%`, color: savingsRate >= 20 ? "#10b981" : savingsRate >= 0 ? "#f59e0b" : "#ef4444", bg: "#fffbeb", border: "#fde68a" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: stat.bg,
            borderRadius: "1rem",
            padding: "1.25rem",
            border: `1px solid ${stat.border}`,
          }}>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>{stat.label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 800, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Area chart — oylik trend */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
      }}>
        <h2 style={{ fontWeight: 600, color: "#0f172a", marginBottom: "1.5rem" }}>
          Oylik kirim va chiqim
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorChiqim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={formatValue} />
            <Tooltip
              formatter={(value) => [formatValue(value)]}
              contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}
            />
            <Area type="monotone" dataKey="Kirim" stroke="#10b981" strokeWidth={2} fill="url(#colorKirim)" />
            <Area type="monotone" dataKey="Chiqim" stroke="#ef4444" strokeWidth={2} fill="url(#colorChiqim)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>

        {/* Bar chart */}
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e2e8f0",
        }}>
          <h2 style={{ fontWeight: 600, color: "#0f172a", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Oylik balans
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={formatValue} />
              <Tooltip
                formatter={(value) => [formatValue(value)]}
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.75rem" }}
              />
              <Bar dataKey="Balans" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.Balans >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e2e8f0",
        }}>
          <h2 style={{ fontWeight: 600, color: "#0f172a", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Bu oy xarajatlar (kategoriya)
          </h2>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.875rem" }}>
              Ma'lumot yo'q
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatValue(value)]}
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.75rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Kategoriya breakdown */}
      {pieData.length > 0 && (
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e2e8f0",
        }}>
          <h2 style={{ fontWeight: 600, color: "#0f172a", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
            Xarajatlar taqsimoti (bu oy)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pieData.slice(0, 8).map((item, i) => {
              const total = pieData.reduce((s, d) => s + d.value, 0);
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: COLORS[i % COLORS.length] }}>
                      {formatValue(item.value)} ({percent}%)
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${percent}%`,
                      background: COLORS[i % COLORS.length],
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}