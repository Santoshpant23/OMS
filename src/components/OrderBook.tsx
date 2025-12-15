// OrderBook.tsx - Component that displays the cryptocurrency order book
// Shows bid (buy) and ask (sell) orders at different price levels
// Updates every 60 seconds to show real-time market data

import { useEffect, useState } from 'react';
import { apiClient } from '../store/authStore';

// OrderLevel represents a single price level in the order book
// BID = buy orders, ASK = sell orders
export interface OrderLevel {
  side: 'BID' | 'ASK';  // Whether this is a buy or sell order
  price: number;        // The price at this level
  size: number;         // The amount of cryptocurrency available at this price
}

// OrderBookData is the complete order book for a symbol
export interface OrderBookData {
  symbol: string;       // The cryptocurrency symbol (e.g., "BTC-USD")
  mid: number;          // The mid price (average of best bid and ask)
  bids: OrderLevel[];   // All buy orders (sorted high to low)
  asks: OrderLevel[];   // All sell orders (sorted low to high)
}

// Props for the OrderBook component
interface OrderBookProps {
  symbol: string;                                    // Which symbol to display (BTC-USD, ETH-USD, etc.)
  onDataReceived?: (data: OrderBookData) => void;   // Callback when new data is received
}

export const OrderBook = ({ symbol, onDataReceived }: OrderBookProps) => {
  // State management for the order book component
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);  // The order book data
  const [isLoading, setIsLoading] = useState(false);                        // Whether data is being fetched
  const [error, setError] = useState('');                                   // Error message if fetch fails

  // useEffect hook to fetch order book data when component mounts or symbol changes
  useEffect(() => {
    // Async function to fetch order book from the backend
    const fetchOrderBook = async () => {
      setIsLoading(true);  // Show loading state
      setError('');        // Clear any previous errors
      try {
        // Call the backend API to get the order book for this symbol
        // The backend returns bid/ask levels and the mid price
        const response = await apiClient.get(`/orderbook/${symbol}`);
        setOrderBook(response.data);  // Store the order book in state
        onDataReceived?.(response.data);  // Notify parent component of new data
      } catch (err: any) {
        // If the API call fails, show an error message
        setError('Failed to fetch order book');
        console.error(err);
      } finally {
        // Always stop the loading state, whether success or failure
        setIsLoading(false);
      }
    };

    // Fetch order book immediately when component mounts
    fetchOrderBook();

    // Set up automatic refresh every 60 seconds
    // This respects the CoinGecko API rate limit (30 requests/minute)
    // The backend caches prices for 5 minutes with ±0.5% artificial fluctuation
    // This creates smooth, natural price movement without excessive API calls
    const interval = setInterval(fetchOrderBook, 60000);

    // Cleanup: Stop the interval when component unmounts or symbol changes
    return () => clearInterval(interval);
  }, [symbol, onDataReceived]);

  // LOADING STATE - Show spinner while fetching data
  if (isLoading && !orderBook) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          Loading order book...
        </div>
      </div>
    );
  }

  // ERROR STATE - Show error message if API call failed
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // NO DATA STATE - Show message if no data has been fetched yet
  if (!orderBook) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  // DATA VALIDATION - Ensure we have valid bid and ask data
  if (!orderBook.bids || !orderBook.asks || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p>Order book data is incomplete</p>
        </div>
      </div>
    );
  }

  // Calculate the maximum order size for scaling the visual bars
  // This is used to make the bar widths proportional to the largest order
  const maxSize = Math.max(
    ...orderBook.bids.map((b) => b.size || 0).filter(s => s > 0),
    ...orderBook.asks.map((a) => a.size || 0).filter(s => s > 0)
  );

  return (
    <div className="overflow-hidden">
      <div className="p-6">
        {/* Mid Price Highlight */}
        <div className="mb-6 bg-gradient-to-r from-blue-600/25 to-cyan-600/25 border border-blue-500/40 rounded-lg p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Current Mid Price</p>
          <p className="text-4xl font-bold text-white">${(orderBook?.mid ?? 0).toFixed(2)}</p>
          <p className="text-slate-400 text-xs mt-1">{symbol}</p>
        </div>

        {/* Order Book Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Bids (Buy Orders) - Green */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📈</span>
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Buy Orders</h3>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {orderBook.bids.map((level, idx) => {
                const price = level?.price ?? 0;
                const size = level?.size ?? 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm group hover:bg-green-500/10 px-3 py-2 rounded transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-green-400 font-mono font-semibold">${price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="bg-gradient-to-r from-green-500/40 to-green-500/20 rounded h-5 transition-all"
                        style={{
                          width: `${maxSize > 0 ? (size / maxSize) * 100 : 0}%`,
                          minWidth: '30px',
                        }}
                      ></div>
                      <div className="text-slate-300 font-mono text-xs text-right w-14">
                        {size.toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asks (Sell Orders) - Red */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📉</span>
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Sell Orders</h3>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {orderBook.asks.map((level, idx) => {
                const price = level?.price ?? 0;
                const size = level?.size ?? 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm group hover:bg-red-500/10 px-3 py-2 rounded transition-colors cursor-pointer"
                  >
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-red-400 font-mono font-semibold">${price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                      <div className="text-slate-300 font-mono text-xs text-right w-14">
                        {size.toFixed(4)}
                      </div>
                      <div
                        className="bg-gradient-to-l from-red-500/40 to-red-500/20 rounded h-5 transition-all"
                        style={{
                          width: `${maxSize > 0 ? (size / maxSize) * 100 : 0}%`,
                          minWidth: '30px',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spread Info */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>📊 Order Spread</span>
            {orderBook.asks.length > 0 && orderBook.bids.length > 0 && (
              <span className="text-blue-400 font-mono">
                ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
