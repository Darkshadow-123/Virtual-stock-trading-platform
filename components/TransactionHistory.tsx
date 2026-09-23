"use client";

type Transaction = {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  simulatedDatetime: string;
};

type Props = {
  transactions: Transaction[];
};

export default function TransactionHistory({ transactions }: Props) {
  // Most recent first
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.simulatedDatetime).getTime() - new Date(a.simulatedDatetime).getTime()
  );

  return (
    <div className="panel">
      <div className="panel-header-bar">
        <h2>Executions</h2>
      </div>
      
      {sorted.length === 0 ? (
        <div className="panel-content">
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>No executions yet.</p>
        </div>
      ) : (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <table style={{ borderBottom: "none" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 20 }}>Time</th>
                <th>Sym</th>
                <th>Side</th>
                <th className="numeric">Qty</th>
                <th className="numeric" style={{ paddingRight: 20 }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const date = new Date(t.simulatedDatetime);
                const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                
                return (
                  <tr key={t.id}>
                    <td className="mono muted" style={{ paddingLeft: 20, fontSize: 11 }}>
                      {dateStr} <span style={{ color: "var(--text-primary)" }}>{timeStr}</span>
                    </td>
                    <td className="mono-bold">{t.symbol}</td>
                    <td>
                      <span className={`badge badge-${t.type.toLowerCase()}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="numeric mono">{t.quantity}</td>
                    <td className="numeric mono" style={{ paddingRight: 20 }}>₹{t.price.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
