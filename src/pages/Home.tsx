import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { AuthStore } from '../store/authStore';

export const Home = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state: AuthStore) => state.token);
  const userId = useAuthStore((state: AuthStore) => state.userId);
  const isAuthenticated = !!token && !!userId;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">OMS</span>
            </div>
            <span className="font-bold text-lg text-white">OMS Trading</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-15"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Professional Trading
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Experience the next generation of Order Management System with real-time order books and advanced trading tools
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all hover:shadow-2xl shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border border-blue-500/60 hover:border-blue-400 text-blue-300 hover:text-blue-200 font-semibold rounded-lg transition-all hover:bg-blue-500/15 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '📊',
                title: 'Real-time Order Book',
                description: 'View live bid/ask orders with professional visualizations updated in real-time',
              },
              {
                icon: '⚡',
                title: 'Fast Execution',
                description: 'Execute market and limit orders instantly with minimal latency',
              },
              {
                icon: '📈',
                title: 'Advanced Analytics',
                description: 'Track performance metrics, slippage analysis, and detailed trading history',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/60 p-8 rounded-lg transition-all hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            {[
              { value: '1M+', label: 'Trades' },
              { value: '24/7', label: 'Uptime' },
              { value: '3', label: 'Assets' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                <div className="text-slate-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust Section */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Why Choose OMS?</h3>
            <ul className="space-y-3 text-slate-300 text-sm text-left">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Professional-grade trading platform designed for serious traders</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Secure authentication with JWT tokens and encrypted data</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Detailed analytics and performance tracking for every trade</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-md py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>&copy; 2025 OMS Trading. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
