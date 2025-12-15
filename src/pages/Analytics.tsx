import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTradingStore } from '../store/tradingStore';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Analytics = () => {
  const navigate = useNavigate();
  const { logout, email } = useAuthStore();
  const { fetchAllTrades, fetchAnalytics, trades, isLoading } = useTradingStore();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTrades();
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get unique symbols from trades
  const symbols = Array.from(new Set(trades.map((t) => t.symbol)));

  // Filter trades by symbol
  const filteredTrades = selectedSymbol
    ? trades.filter((t) => t.symbol === selectedSymbol)
    : trades;

  // Calculate statistics
  // IMPORTANT: Only count FILLED trades for slippage calculations
  // PENDING trades have 0 slippage and would artificially lower the average
  const filledTrades = filteredTrades.filter((t) => t.status === 'FILLED');

  const stats_local = {
    totalTrades: filteredTrades.length,
    fillRate:
      filteredTrades.length > 0
        ? (
            (filledTrades.length / filteredTrades.length) * 100
          ).toFixed(1)
        : '0',
    // Only count executed quantity from FILLED trades
    totalQuantity: filledTrades
      .reduce((sum, t) => sum + (t.exec_qty || 0), 0)
      .toFixed(4),
    // CRITICAL: Only calculate average slippage from FILLED trades
    // PENDING trades have slippage = 0 and would skew the average
    avgSlippage: filledTrades.length > 0
      ? (filledTrades.reduce((sum, t) => sum + (t.slippage_bps || 0), 0) / filledTrades.length).toFixed(2)
      : '0',
    buyTrades: filteredTrades.filter((t) => t.side === 'BUY').length,
    sellTrades: filteredTrades.filter((t) => t.side === 'SELL').length,
  };

  // Chart data for slippage over time
  // IMPORTANT: Only show FILLED trades in the chart
  // PENDING trades have 0 slippage and would distort the visualization
  const slippageChartData = {
    labels: filledTrades
      .slice(-20)
      .reverse()
      .map((t) => new Date(t.exec_created_at || t.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Slippage (bps)',
        data: filledTrades
          .slice(-20)
          .reverse()
          .map((t) => t.slippage_bps || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for buy vs sell
  const buySellChartData = {
    labels: ['Buy Orders', 'Sell Orders'],
    datasets: [
      {
        label: 'Count',
        data: [stats_local.buyTrades, stats_local.sellTrades],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: '#334155',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">OMS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-xs text-slate-400">Trading Performance</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg font-medium transition-all cursor-pointer"
              >
                📊 Trading
              </button>
              <span className="text-slate-300 text-sm bg-slate-800/50 px-3 py-2 rounded-lg">{email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-medium transition-all border border-red-500/30 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-1/3 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-10"></div>
      </div>

      <main className="relative z-5 max-w-7xl mx-auto px-4 py-8">
        {isLoading && trades.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
            <span className="text-4xl block mb-2">📈</span>
            <p className="text-slate-400">No trades yet. Start trading to see analytics!</p>
          </div>
        ) : (
          <>
            {/* Symbol Filter */}
            {symbols.length > 1 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Filter by Symbol</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedSymbol(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                      selectedSymbol === null
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    All
                  </button>
                  {symbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSelectedSymbol(symbol)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                        selectedSymbol === symbol
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-blue-500/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Total Trades</span>
                  <span className="text-lg">📊</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats_local.totalTrades}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-green-500/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Fill Rate</span>
                  <span className="text-lg">✅</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats_local.fillRate}%</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-purple-500/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Total Quantity</span>
                  <span className="text-lg">📦</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats_local.totalQuantity}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-orange-500/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Slippage</span>
                  <span className="text-lg">📉</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">{stats_local.avgSlippage} bps</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-red-500/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Buy vs Sell</span>
                  <span className="text-lg">⚖️</span>
                </div>
                <p className="text-lg font-bold">
                  <span className="text-green-400">{stats_local.buyTrades}</span>
                  {' '}/{' '}
                  <span className="text-red-400">{stats_local.sellTrades}</span>
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📈</span>
                  Slippage Trend
                </h3>
                <div className="h-80">
                  <Line data={slippageChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Buy vs Sell Distribution
                </h3>
                <div className="h-80">
                  <Bar data={buySellChartData} options={chartOptions} />
                </div>
              </div>
            </div>
            {/* Trade History */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span>
                Trade History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Symbol</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Side</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Qty</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Expected Price</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Execution Price</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Slippage</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.map((trade, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-white font-mono font-semibold">{trade.symbol}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              trade.side === 'BUY'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{trade.exec_qty?.toFixed(4)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              trade.status === 'FILLED'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {trade.status}
                          </span>
                        </td>
                        {/* Expected Price (arrival_mid) */}
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          ${trade.arrival_mid?.toFixed(2) || 'N/A'}
                        </td>
                        {/* Execution Price - only show if filled */}
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {trade.status === 'FILLED' ? `$${trade.exec_price?.toFixed(2)}` : 'Pending'}
                        </td>
                        {/* Slippage - only show if filled */}
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {trade.status === 'FILLED' ? (
                            <span className={trade.slippage_bps! > 0 ? 'text-red-400' : 'text-green-400'}>
                              {trade.slippage_bps?.toFixed(2)} bps
                            </span>
                          ) : (
                            <span className="text-slate-500">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(trade.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
