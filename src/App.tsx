import React, { useState, useEffect } from 'react';
import {
  STOCKS_DATA,
  MAJOR_INDICES,
  Stock,
  IndexData,
} from './data/stocksData';
import { TickerTape } from './components/TickerTape';
import { HeaderNav } from './components/HeaderNav';
import { IndexCard } from './components/IndexCard';
import { StockHeatmap } from './components/StockHeatmap';
import { StockScreenerTable } from './components/StockScreenerTable';
import { SectorPerformance } from './components/SectorPerformance';
import { SuperChartModal } from './components/SuperChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { FinancialNewsSection } from './components/FinancialNewsSection';
import { Activity, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(STOCKS_DATA);
  const [indices, setIndices] = useState<IndexData[]>(MAJOR_INDICES);
  const [currentTab, setCurrentTab] = useState<string>('stocks');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(['NVDA', 'AAPL', 'TSLA', 'PLTR', 'MSFT']);
  const [portfolioBalance, setPortfolioBalance] = useState<number>(100000.0);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Synchronize Dark / Light mode class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-[#f0f3fa]', 'text-[#131722]');
      document.body.classList.add('bg-[#131722]', 'text-[#d1d4dc]');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-[#131722]', 'text-[#d1d4dc]');
      document.body.classList.add('bg-[#f0f3fa]', 'text-[#131722]');
    }
  }, [isDark]);

  // Gentle real-time price tick simulation to give TradingView live market pulsation
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => {
        // Pick 1-2 random stocks to slightly tick
        const randomIndex = Math.floor(Math.random() * prevStocks.length);
        return prevStocks.map((stock, i) => {
          if (i !== randomIndex) return stock;
          const delta = (Math.random() - 0.49) * 0.25;
          const newPrice = +(stock.price + delta).toFixed(2);
          const newChange = +(stock.change + delta).toFixed(2);
          const newChangePercent = +((newChange / (newPrice - newChange)) * 100).toFixed(2);
          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleExecuteTrade = (trade: {
    symbol: string;
    shares: number;
    action: 'BUY' | 'SELL';
    price: number;
  }) => {
    const cost = trade.shares * trade.price;
    if (trade.action === 'BUY') {
      setPortfolioBalance(prev => Math.max(0, prev - cost));
    } else {
      setPortfolioBalance(prev => prev + cost);
    }
  };

  const handleOpenIndexChart = (index: IndexData) => {
    // Find matching stock or mock equivalent
    const matchingStock = stocks.find(s => s.symbol === 'NVDA') || stocks[0];
    setSelectedStock(matchingStock);
  };

  return (
    <div className="min-h-screen bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722] flex flex-col font-sans transition-colors">
      {/* 1. Real-Time Market Ticker Tape */}
      <TickerTape
        onSelectSymbol={symbol => {
          const found = stocks.find(s => s.symbol === symbol);
          if (found) setSelectedStock(found);
        }}
      />

      {/* 2. Top Header Navigation (TradingView 3-zone contract) */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={tab => {
          setCurrentTab(tab);
          const el = document.getElementById(tab);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onToggleWatchlist={() => setIsWatchlistOpen(prev => !prev)}
        watchlistCount={watchlist.length}
        portfolioBalance={portfolioBalance}
        onSelectStock={stock => setSelectedStock(stock)}
      />

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Market Status & Hero Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-[#131722] tracking-tight">
                US Stock Markets Overview
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#089981]/15 text-[#089981] border border-[#089981]/25">
                <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
                Regular Trading Hours
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#787b86] mt-1">
              Live market indices, sector heatmaps, top gainers, and high-frequency real-time stock quotes.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#787b86]">
            <div className="flex items-center gap-1.5 bg-[#1e222d] dark:bg-[#1e222d] light:bg-white px-3 py-1.5 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <Clock className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>NYSE: 09:30 - 16:00 EST</span>
            </div>
          </div>
        </div>

        {/* 3. Major Indices Cards (S&P 500, Nasdaq 100, Dow 30, Russell 2000) */}
        <section id="indices" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#787b86] uppercase tracking-wider">
              Major Benchmark Indices
            </h2>
            <span className="text-xs text-[#787b86]">Updated real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {indices.map(index => (
              <IndexCard
                key={index.symbol}
                index={index}
                onOpenChart={handleOpenIndexChart}
              />
            ))}
          </div>
        </section>

        {/* 4. Interactive Stock Heatmap Section */}
        <section id="heatmaps">
          <StockHeatmap
            stocks={stocks}
            onSelectStock={stock => setSelectedStock(stock)}
          />
        </section>

        {/* 5. Stock Screener & Market Movers Table */}
        <section id="screener" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white dark:text-white light:text-[#131722] tracking-tight">
                Stock Screener & Market Movers
              </h2>
              <p className="text-xs text-[#787b86]">
                Track volume leaders, daily percentage gainers, and technical ratings
              </p>
            </div>
          </div>

          <StockScreenerTable
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectStock={stock => setSelectedStock(stock)}
          />
        </section>

        {/* 6. Sector Performance Breakdown */}
        <section id="sectors">
          <SectorPerformance
            onSelectSector={sectorName => {
              const el = document.getElementById('screener');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* 7. Breaking News & Sentiment Index */}
        <section id="news">
          <FinancialNewsSection />
        </section>
      </main>

      {/* 8. SuperChart Interactive Modal View */}
      {selectedStock && (
        <SuperChartModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          isWatchlisted={watchlist.includes(selectedStock.symbol)}
          onToggleWatchlist={handleToggleWatchlist}
          portfolioBalance={portfolioBalance}
          onExecuteTrade={handleExecuteTrade}
        />
      )}

      {/* 9. TradingView Right Sidebar Drawer (Watchlist & Alerts) */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlist}
        allStocks={stocks}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onSelectStock={stock => setSelectedStock(stock)}
      />

      {/* Global Footer matching TradingView's clean aesthetic */}
      <footer className="mt-12 border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] py-6 px-6 bg-[#131722] dark:bg-[#131722] light:bg-white text-xs text-[#787b86]">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center text-white text-[10px] font-bold">
              TV
            </div>
            <span className="font-semibold text-white dark:text-white light:text-[#131722]">
              TradingView Markets Clone
            </span>
            <span>·</span>
            <span>Live Stock Quotes, Heatmaps & Paper Trading</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Market Data provided for simulation and analysis</span>
            <span className="font-mono">NYSE · NASDAQ · CBOE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
