import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type");

  let query = db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))
    .$dynamic();

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    query = query.where(
      and(
        eq(transactions.userId, session.user.id),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    );
  }

  const data = await query.orderBy(desc(transactions.date));

  const filtered = type ? data.filter((t) => t.type === type) : data;

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [tx] = await db
    .insert(transactions)
    .values({
      userId: session.user.id,
      type: body.type,
      amount: body.amount,
      currency: body.currency,
      category: body.category,
      description: body.description,
      date: new Date(body.date),
    })
    .returning();

  return NextResponse.json(tx);
}