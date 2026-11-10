import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bookmark, Globe, X } from 'lucide-react';
import { STOCKS_DATA, Stock } from '../data/stocksData';

interface HeaderNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  portfolioBalance: number;
  onSelectStock: (stock: Stock) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onToggleWatchlist,
  watchlistCount,
  portfolioBalance,
  onSelectStock,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSearchResults = searchQuery.trim()
    ? STOCKS_DATA.filter(
        s =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : STOCKS_DATA.slice(0, 6);

  const navLinks = [
    { id: 'stocks', label: 'Stocks' },
    { id: 'heatmaps', label: 'Heatmaps' },
    { id: 'screener', label: 'Screener' },
    { id: 'sectors', label: 'Sectors' },
    { id: 'news', label: 'News & Insights' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#131722] dark:bg-[#131722] light:bg-white border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] px-4 md:px-6 py-2.5 transition-colors">
        <div className="flex items-center justify-between gap-6 max-w-[1600px] mx-auto">
          {/* Zone 1: TradingView Brand Logo & Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => onTabChange('stocks')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center shadow-sm">
                {/* TradingView signature TV waveform / bars logo mark */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white fill-current"
                >
                  <path d="M4 16h3V8H4v8zm5 4h3V4H9v16zm5-8h3v-4h-3v4zm5 4h3V6h-3v10z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white dark:text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors whitespace-nowrap">
                  TradingView <span className="font-medium text-xs text-[#787b86] dark:text-[#787b86] light:text-[#6a6d78] ml-1">Markets</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map(link => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#6a6d78] hover:text-white dark:hover:text-white light:hover:text-[#131722] hover:bg-[#1e222d] dark:hover:bg-[#1e222d] light:hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search, Tools, Country, Theme & Watchlist */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e222d] dark:bg-[#1e222d] light:bg-[#f0f3fa] text-xs text-[#787b86] hover:text-[#d1d4dc] border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] hover:border-[#787b86] transition-all cursor-pointer whitespace-nowrap"
              title="Search stocks, indices, crypto (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#787b86]" />
              <span className="hidden sm:inline">Search markets...</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] bg-[#131722] dark:bg-[#131722] light:bg-white px-1.5 py-0.5 rounded border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
                ⌘K
              </kbd>
            </button>

            {/* Country Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-[#1e222d] dark:bg-[#1e222d] light:bg-[#f0f3fa] px-2 py-1 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] text-xs font-medium text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
              <Globe className="w-3.5 h-3.5 text-[#787b86]" />
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-xs"
              >
                <option value="US" className="bg-[#1e222d] text-white">US Market</option>
                <option value="UK" className="bg-[#1e222d] text-white">UK Market</option>
                <option value="JP" className="bg-[#1e222d] text-white">Japan</option>
                <option value="DE" className="bg-[#1e222d] text-white">Germany</option>
                <option value="GLOBAL" className="bg-[#1e222d] text-white">Global</option>
              </select>
            </div>

            {/* Demo Paper Portfolio Balance Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#1e222d] dark:bg-[#1e222d] light:bg-[#f0f3fa] px-2.5 py-1 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] text-xs">
              <span className="text-[#787b86]">Paper Cash:</span>
              <span className="font-mono tabular-nums font-semibold text-[#089981]">
                ${portfolioBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-[#d1d4dc] light:hover:text-[#131722] hover:bg-[#1e222d] dark:hover:bg-[#1e222d] light:hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Watchlist Drawer Toggle */}
            <button
              onClick={onToggleWatchlist}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2962ff]/10 hover:bg-[#2962ff]/20 text-[#2962ff] text-xs font-semibold border border-[#2962ff]/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Open Watchlist & Detail View"
            >
              <Bookmark className="w-3.5 h-3.5 fill-[#2962ff]" />
              <span className="hidden sm:inline">Watchlist</span>
              <span className="font-mono tabular-nums bg-[#2962ff] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {watchlistCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal (Cmd+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#1e222d] dark:bg-[#1e222d] light:bg-white border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <Search className="w-4 h-4 text-[#787b86] mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search symbol, company name, or sector (e.g. NVDA, Apple, Tech)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722] placeholder-[#787b86]"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#787b86] hover:text-[#d1d4dc] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#2a2e39]/40 dark:divide-[#2a2e39]/40 light:divide-[#e0e3eb]/40 p-1">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#2a2e39]/60 dark:hover:bg-[#2a2e39]/60 light:hover:bg-slate-100 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stock.logo}
                        alt={stock.name}
                        className="w-7 h-7 rounded-full bg-white/10 p-0.5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white dark:text-white light:text-[#131722]">
                            {stock.symbol}
                          </span>
                          <span className="text-[11px] text-[#787b86] uppercase">
                            {stock.exchange}
                          </span>
                        </div>
                        <span className="text-xs text-[#787b86] truncate max-w-xs block">
                          {stock.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono tabular-nums text-sm font-semibold text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`font-mono tabular-nums text-xs font-medium ${
                          stock.change >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-[#787b86]">
                  No matching stocks found for "{searchQuery}".
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-[#131722]/50 dark:bg-[#131722]/50 light:bg-[#f0f3fa] text-[11px] text-[#787b86] flex items-center justify-between border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <span>Search stocks & crypto</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
