import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const USER_ID = 1;

// POST /api/reset — wipes holdings/transactions and restores ₹10,00,000 virtual cash.
// Handy for demos: reset between walkthroughs without reseeding market data.
export async function POST() {
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: USER_ID } }),
    prisma.holding.deleteMany({ where: { userId: USER_ID } }),
    prisma.user.update({ where: { id: USER_ID }, data: { cashBalance: 1_000_000 } }),
  ]);
  return NextResponse.json({ success: true });
}
