import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [tx] = await db
    .update(transactions)
    .set({
      type: body.type,
      amount: body.amount,
      currency: body.currency,
      category: body.category,
      description: body.description,
      date: new Date(body.date),
    })
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, session.user.id)
      )
    )
    .returning();

  return NextResponse.json(tx);
}