import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());

  // So'nggi 6 oy uchun ma'lumot
  const results = [];
  for (let m = 1; m <= 12; m++) {
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    const txs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          gte(transactions.date, start),
          lte(transactions.date, end)
        )
      );

    const uzsIncome = txs.filter((t) => t.type === "income" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);
    const uzsExpense = txs.filter((t) => t.type === "expense" && t.currency === "UZS").reduce((s, t) => s + t.amount, 0);
    const usdIncome = txs.filter((t) => t.type === "income" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);
    const usdExpense = txs.filter((t) => t.type === "expense" && t.currency === "USD").reduce((s, t) => s + t.amount, 0);

    results.push({ month: m, uzsIncome, uzsExpense, usdIncome, usdExpense });
  }

  // Kategoriya bo'yicha (joriy oy)
  const nowStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const nowEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

  const currentMonthTxs = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        gte(transactions.date, nowStart),
        lte(transactions.date, nowEnd)
      )
    );

  const categoryData: Record<string, { uzs: number; usd: number }> = {};
  currentMonthTxs
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryData[t.category]) categoryData[t.category] = { uzs: 0, usd: 0 };
      if (t.currency === "UZS") categoryData[t.category].uzs += t.amount;
      else categoryData[t.category].usd += t.amount;
    });

  return NextResponse.json({ monthly: results, categoryExpenses: categoryData });
}