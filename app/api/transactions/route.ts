import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const USER_ID = 1;

// GET /api/transactions — full buy/sell history, newest first.
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    where: { userId: USER_ID },
    include: { stock: true },
    orderBy: { simulatedDatetime: "desc" },
  });

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      symbol: t.stock.symbol,
      name: t.stock.name,
      type: t.type,
      quantity: t.quantity,
      price: Number(t.price),
      total: Number(t.price) * t.quantity,
      simulatedDatetime: t.simulatedDatetime,
      createdAt: t.createdAt,
    })),
  });
}
