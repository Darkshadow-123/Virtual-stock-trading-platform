import { prisma } from "./prisma";

/**
 * Returns the most recent stock price at or before the given datetime
 * ("last traded price" semantics — mirrors how real markets show price
 * between exact tick timestamps).
 */
export async function priceAt(stockId: number, datetime: Date) {
  return prisma.stockPrice.findFirst({
    where: { stockId, timestamp: { lte: datetime } },
    orderBy: { timestamp: "desc" },
  });
}

/** Convenience: the overall min/max timestamp available in the dataset. */
export async function dataRange() {
  const [earliest, latest] = await Promise.all([
    prisma.stockPrice.findFirst({ orderBy: { timestamp: "asc" } }),
    prisma.stockPrice.findFirst({ orderBy: { timestamp: "desc" } }),
  ]);
  return {
    from: earliest?.timestamp ?? null,
    to: latest?.timestamp ?? null,
  };
}
