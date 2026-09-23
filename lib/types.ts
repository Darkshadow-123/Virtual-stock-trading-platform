export type StockWithPrice = {
  id: number;
  symbol: string;
  name: string;
  price: number | null;
  timestamp: string | null;
};

export type HoldingView = {
  stockId: number;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number | null;
  currentValue: number;
  investedValue: number;
  profitLoss: number;
  profitLossPct: number;
};
