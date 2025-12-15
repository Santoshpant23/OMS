import { useState } from 'react';
import { useTradingStore } from '../store/tradingStore';

interface TradeFormProps {
  symbol: string;
  currentPrice: number;
  onSuccess?: () => void;
}

export const TradeForm = ({ symbol, currentPrice, onSuccess }: TradeFormProps) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const { submitTrade, isLoading, error, lastOrder } = useTradingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await submitTrade({
        symbol,
        side,
        type,
        quantity: parseFloat(quantity),
        limit_price: type === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      });
      
      // Reset form
      setQuantity('');
      setLimitPrice('');
      onSuccess?.();
    } catch (err) {
      // Error is handled by store
    }
  };

  const estimatedTotal = currentPrice * parseFloat(quantity || '0');

  return (
    <div className="p-6 space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-4 flex items-start gap-3">
          <span className="text-lg">❌</span>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {lastOrder && (
        <div className="bg-green-500/15 border border-green-500/40 rounded-lg p-4 flex items-start gap-3">
          <span className="text-lg">✅</span>
          <div className="text-green-300 text-sm">
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-xs text-green-300 mt-1">Execution Price: ${lastOrder.exec_price.toFixed(2)} • Slippage: {lastOrder.slippage.toFixed(4)}%</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer ${
              side === 'BUY'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            <span>📈</span>
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer ${
              side === 'SELL'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            <span>📉</span>
            SELL
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Order Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('MARKET')}
              className={`py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                type === 'MARKET'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setType('LIMIT')}
              className={`py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                type === 'LIMIT'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Quantity ({symbol})
          </label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            placeholder="0.0000"
            required
          />
        </div>

        {/* Limit Price (if LIMIT order) */}
        {type === 'LIMIT' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Limit Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              placeholder="0.00"
              required
            />
          </div>
        )}

        {/* Price Info Card */}
        <div className="bg-slate-700/40 border border-slate-600/60 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Current Price</span>
            <span className="font-mono font-semibold text-blue-400">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-600/40 pt-2 flex justify-between items-center">
            <span className="text-slate-300">Est. Total</span>
            <span className={`font-mono font-semibold ${estimatedTotal > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          } ${
            side === 'BUY'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white shadow-lg shadow-green-600/30'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-600 disabled:to-slate-600 text-white shadow-lg shadow-red-600/30'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <span>{side === 'BUY' ? '📈' : '📉'}</span>
              {side} {symbol}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
