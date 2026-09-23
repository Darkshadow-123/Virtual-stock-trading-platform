"use client";

import { useEffect, useState, useRef } from "react";
import { StockWithPrice } from "@/lib/types";

type Props = {
  symbol: string;
  timestamp: string | null;
  onDeltaChange?: (delta: number) => void;
};

export default function Sparkline({ symbol, timestamp, onDeltaChange }: Props) {
  const [points, setPoints] = useState<number[]>([]);
  const onDeltaChangeRef = useRef(onDeltaChange);
  onDeltaChangeRef.current = onDeltaChange;

  useEffect(() => {
    if (!timestamp) return;
    
    let isMounted = true;
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/stocks/${symbol}/history?upto=${encodeURIComponent(timestamp!)}`);
        const data = await res.json();
        if (data.prices && isMounted) {
          // Take last 20 ticks for the sparkline
          const recent = data.prices.slice(-20).map((p: any) => p.close);
          setPoints(recent);
          
          if (recent.length >= 2 && onDeltaChangeRef.current) {
            const current = recent[recent.length - 1];
            const prev = recent[recent.length - 2];
            onDeltaChangeRef.current(current - prev);
          }
        }
      } catch (e) {}
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [symbol, timestamp]);

  if (points.length < 2) return <div style={{ width: 60, height: 20 }} />;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  
  const width = 60;
  const height = 20;
  
  const polylinePoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const isUp = points[points.length - 1] >= points[points.length - 2];
  const color = isUp ? "var(--positive)" : "var(--negative)";

  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
