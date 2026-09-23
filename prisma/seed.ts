import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type Row = {
  symbol: string;
  name: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

async function main() {
  console.log("Seeding database...");

  // 1. Ensure the single predefined user exists, with ₹10,00,000 virtual cash
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Demo Trader", cashBalance: 1_000_000 },
  });
  console.log(`User ready: ${user.name} (₹${user.cashBalance})`);

  // 2. Read and parse the CSV
  const csvPath = path.join(__dirname, "stock_market_data.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows: Row[] = parse(raw, { columns: true, skip_empty_lines: true });

  // 3. Create each stock once
  const symbols = [...new Set(rows.map((r) => r.symbol))];
  const stockMap = new Map<string, number>();
  for (const symbol of symbols) {
    const name = rows.find((r) => r.symbol === symbol)!.name;
    const stock = await prisma.stock.upsert({
      where: { symbol },
      update: { name },
      create: { symbol, name },
    });
    stockMap.set(symbol, stock.id);
  }
  console.log(`Stocks ready: ${symbols.length}`);

  // 4. Bulk-insert price rows (batched)
  const data = rows.map((r) => ({
    stockId: stockMap.get(r.symbol)!,
    timestamp: new Date(r.timestamp.replace(" ", "T")),
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
    volume: parseInt(r.volume, 10),
  }));

  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const result = await prisma.stockPrice.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
  }
  console.log(`Price rows inserted: ${inserted}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
