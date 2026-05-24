import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthTxs = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );

  const recentTxs = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(5);

  // UZS statistika
  const uzsIncome = monthTxs.filter((t) => t.type === "income" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);
  const uzsExpense = monthTxs.filter((t) => t.type === "expense" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);

  // USD statistika
  const usdIncome = monthTxs.filter((t) => t.type === "income" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);
  const usdExpense = monthTxs.filter((t) => t.type === "expense" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);

  const MONTH_NAMES = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
          Salom, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {MONTH_NAMES[now.getMonth()]} {now.getFullYear()} — moliyaviy ko'rinish
        </p>
      </div>

      {/* UZS kartalar */}
      <div>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          So'm (UZS)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Kirim", value: uzsIncome, suffix: " so'm", icon: ArrowUpCircle, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", prefix: "+" },
            { label: "Chiqim", value: uzsExpense, suffix: " so'm", icon: ArrowDownCircle, color: "#ef4444", bg: "#fef2f2", border: "#fecaca", prefix: "-" },
            { label: "Balans", value: uzsIncome - uzsExpense, suffix: " so'm", icon: Wallet, color: uzsIncome >= uzsExpense ? "#10b981" : "#ef4444", bg: uzsIncome >= uzsExpense ? "#f0fdf4" : "#fef2f2", border: uzsIncome >= uzsExpense ? "#bbf7d0" : "#fecaca", prefix: "" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: "1rem",
              padding: "1.25rem",
              border: `1px solid ${stat.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</p>
                <stat.icon size={18} color={stat.color} />
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>
                {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* USD kartalar */}
      <div>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          Dollar (USD)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Kirim", value: usdIncome, icon: ArrowUpCircle, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", prefix: "+$" },
            { label: "Chiqim", value: usdExpense, icon: ArrowDownCircle, color: "#ef4444", bg: "#fef2f2", border: "#fecaca", prefix: "-$" },
            { label: "Balans", value: usdIncome - usdExpense, icon: Wallet, color: usdIncome >= usdExpense ? "#10b981" : "#ef4444", bg: usdIncome >= usdExpense ? "#f0fdf4" : "#fef2f2", border: usdIncome >= usdExpense ? "#bbf7d0" : "#fecaca", prefix: "$" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: "1rem",
              padding: "1.25rem",
              border: `1px solid ${stat.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</p>
                <stat.icon size={18} color={stat.color} />
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>
                {stat.prefix}{stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* So'nggi tranzaksiyalar */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #f1f5f9",
        }}>
          <h2 style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>
            So'nggi tranzaksiyalar
          </h2>
          <Link href="/dashboard/transactions" style={{
            fontSize: "0.8rem",
            color: "#10b981",
            textDecoration: "none",
            fontWeight: 500,
          }}>
            Hammasini ko'rish →
          </Link>
        </div>

        {recentTxs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            <p style={{ fontSize: "0.875rem" }}>Hali tranzaksiya yo'q</p>
            <Link href="/dashboard/transactions" style={{
              display: "inline-block",
              marginTop: "0.75rem",
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #10b981, #3b82f6)",
              color: "white",
              borderRadius: "0.625rem",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}>
              Birinchi tranzaksiya qo'shish
            </Link>
          </div>
        ) : (
          recentTxs.map((tx, i) => (
            <div key={tx.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.875rem 1.5rem",
              borderBottom: i < recentTxs.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: tx.type === "income" ? "#f0fdf4" : "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {tx.type === "income"
                  ? <ArrowUpCircle size={18} color="#10b981" />
                  : <ArrowDownCircle size={18} color="#ef4444" />
                }
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0f172a" }}>
                  {tx.category}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {new Date(tx.date!).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}
                  {tx.description && ` · ${tx.description}`}
                </p>
              </div>
              <p style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: tx.type === "income" ? "#10b981" : "#ef4444",
              }}>
                {tx.type === "income" ? "+" : "-"}
                {tx.currency === "USD" ? "$" : ""}
                {tx.amount.toLocaleString()}
                {tx.currency === "UZS" ? " so'm" : ""}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {[
          { href: "/dashboard/transactions", label: "Tranzaksiya qo'shish", icon: "💳", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { href: "/dashboard/analytics", label: "Tahlilni ko'rish", icon: "📊", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          { href: "/dashboard/budgets", label: "Budjeti boshqarish", icon: "🎯", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
        ].map((link) => (
          <Link key={link.href} href={link.href} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            padding: "1.25rem",
            background: link.bg,
            borderRadius: "1rem",
            border: `1px solid ${link.border}`,
            textDecoration: "none",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "1.5rem" }}>{link.icon}</span>
            <p style={{ fontWeight: 600, color: link.color, fontSize: "0.875rem" }}>
              {link.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}