import React, { useState, useMemo } from 'react';
import { Stock } from '../data/stocksData';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  ArrowUpDown,
  Search,
  Maximize2,
  Check,
} from 'lucide-react';

interface StockScreenerTableProps {
  stocks: Stock[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: Stock) => void;
}

type TabType =
  | 'most-active'
  | 'top-gainers'
  | 'top-losers'
  | '52w-high'
  | 'high-dividend'
  | 'all';

type SortField = 'price' | 'changePercent' | 'volumeNumeric' | 'marketCapNumeric' | 'peRatio';
type SortOrder = 'asc' | 'desc';

export const StockScreenerTable: React.FC<StockScreenerTableProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('top-gainers');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'top-gainers', label: 'Top Gainers' },
    { id: 'top-losers', label: 'Top Losers' },
    { id: 'most-active', label: 'Most Active' },
    { id: '52w-high', label: '52-Week High' },
    { id: 'high-dividend', label: 'High Dividend' },
    { id: 'all', label: 'All Stocks' },
  ];

  const sectors = useMemo(() => {
    return ['All', ...Array.from(new Set(stocks.map(s => s.sector)))];
  }, [stocks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const processedStocks = useMemo(() => {
    let result = [...stocks];

    // Filter by tab category
    if (activeTab === 'top-gainers') {
      result = result.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === 'top-losers') {
      result = result.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
    } else if (activeTab === 'most-active') {
      result = result.sort((a, b) => b.volumeNumeric - a.volumeNumeric);
    } else if (activeTab === '52w-high') {
      result = result
        .filter(s => s.price >= s.high52 * 0.95)
        .sort((a, b) => b.price / b.high52 - a.price / a.high52);
    } else if (activeTab === 'high-dividend') {
      result = result.filter(s => s.dividendYield > 0.5).sort((a, b) => b.dividendYield - a.dividendYield);
    }

    // Filter by sector
    if (sectorFilter !== 'All') {
      result = result.filter(s => s.sector === sectorFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        s =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // Sort if manually clicked header
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
    }

    return result;
  }, [stocks, activeTab, sectorFilter, searchTerm, sortField, sortOrder]);

  const renderSparkline = (data: number[], positive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 72;
    const h = 24;
    const step = w / (data.length - 1);

    const points = data
      .map((val, idx) => {
        const x = idx * step;
        const y = h - ((val - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = positive ? '#089981' : '#f23645';

    return (
      <svg className="w-18 h-6 overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const getRatingBadge = (rating: Stock['rating']) => {
    switch (rating) {
      case 'Strong Buy':
        return (
          <span className="text-[11px] font-semibold text-[#089981] bg-[#089981]/15 px-2 py-0.5 rounded">
            Strong Buy
          </span>
        );
      case 'Buy':
        return (
          <span className="text-[11px] font-semibold text-[#22ab94] bg-[#22ab94]/15 px-2 py-0.5 rounded">
            Buy
          </span>
        );
      case 'Neutral':
        return (
          <span className="text-[11px] font-semibold text-[#787b86] bg-[#787b86]/15 px-2 py-0.5 rounded">
            Neutral
          </span>
        );
      case 'Sell':
      case 'Strong Sell':
        return (
          <span className="text-[11px] font-semibold text-[#f23645] bg-[#f23645]/15 px-2 py-0.5 rounded">
            {rating}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] overflow-hidden">
      {/* Screener Tabs Bar */}
      <div className="px-4 pt-3 pb-2 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-[#d1d4dc] light:hover:text-[#131722] hover:bg-[#131722]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls: In-table search & Sector */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter table..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] text-xs text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722] pl-8 pr-3 py-1.5 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] outline-none focus:border-[#2962ff] w-36 sm:w-44"
            />
          </div>

          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] text-xs font-medium text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722] px-2.5 py-1.5 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] outline-none cursor-pointer"
          >
            {sectors.map(s => (
              <option key={s} value={s} className="bg-[#1e222d] text-white">
                {s === 'All' ? 'All Sectors' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] bg-[#131722]/40 dark:bg-[#131722]/40 light:bg-[#f8f9fc] text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
              <th className="py-2.5 pl-4 pr-2 w-8"></th>
              <th className="py-2.5 px-3">Symbol & Name</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  Price ($)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('changePercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  Change %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Change ($)</th>
              <th className="py-2.5 px-3 text-center">Tech Rating</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('volumeNumeric')}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('marketCapNumeric')}
              >
                <div className="flex items-center justify-end gap-1">
                  Market Cap
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white hidden lg:table-cell"
                onClick={() => handleSort('peRatio')}
              >
                <div className="flex items-center justify-end gap-1">
                  P/E (TTM)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">1D Trend</th>
              <th className="py-2.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb] text-xs">
            {processedStocks.map(stock => {
              const isPositive = stock.change >= 0;
              const isWatchlisted = watchlist.includes(stock.symbol);

              return (
                <tr
                  key={stock.symbol}
                  className="hover:bg-[#2a2e39]/30 dark:hover:bg-[#2a2e39]/30 light:hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onSelectStock(stock)}
                >
                  {/* Star / Watchlist Toggle */}
                  <td
                    className="py-3 pl-4 pr-2 text-center"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleWatchlist(stock.symbol);
                    }}
                  >
                    <button
                      className="p-1 text-[#787b86] hover:text-[#2962ff] transition-colors cursor-pointer"
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isWatchlisted
                            ? 'fill-[#2962ff] text-[#2962ff]'
                            : 'text-[#787b86] hover:text-white'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Symbol & Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={stock.logo}
                        alt={stock.name}
                        className="w-7 h-7 rounded-full bg-white/10 p-0.5 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white dark:text-white light:text-[#131722] tracking-tight group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-[#787b86] font-mono px-1 bg-[#131722] rounded">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787b86] truncate max-w-[150px] sm:max-w-[200px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-white dark:text-white light:text-[#131722]">
                    ${stock.price.toFixed(2)}
                  </td>

                  {/* Change % */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* Change $ */}
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums font-medium ${
                      isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {stock.change.toFixed(2)}
                  </td>

                  {/* Technical Rating */}
                  <td className="py-3 px-3 text-center">
                    {getRatingBadge(stock.rating)}
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                    {stock.volume}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                    {stock.marketCap}
                  </td>

                  {/* P/E Ratio */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden lg:table-cell">
                    {stock.peRatio.toFixed(1)}
                  </td>

                  {/* 1D Sparkline */}
                  <td className="py-3 px-3 text-center hidden md:table-cell">
                    {renderSparkline(stock.sparkline, isPositive)}
                  </td>

                  {/* SuperChart Button Action */}
                  <td
                    className="py-3 pr-4 pl-2 text-right"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectStock(stock);
                    }}
                  >
                    <button
                      className="px-2.5 py-1 text-xs font-semibold text-[#2962ff] bg-[#2962ff]/10 hover:bg-[#2962ff] hover:text-white rounded-md transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                      title="Open full SuperChart"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Chart</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-[#131722]/40 dark:bg-[#131722]/40 light:bg-[#f8f9fc] border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex items-center justify-between text-xs text-[#787b86]">
        <span>Showing {processedStocks.length} equities</span>
        <span>Real-time continuous feed simulated via NASDAQ / NYSE</span>
      </div>
    </div>
  );
};
