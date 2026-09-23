"use client";

import { useEffect, useState, useCallback } from "react";
import { StockWithPrice } from "@/lib/types";
import Sparkline from "./Sparkline";

type Props = {
  stocks: StockWithPrice[];
  selectedSymbol: string | null;
  onSelect: (symbol: string | null) => void;
};

function StockRow({ 
  stock, 
  selected, 
  onSelect 
}: { 
  stock: StockWithPrice; 
  selected: boolean; 
  onSelect: () => void; 
}) {
  const [delta, setDelta] = useState<number | null>(null);
  const [prevPriceState, setPrevPriceState] = useState<number | null>(null);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (stock.price !== null) {
      if (prevPriceState !== null && stock.price !== prevPriceState) {
        setFlashClass(stock.price > prevPriceState ? "flash-up" : "flash-down");
        const timer = setTimeout(() => setFlashClass(""), 400);
        setPrevPriceState(stock.price);
        return () => clearTimeout(timer);
      }
      setPrevPriceState(stock.price);
    }
  }, [stock.price]);

  const handleDeltaChange = useCallback((d: number) => {
    setDelta(d);
  }, []);

  return (
    <tr
      className={`clickable ${flashClass}`}
      onClick={onSelect}
      style={{
        background: selected ? "var(--bg-panel-hover)" : undefined,
        borderLeft: selected ? "2px solid var(--accent)" : "2px solid transparent",
      }}
    >
      <td style={{ paddingLeft: selected ? 18 : 20, width: "35%" }}>
        <div className="mono-bold">{stock.symbol}</div>
        <div className="muted" style={{ fontSize: 10, textTransform: "uppercase" }}>{stock.name}</div>
      </td>
      <td style={{ width: "25%" }}>
        <Sparkline symbol={stock.symbol} timestamp={stock.timestamp} onDeltaChange={handleDeltaChange} />
      </td>
      <td className="numeric mono-bold" style={{ width: "20%" }}>
        {stock.price !== null ? stock.price.toFixed(2) : "—"}
      </td>
      <td className={`numeric mono-bold ${delta !== null ? (delta >= 0 ? "up" : "down") : ""}`} style={{ width: "20%", paddingRight: 20 }}>
        {delta !== null ? (
          <>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}
          </>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

export default function StockList({ stocks, selectedSymbol, onSelect }: Props) {
  return (
    <div className="panel">
      <div className="panel-header-bar">
        <h2>Markets</h2>
      </div>
      <table style={{ borderBottom: "none" }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 20 }}>Symbol</th>
            <th>Trend</th>
            <th className="numeric">Last</th>
            <th className="numeric" style={{ paddingRight: 20 }}>Chg</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <StockRow 
              key={s.id} 
              stock={s} 
              selected={s.symbol === selectedSymbol} 
              onSelect={() => onSelect(s.symbol === selectedSymbol ? null : s.symbol)} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
