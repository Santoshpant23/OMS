import { create } from "zustand";
import { apiClient } from "./authStore";

export interface OrderLevel {
  side: "BID" | "ASK";
  price: number;
  size: number;
}

export interface OrderBook {
  symbol: string;
  mid: number;
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export interface TradeRequest {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity: number;
  limit_price?: number;
}

export interface OrderResponse {
  order_id: number;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  limit_price: number;
  arrival_mid: number;
  exec_price: number;
  slippage: number;
  status: string;
}

export interface AnalyticsTrade {
  order_id: number;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  limit_price?: number;
  status: string;
  arrival_mid?: number;
  created_at: string;
  updated_at: string;
  exec_id?: number;
  exec_price?: number;
  exec_qty?: number;
  slippage_bps?: number;
  exec_created_at?: string;
}

export interface SymbolStats {
  symbol: string;
  trades: number;
  total_qty: number;
  buy_qty: number;
  sell_qty: number;
  net_qty: number;
  avg_exec_price: number;
  avg_slippage_usd: number;
  avg_slippage_bps: number;
}

interface DashboardStats {
  open_orders: number;
  portfolio_value: number;
}

interface TradingStore {
  orderBook: OrderBook | null;
  selectedSymbol: string | null;
  selectedSide: "BUY" | "SELL" | null;
  isLoading: boolean;
  error: string | null;
  trades: AnalyticsTrade[];
  stats: SymbolStats | null;
  lastOrder: OrderResponse | null;
  dashboardStats: DashboardStats | null;

  setSelectedSymbol: (symbol: string) => void;
  setSelectedSide: (side: "BUY" | "SELL") => void;
  fetchOrderBook: (symbol: string) => Promise<void>;
  submitTrade: (trade: TradeRequest) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchAllTrades: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  clearError: () => void;
}

export const useTradingStore = create<TradingStore>((set) => ({
  orderBook: null,
  selectedSymbol: null,
  selectedSide: null,
  isLoading: false,
  error: null,
  trades: [],
  stats: null,
  lastOrder: null,
  dashboardStats: null,

  setSelectedSymbol: (symbol: string) => set({ selectedSymbol: symbol }),
  setSelectedSide: (side: "BUY" | "SELL") => set({ selectedSide: side }),
  fetchOrderBook: async (symbol: string) => {
    set({ isLoading: true, error: null });
    try {
      // Use the dedicated GET endpoint
      const response = await apiClient.get(`/orderbook/${symbol}`);

      set({
        orderBook: response.data,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch order book";
      set({ error: errorMsg, isLoading: false });
      // Optional: Don't throw if you want the UI to just show error state
      // throw err;
    }
  },

  submitTrade: async (trade: TradeRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/trade/", trade);
      set({
        lastOrder: response.data,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data || err.message || "Trade submission failed";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/me/analytics");
      // Response should contain stats and timeline data
      set({
        stats: response.data.stats || response.data,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data || err.message || "Failed to fetch analytics";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchAllTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/me/orders");
      set({
        trades: response.data,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data || err.message || "Failed to fetch trades";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchDashboardStats: async () => {
    try {
      const response = await apiClient.get("/me/stats");
      set({
        dashboardStats: response.data,
      });
    } catch (err: any) {
      // Silently fail for stats - don't break the dashboard
      console.error("Failed to fetch dashboard stats:", err);
    }
  },

  clearError: () => set({ error: null }),
}));
