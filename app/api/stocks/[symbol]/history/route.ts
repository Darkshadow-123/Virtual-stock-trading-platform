import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stocks/TCS/history?upto=2026-08-05T11:00:00
// Returns all price ticks for a stock up to the selected datetime (for charting).
export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const uptoParam = req.nextUrl.searchParams.get("upto");
  const stock = await prisma.stock.findUnique({
    where: { symbol: params.symbol.toUpperCase() },
  });
  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  const upto = uptoParam ? new Date(uptoParam) : undefined;

  const prices = await prisma.stockPrice.findMany({
    where: { stockId: stock.id, ...(upto ? { timestamp: { lte: upto } } : {}) },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json({
    symbol: stock.symbol,
    name: stock.name,
    prices: prices.map((p) => ({
      timestamp: p.timestamp,
      open: Number(p.open),
      high: Number(p.high),
      low: Number(p.low),
      close: Number(p.close),
      volume: p.volume,
    })),
  });
}
