"use client";

import { useState } from "react";
import { StockWithPrice } from "@/lib/types";

type Props = {
  stock: StockWithPrice | null;
  datetime: string; // "YYYY-MM-DDTHH:mm"
  onTraded: () => void;
  cashBalance: number;
};

export default function TradePanel({ stock, datetime, onTraded, cashBalance }: Props) {
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function trade() {
    if (!stock) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          type,
          quantity,
          datetime: `${datetime}:00`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Trade failed");
      } else {
        onTraded();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!stock) {
    return (
      <div className="panel">
        <div className="panel-header-bar">
          <h2>Order Ticket</h2>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          Select a symbol from the market view to construct an order.
        </p>
      </div>
    );
  }

  const price = stock.price !== null ? stock.price : 0;
  const totalCost = price * quantity;
  const remainingCash = type === "BUY" ? cashBalance - totalCost : cashBalance + totalCost;
  const isInsufficient = type === "BUY" && totalCost > cashBalance;

  return (
    <div className="panel">
      <div className="panel-header-bar">
        <h2>Order Ticket — {stock.symbol}</h2>
      </div>
      
      <div className="panel-content">
        {/* Segmented Control */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-base)", padding: 4, borderRadius: 2, marginBottom: 16 }}>
          <button 
            style={{ 
              flex: 1, 
              background: type === "BUY" ? "var(--bg-panel-hover)" : "transparent",
              color: type === "BUY" ? "var(--positive)" : "var(--text-tertiary)",
              border: type === "BUY" ? "1px solid var(--border-strong)" : "1px solid transparent"
            }} 
            onClick={() => setType("BUY")}
          >
            BUY
          </button>
          <button 
            style={{ 
              flex: 1, 
              background: type === "SELL" ? "var(--bg-panel-hover)" : "transparent",
              color: type === "SELL" ? "var(--negative)" : "var(--text-tertiary)",
              border: type === "SELL" ? "1px solid var(--border-strong)" : "1px solid transparent"
            }} 
            onClick={() => setType("SELL")}
          >
            SELL
          </button>
        </div>

        <div className="trade-form">
          <div className="row">
            <span className="tertiary" style={{ fontSize: 11, textTransform: "uppercase" }}>Limit Price</span>
            <strong className="mono-bold">₹{stock.price !== null ? stock.price.toFixed(2) : "N/A"}</strong>
          </div>
          
          <div className="row">
            <label className="tertiary" style={{ fontSize: 11, textTransform: "uppercase" }}>Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 100, textAlign: "right" }}
            />
          </div>

          <div style={{ borderTop: "1px dashed var(--border-strong)", margin: "16px 0" }}></div>

          <div className="row">
            <span className="tertiary" style={{ fontSize: 11, textTransform: "uppercase" }}>Order Value</span>
            <span className="mono-bold">₹{totalCost.toFixed(2)}</span>
          </div>
          <div className="row">
            <span className="tertiary" style={{ fontSize: 11, textTransform: "uppercase" }}>Proj. Cash</span>
            <span className={`mono-bold ${remainingCash < 0 ? "down" : ""}`}>
              ₹{remainingCash.toFixed(2)}
            </span>
          </div>

          {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
          
          {isInsufficient && !error && (
            <div className="error-msg" style={{ marginTop: 12, background: "var(--warning-bg)", borderLeftColor: "var(--warning)", color: "var(--warning)" }}>
              Insufficient funds for this order.
            </div>
          )}

          <button 
            className={type === "BUY" ? "btn-buy" : "btn-sell"} 
            style={{ width: "100%", marginTop: 16, padding: "10px" }}
            disabled={loading || stock.price === null || isInsufficient} 
            onClick={trade}
          >
            {type} {quantity} {stock.symbol}
          </button>
        </div>
      </div>
    </div>
  );
}
