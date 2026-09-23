# Virtual Stock Trading Platform

Next.js (App Router) + Prisma + Postgres (Neon). No auth — a single predefined
user starts with ₹10,00,000 virtual cash. Prices are looked up from a
pre-loaded CSV dataset (10 stocks, 12 trading days, 30-min intervals) at
whatever date/time the user selects on the dashboard.

## 1. Create a Neon database

1. Go to https://neon.tech and create a free project.
2. From the dashboard, copy the **pooled** connection string and the
   **direct** connection string (Neon shows both — direct is needed for
   Prisma migrations).

## 2. Configure environment

```bash
cp .env.example .env
```

Paste your two Neon connection strings into `.env`:

```
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create the database schema

```bash
npx prisma migrate dev --name init
```

This creates the `User`, `Stock`, `StockPrice`, `Holding`, and `Transaction`
tables on Neon.

## 5. Seed the market data

```bash
npm run seed
```

This loads `prisma/stock_market_data.csv` (10 stocks × 12 days × 30-min
candles) into `StockPrice`, creates the 10 `Stock` rows, and creates the
single demo `User` with ₹10,00,000 cash.

## 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## How it works

- **Date/time picker** at the top drives everything else on the page — it's
  the "selected date and time" the assignment asks for.
- **Price lookup** (`lib/priceAt.ts`) finds the most recent price at or
  before the selected datetime (last-traded-price semantics), so any
  timestamp between 30-min candles still resolves to a sensible price.
- **Buy/Sell** (`app/api/trade/route.ts`) executes at the price for the
  currently selected datetime, inside a Prisma transaction that updates cash
  balance, holdings (with running average buy price), and writes a
  `Transaction` row.
- **Portfolio** (`app/api/portfolio/route.ts`) values every holding at the
  selected datetime and computes P&L per position and overall.
- **Reset** — `POST /api/reset` wipes holdings/transactions and restores
  ₹10,00,000 cash, handy for repeat demos without reseeding market data.

## Project structure

```
app/
  page.tsx                     # dashboard (client component)
  api/stocks/route.ts          # GET all stocks + price at datetime
  api/stocks/[symbol]/history/ # GET price history for a stock (charting)
  api/portfolio/route.ts       # GET holdings valued at datetime + P&L
  api/trade/route.ts           # POST buy/sell
  api/transactions/route.ts    # GET full trade history
  api/reset/route.ts           # POST reset demo state
components/                    # DateTimeControl, StockList, TradePanel,
                                # Portfolio, TransactionHistory
lib/
  prisma.ts                    # Prisma client singleton
  priceAt.ts                   # "price as of datetime" lookup helper
  types.ts
prisma/
  schema.prisma
  seed.ts
  stock_market_data.csv        # dummy 10-stock / 12-day / 30-min dataset
```

## Notes / next steps if you extend this

- The CSV covers Aug 3–18, 2026, market hours 9:30–15:30 IST. To regenerate
  with different stocks/dates, edit the CSV or the generator you used to
  create it and re-run `npm run seed` (it upserts, so it's safe to re-run).
- No auth is implemented per the assignment scope — `USER_ID = 1` is
  hardcoded in the API routes. If you add login later, swap that constant
  for the session user's id.
- Charts: `GET /api/stocks/:symbol/history?upto=<datetime>` already returns
  OHLCV series up to the selected time if you want to add a price chart on
  the stock detail view.
