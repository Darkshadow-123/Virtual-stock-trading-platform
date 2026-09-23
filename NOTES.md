# Redesign Notes

## Aesthetic & Thematic Choices
The visual redesign strictly targets a dense, professional "trading terminal" aesthetic (e.g., Bloomberg, Interactive Brokers), migrating away from a typical soft consumer app feel. 

- **Colors:** The background relies on true near-blacks (`#050505`, `#0f0f11`) to maximize contrast without causing eye strain. The accent color is an Electric Blue (`#3b82f6`) for a sharp, technical look. Semantic colors (Red/Green) were slightly desaturated (`#10b981`, `#ef4444`) to remain crisp and legible against the dark background while minimizing optical vibration.
- **Borders & Corners:** Hairline borders (`1px solid #242428`) are used to separate structural sections instead of heavy drop shadows or large gaps. Corner radiuses were reduced to `2px`-`4px` to enforce a sharp, data-forward structure.

## Typography
- **Primary:** `Inter` for all UI text, labels, and headers (ensuring clean legibility at small sizes).
- **Numeric:** `JetBrains Mono` for all prices, quantities, timestamps, and P&L figures. This ensures that digits perfectly align in columns (using `tabular-nums`) so the layout doesn't jitter when prices update. 
- **Scale:** Body text is small (`12-13px`), labels are tiny (`10-11px` uppercase with tracking), but the most critical number—**Net Worth**—is the largest typographic element on the screen.

## Component Enhancements
1. **StockList & Sparklines:** Converted to a dense ticker list. We now render lightweight, hand-rolled SVG sparklines that fetch historical data on the fly. A Delta column displays the change relative to the previous tick, with color-coded trend indicators.
2. **Order Ticket (TradePanel):** Replaced the generic side-by-side Buy/Sell buttons with a segmented control. Added a dashed summary row to preview the total order cost and projected remaining cash balance before execution.
3. **Portfolio & Executions:** Shifted the Net Worth / Cash Balance up into a sticky global header. The Portfolio now anchors visually on the `Total P&L` figure. The Execution history (`TransactionHistory`) was reformatted into a strict monospace grid with distinct, colored `BUY`/`SELL` tags for fast scanning.
4. **Micro-Motion:** Implemented CSS keyframe pulses (`flash-up`, `flash-down`) that trigger when a stock price ticks up or down, giving the simulated market a "live" feel without complex animation libraries.
