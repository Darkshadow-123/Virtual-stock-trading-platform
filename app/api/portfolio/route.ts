import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceAt, dataRange } from "@/lib/priceAt";

const USER_ID = 1; // single predefined user for the MVP

// GET /api/portfolio?datetime=2026-08-05T11:00:00
// Returns cash balance, holdings valued at the selected datetime, and total P&L.
export async function GET(req: NextRequest) {
  const datetimeParam = req.nextUrl.searchParams.get("datetime");
  const range = await dataRange();
  const datetime = datetimeParam ? new Date(datetimeParam) : range.to;
  if (!datetime || isNaN(datetime.getTime())) {
    return NextResponse.json({ error: "Invalid datetime" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: USER_ID } });
  const holdings = await prisma.holding.findMany({
    where: { userId: USER_ID, quantity: { gt: 0 } },
    include: { stock: true },
  });

  let totalCurrentValue = 0;
  let totalInvested = 0;

  const holdingViews = await Promise.all(
    holdings.map(async (h) => {
      const p = await priceAt(h.stockId, datetime);
      const currentPrice = p ? Number(p.close) : null;
      const invested = h.quantity * Number(h.avgBuyPrice);
      const currentValue = currentPrice !== null ? h.quantity * currentPrice : invested;
      const profitLoss = currentValue - invested;
      totalCurrentValue += currentValue;
      totalInvested += invested;
      return {
        stockId: h.stockId,
        symbol: h.stock.symbol,
        name: h.stock.name,
        quantity: h.quantity,
        avgBuyPrice: Number(h.avgBuyPrice),
        currentPrice,
        investedValue: invested,
        currentValue,
        profitLoss,
        profitLossPct: invested > 0 ? (profitLoss / invested) * 100 : 0,
      };
    })
  );

  const cashBalance = Number(user?.cashBalance ?? 0);

  return NextResponse.json({
    datetime,
    cashBalance,
    holdings: holdingViews,
    totalInvested,
    totalCurrentValue,
    totalProfitLoss: totalCurrentValue - totalInvested,
    netWorth: cashBalance + totalCurrentValue,
  });
}
