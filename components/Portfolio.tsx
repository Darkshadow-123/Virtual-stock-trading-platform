"use client";

type Holding = {
  stockId: number;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number | null;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPct: number;
};

type Props = {
  holdings: Holding[];
  totalProfitLoss: number;
};

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function Portfolio({
  holdings,
  totalProfitLoss,
}: Props) {
  return (
    <div className="panel">
      <div className="panel-header-bar">
        <h2>Open Positions</h2>
      </div>

      <div className="panel-content" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
          Total P&L
        </div>
        <div 
          className={`mono-bold ${totalProfitLoss >= 0 ? "up" : "down"}`} 
          style={{ fontSize: 32, lineHeight: 1 }}
        >
          {totalProfitLoss >= 0 ? "+" : ""}₹{fmt(totalProfitLoss)}
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="panel-content">
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>No open positions.</p>
        </div>
      ) : (
        <table style={{ borderBottom: "none" }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Symbol</th>
              <th className="numeric">Qty</th>
              <th className="numeric">Avg Px</th>
              <th className="numeric">Mark</th>
              <th className="numeric" style={{ paddingRight: 20 }}>P/L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.stockId}>
                <td style={{ paddingLeft: 20 }}>
                  <div className="mono-bold">{h.symbol}</div>
                </td>
                <td className="numeric mono">{h.quantity}</td>
                <td className="numeric mono">₹{fmt(h.avgBuyPrice)}</td>
                <td className="numeric mono">{h.currentPrice !== null ? `₹${fmt(h.currentPrice)}` : "—"}</td>
                <td className={`numeric mono-bold ${h.profitLoss >= 0 ? "up" : "down"}`} style={{ paddingRight: 20 }}>
                  {h.profitLoss >= 0 ? "+" : ""}
                  ₹{fmt(h.profitLoss)}
                  <div style={{ fontSize: 10, fontWeight: 400 }}>({h.profitLossPct >= 0 ? "+" : ""}{h.profitLossPct.toFixed(2)}%)</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
