import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTradingStore } from '../store/tradingStore';
import { OrderBook } from '../components/OrderBook';
import { TradeForm } from '../components/TradeForm';

const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD'];

export const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
  const [currentPrice, setCurrentPrice] = useState(0);
  const navigate = useNavigate();
  const { logout, email } = useAuthStore();
  const { dashboardStats, fetchDashboardStats } = useTradingStore();

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">OMS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Trading Hub</h1>
                <p className="text-xs text-slate-400">Manage your trades</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/analytics"
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg font-medium transition-all cursor-pointer"
              >
                📊 Analytics
              </Link>
              <span className="text-slate-300 text-sm bg-slate-800/50 px-3 py-2 rounded-lg">{email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-medium transition-all border border-red-500/30 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Symbol tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSymbol === symbol
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-1/3 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-5 max-w-7xl mx-auto px-4 py-8">
        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Book */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/30 px-6 py-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📊</span>
                  Order Book {selectedSymbol}
                </h2>
              </div>
              <OrderBook
                symbol={selectedSymbol}
                onDataReceived={(data) => setCurrentPrice(data.mid)}
              />
            </div>
          </div>

          {/* Trade Form */}
          <div>
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden shadow-xl sticky top-8">
              <div className="bg-gradient-to-r from-green-600/25 to-emerald-600/25 px-6 py-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>⚡</span>
                  Place Order
                </h2>
              </div>
              <TradeForm symbol={selectedSymbol} currentPrice={currentPrice} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-blue-500/60 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm">24h Volume</span>
              <span className="text-xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-white">$2.3M</p>
            <p className="text-xs text-green-400 mt-1">+12.5%</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-yellow-500/60 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm">Open Orders</span>
              <span className="text-xl">📋</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {dashboardStats?.open_orders ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(dashboardStats?.open_orders ?? 0) === 0 ? 'No pending orders' : 'Pending'}
            </p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 group hover:border-purple-500/60 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-sm">Portfolio Value</span>
              <span className="text-xl">💼</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${(dashboardStats?.portfolio_value ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(dashboardStats?.portfolio_value ?? 0) > 0 ? 'Holdings' : 'No holdings'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
