"use client";

import { useEffect, useState, useCallback } from "react";
import DateTimeControl from "@/components/DateTimeControl";
import StockList from "@/components/StockList";
import TradePanel from "@/components/TradePanel";
import Portfolio from "@/components/Portfolio";
import TransactionHistory from "@/components/TransactionHistory";
import { StockWithPrice } from "@/lib/types";

// Formats a Date as "YYYY-MM-DDTHH:mm" for the <input type="date"/"time"> pair.
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function Home() {
  const [datetime, setDatetime] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [stocks, setStocks] = useState<StockWithPrice[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStocks = useCallback(async (dt: string) => {
    const res = await fetch(`/api/stocks?datetime=${encodeURIComponent(dt)}:00`);
    const data = await res.json();
    setStocks(data.stocks ?? []);
    if (!range && data.dataRange) setRange(data.dataRange);
  }, [range]);

  const loadPortfolio = useCallback(async (dt: string) => {
    const res = await fetch(`/api/portfolio?datetime=${encodeURIComponent(dt)}:00`);
    const data = await res.json();
    setPortfolio(data);
  }, []);

  const loadTransactions = useCallback(async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data.transactions ?? []);
  }, []);

  // Initial load: fetch the dataset's date range and default to its latest timestamp.
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stocks`); // no datetime -> defaults to latest
      const data = await res.json();
      const to = new Date(data.dataRange.to);
      setRange(data.dataRange);
      setStocks(data.stocks ?? []);
      setDatetime(toLocalInput(to));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!datetime) return;
    loadStocks(datetime);
    loadPortfolio(datetime);
  }, [datetime]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refreshAfterTrade = () => {
    if (datetime) {
      loadStocks(datetime);
      loadPortfolio(datetime);
    }
    loadTransactions();
  };

  if (loading || !datetime) {
    return (
      <div className="container" style={{ padding: "16px" }}>
        <div className="header" style={{ height: "60px" }}></div>
        <div className="grid">
          <div className="panel" style={{ height: "400px", opacity: 0.5, animation: "pulse 2s infinite" }}>
            <h2>Stocks</h2>
            <div style={{ height: 32, background: "var(--border-subtle)", marginBottom: 8 }}></div>
            <div style={{ height: 32, background: "var(--border-subtle)", marginBottom: 8 }}></div>
            <div style={{ height: 32, background: "var(--border-subtle)", marginBottom: 8 }}></div>
          </div>
          <div className="panel" style={{ height: "200px", opacity: 0.5, animation: "pulse 2s infinite" }}>
             <h2>Trade</h2>
          </div>
        </div>
      </div>
    );
  }

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) ?? null;

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 14 }}>Virtual Stock Trading</h1>
            <div className="sub mono">SIMULATED ENVIRONMENT</div>
          </div>
          
          {portfolio && (
            <div style={{ display: "flex", gap: 24, borderLeft: "1px solid var(--border-subtle)", paddingLeft: 24 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Net Worth</div>
                <div className="mono-bold" style={{ fontSize: 16 }}>₹{portfolio.netWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Cash Balance</div>
                <div className="mono-bold" style={{ fontSize: 16, color: "var(--text-secondary)" }}>₹{portfolio.cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          )}
        </div>
        
        <DateTimeControl
          value={datetime}
          onChange={setDatetime}
          min={range ? toLocalInput(new Date(range.from)) : undefined}
          max={range ? toLocalInput(new Date(range.to)) : undefined}
        />
      </div>

      <div className="grid">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <StockList stocks={stocks} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
          <TransactionHistory transactions={transactions} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TradePanel stock={selectedStock} datetime={datetime} onTraded={refreshAfterTrade} cashBalance={portfolio?.cashBalance ?? 0} />
          {portfolio && (
            <Portfolio
              holdings={portfolio.holdings}
              totalProfitLoss={portfolio.totalProfitLoss}
            />
          )}
        </div>
      </div>
    </div>
  );
}
