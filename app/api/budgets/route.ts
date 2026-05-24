import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { budgets, transactions } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month") || new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") || new Date().getFullYear());

  const userBudgets = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, session.user.id),
        eq(budgets.month, month),
        eq(budgets.year, year)
      )
    );

  // Har bir budget uchun harchamalrni hisoblash
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const monthTxs = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "expense"),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );

  const result = userBudgets.map((budget) => {
    const spent = monthTxs
      .filter((t) => t.category === budget.category && t.currency === budget.currency)
      .reduce((s, t) => s + t.amount, 0);
    return { ...budget, spent, remaining: budget.limitAmount - spent };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Mavjud budgetni tekshirish
  const [existing] = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, session.user.id),
        eq(budgets.category, body.category),
        eq(budgets.month, body.month),
        eq(budgets.year, body.year),
        eq(budgets.currency, body.currency)
      )
    );

  if (existing) {
    return NextResponse.json({ error: "Bu kategoriya uchun budget allaqachon mavjud" }, { status: 400 });
  }

  const [budget] = await db
    .insert(budgets)
    .values({
      userId: session.user.id,
      category: body.category,
      limitAmount: body.limitAmount,
      currency: body.currency,
      month: body.month,
      year: body.year,
    })
    .returning();

  return NextResponse.json(budget);
}