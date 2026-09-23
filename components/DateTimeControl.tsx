"use client";

import { useMemo, useState, useRef, useEffect } from "react";

type Props = {
  value: string; // ISO-ish "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  min?: string;
  max?: string;
};

const MARKET_TIMES = [
  "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", 
  "14:30", "15:00", "15:30"
];

// Helper to generate business days between min and max
function getBusinessDays(startDateStr: string, endDateStr: string) {
  const dates = [];
  const currentDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  while (currentDate <= endDate) {
    const day = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      const pad = (n: number) => String(n).padStart(2, "0");
      dates.push(`${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// Custom Select to allow styled dropdowns, smaller height, and smooth transitions
function CustomSelect({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button 
        type="button"
        className="mono"
        style={{ 
          background: "var(--bg-base)",
          border: isOpen ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
          color: "var(--text-primary)",
          padding: "4px 8px",
          minWidth: 100,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 400,
          cursor: "pointer"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <span style={{ fontSize: 8, opacity: 0.5, marginLeft: 8 }}>▼</span>
      </button>

      <div 
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: "100%",
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          zIndex: 100,
          maxHeight: 140, // Small height to force scrollbar
          overflowY: "auto",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transform: isOpen ? "translateY(4px)" : "translateY(-4px)",
          transition: "opacity 150ms ease, transform 150ms ease, visibility 150ms",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          borderRadius: 2
        }}
      >
        {options.map((opt) => (
          <div 
            key={opt}
            className="mono"
            style={{ 
              padding: "6px 8px", 
              background: opt === value ? "var(--bg-panel-hover)" : "transparent",
              color: opt === value ? "var(--accent)" : "var(--text-primary)",
              fontSize: 12,
              cursor: "pointer"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-panel-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = opt === value ? "var(--bg-panel-hover)" : "transparent")}
            onClick={() => { onChange(opt); setIsOpen(false); }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

// Lets the user pick the simulated market date/time from a list of valid options
export default function DateTimeControl({ value, onChange, min, max }: Props) {
  const [datePart, timePart] = value.split("T");

  const availableDates = useMemo(() => {
    if (!min || !max) return [datePart];
    return getBusinessDays(min.split("T")[0], max.split("T")[0]);
  }, [min, max, datePart]);

  // Ensure selected date/time exists in options, otherwise fallback
  const validDate = availableDates.includes(datePart) ? datePart : availableDates[availableDates.length - 1];
  const validTime = MARKET_TIMES.includes(timePart) ? timePart : "15:30";

  return (
    <div className="datetime-bar" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="mono tertiary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>AS-OF:</span>
      
      <CustomSelect 
        options={availableDates} 
        value={validDate} 
        onChange={(val) => onChange(`${val}T${validTime}`)} 
      />

      <CustomSelect 
        options={MARKET_TIMES} 
        value={validTime} 
        onChange={(val) => onChange(`${validDate}T${val}`)} 
      />
    </div>
  );
}
