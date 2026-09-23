import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceAt, dataRange } from "@/lib/priceAt";

// GET /api/stocks?datetime=2026-08-05T11:00:00
// Returns every stock with its price as-of the selected datetime.
export async function GET(req: NextRequest) {
  const datetimeParam = req.nextUrl.searchParams.get("datetime");
  const range = await dataRange();

  const datetime = datetimeParam ? new Date(datetimeParam) : range.to;
  if (!datetime || isNaN(datetime.getTime())) {
    return NextResponse.json({ error: "Invalid datetime" }, { status: 400 });
  }

  const stocks = await prisma.stock.findMany({ orderBy: { symbol: "asc" } });

  const results = await Promise.all(
    stocks.map(async (stock) => {
      const p = await priceAt(stock.id, datetime);
      return {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        price: p ? Number(p.close) : null,
        timestamp: p ? p.timestamp : null,
      };
    })
  );

  return NextResponse.json({ datetime, dataRange: range, stocks: results });
}
