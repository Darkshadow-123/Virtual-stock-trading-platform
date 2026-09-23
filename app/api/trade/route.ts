import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceAt } from "@/lib/priceAt";

const USER_ID = 1; // single predefined user for the MVP

// POST /api/trade
// Body: { symbol: string, type: "BUY" | "SELL", quantity: number, datetime: string }
// Executes a trade at the price for the given simulated datetime.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { symbol, type, quantity, datetime } = body as {
    symbol: string;
    type: "BUY" | "SELL";
    quantity: number;
    datetime: string;
  };

  if (!symbol || !type || !quantity || quantity <= 0 || !datetime) {
    return NextResponse.json({ error: "Invalid trade request" }, { status: 400 });
  }
  if (type !== "BUY" && type !== "SELL") {
    return NextResponse.json({ error: "type must be BUY or SELL" }, { status: 400 });
  }

  const dt = new Date(datetime);
  if (isNaN(dt.getTime())) {
    return NextResponse.json({ error: "Invalid datetime" }, { status: 400 });
  }

  const stock = await prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  const priceRow = await priceAt(stock.id, dt);
  if (!priceRow) {
    return NextResponse.json(
      { error: "No market data available at or before this datetime" },
      { status: 400 }
    );
  }
  const price = Number(priceRow.close);
  const cost = price * quantity;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: USER_ID } });
      const existingHolding = await tx.holding.findUnique({
        where: { userId_stockId: { userId: USER_ID, stockId: stock.id } },
      });

      if (type === "BUY") {
        if (Number(user.cashBalance) < cost) {
          throw new Error("INSUFFICIENT_FUNDS");
        }
        await tx.user.update({
          where: { id: USER_ID },
          data: { cashBalance: { decrement: cost } },
        });

        if (existingHolding) {
          const newQty = existingHolding.quantity + quantity;
          const newAvg =
            (existingHolding.quantity * Number(existingHolding.avgBuyPrice) + cost) / newQty;
          await tx.holding.update({
            where: { id: existingHolding.id },
            data: { quantity: newQty, avgBuyPrice: newAvg },
          });
        } else {
          await tx.holding.create({
            data: { userId: USER_ID, stockId: stock.id, quantity, avgBuyPrice: price },
          });
        }
      } else {
        // SELL
        if (!existingHolding || existingHolding.quantity < quantity) {
          throw new Error("INSUFFICIENT_HOLDINGS");
        }
        await tx.user.update({
          where: { id: USER_ID },
          data: { cashBalance: { increment: cost } },
        });

        const remaining = existingHolding.quantity - quantity;
        if (remaining === 0) {
          await tx.holding.delete({ where: { id: existingHolding.id } });
        } else {
          await tx.holding.update({
            where: { id: existingHolding.id },
            data: { quantity: remaining }, // avgBuyPrice unchanged on a partial sell
          });
        }
      }

      const txn = await tx.transaction.create({
        data: {
          userId: USER_ID,
          stockId: stock.id,
          type,
          quantity,
          price,
          simulatedDatetime: dt,
        },
      });

      return txn;
    });

    return NextResponse.json({ success: true, transaction: result, executedPrice: price });
  } catch (e: any) {
    if (e.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({ error: "Insufficient virtual cash balance" }, { status: 400 });
    }
    if (e.message === "INSUFFICIENT_HOLDINGS") {
      return NextResponse.json({ error: "You don't own enough shares to sell" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Trade failed" }, { status: 500 });
  }
}
