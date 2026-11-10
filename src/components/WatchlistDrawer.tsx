import React, { useState } from 'react';
import { Stock, FINANCIAL_NEWS } from '../data/stocksData';
import {
  X,
  Bookmark,
  Bell,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  Maximize2,
} from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  allStocks: Stock[];
  onRemoveFromWatchlist: (symbol: string) => void;
  onSelectStock: (stock: Stock) => void;
}

interface AlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'GREATER' | 'LESS';
  active: boolean;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  allStocks,
  onRemoveFromWatchlist,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts' | 'news'>('watchlist');

  // Price alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: '1', symbol: 'NVDA', targetPrice: 155.0, condition: 'GREATER', active: true },
    { id: '2', symbol: 'TSLA', targetPrice: 350.0, condition: 'GREATER', active: true },
    { id: '3', symbol: 'AAPL', targetPrice: 220.0, condition: 'LESS', active: true },
  ]);
  const [newAlertSymbol, setNewAlertSymbol] = useState('NVDA');
  const [newAlertPrice, setNewAlertPrice] = useState('160.00');

  if (!isOpen) return null;

  const watchlistedStocks = allStocks.filter(s => watchlistSymbols.includes(s.symbol));

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertPrice) return;
    const numPrice = parseFloat(newAlertPrice);
    if (isNaN(numPrice)) return;

    setAlerts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        symbol: newAlertSymbol,
        targetPrice: numPrice,
        condition: 'GREATER',
        active: true,
      },
    ]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#1e222d] dark:bg-[#1e222d] light:bg-white border-l border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-4 py-3.5 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex items-center justify-between bg-[#131722]/50 dark:bg-[#131722]/50 light:bg-[#f8f9fc]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Watchlist ({watchlistedStocks.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            News
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {watchlistedStocks.length > 0 ? (
            watchlistedStocks.map(stock => {
              const isPositive = stock.change >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className="bg-[#131722]/60 dark:bg-[#131722]/60 light:bg-[#f8f9fc] hover:bg-[#2a2e39]/60 border border-[#2a2e39]/60 dark:border-[#2a2e39]/60 light:border-[#e0e3eb] rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={stock.logo}
                      alt={stock.name}
                      className="w-6 h-6 rounded-full bg-white/10 p-0.5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] font-mono">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#787b86] truncate max-w-[110px] block">
                        {stock.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono tabular-nums text-sm font-semibold text-white">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`font-mono tabular-nums text-xs font-semibold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(stock.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] rounded transition-opacity cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#787b86]">
              <Bookmark className="w-8 h-8 mx-auto text-[#787b86]/40 mb-2" />
              Your watchlist is currently empty. Click the bookmark icon next to any stock to track it here.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Price Alerts */}
      {activeTab === 'alerts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <form onSubmit={handleAddAlert} className="bg-[#131722]/60 p-3 rounded-xl border border-[#2a2e39] space-y-2.5">
            <span className="text-xs font-bold text-white block">Create Price Trigger</span>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newAlertSymbol}
                onChange={e => setNewAlertSymbol(e.target.value)}
                className="bg-[#1e222d] text-xs text-white p-2 rounded-lg border border-[#2a2e39] outline-none"
              >
                {allStocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} (${s.price.toFixed(2)})
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                placeholder="Target Price"
                value={newAlertPrice}
                onChange={e => setNewAlertPrice(e.target.value)}
                className="bg-[#1e222d] text-xs text-white p-2 rounded-lg border border-[#2a2e39] outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-[#2962ff] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#1e53e5] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Alert
            </button>
          </form>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#787b86] uppercase tracking-wider block">
              Active Alerts ({alerts.length})
            </span>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="bg-[#131722]/50 p-2.5 rounded-lg border border-[#2a2e39] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{alert.symbol}</span>
                  <span className="text-[#787b86] ml-2">
                    {alert.condition === 'GREATER' ? 'Crosses above' : 'Crosses below'} ${alert.targetPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                      alert.active ? 'bg-[#089981]' : 'bg-[#787b86]'
                    }`}
                  >
                    <span
                      className={`block w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${
                        alert.active ? 'left-3.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 text-[#787b86] hover:text-[#f23645] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: News Feed */}
      {activeTab === 'news' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {FINANCIAL_NEWS.map(item => (
            <div
              key={item.id}
              className="bg-[#131722]/60 p-3 rounded-xl border border-[#2a2e39] space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-[#787b86]">
                <span>{item.source}</span>
                <span>{item.timeAgo}</span>
              </div>
              <h5 className="font-bold text-xs text-white hover:text-[#2962ff] transition-colors">
                {item.title}
              </h5>
              <p className="text-[11px] text-[#787b86] line-clamp-2">
                {item.summary}
              </p>
              <div className="flex items-center gap-1 pt-1">
                {item.relatedSymbols.map(sym => (
                  <span
                    key={sym}
                    className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#1e222d] text-[#2962ff]"
                  >
                    ${sym}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer Footer */}
      <div className="p-3 border-t border-[#2a2e39] text-center text-[11px] text-[#787b86] bg-[#131722]/50">
        TradingView Real-Time Market Monitor
      </div>
    </div>
  );
};
