import React, { useState } from 'react';
import { Stock } from '../data/stocksData';
import { TrendingUp, TrendingDown, Layers, Filter } from 'lucide-react';

interface StockHeatmapProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const StockHeatmap: React.FC<StockHeatmapProps> = ({
  stocks,
  onSelectStock,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter stocks by sector
  const filteredStocks = sectorFilter === 'All'
    ? stocks
    : stocks.filter(s => s.sector === sectorFilter);

  // Group stocks by sector
  const sectorsList = Array.from(new Set(stocks.map(s => s.sector)));
  const groupedBySector = sectorsList.reduce<Record<string, Stock[]>>((acc, sector) => {
    const items = filteredStocks.filter(s => s.sector === sector);
    if (items.length > 0) {
      acc[sector] = items;
    }
    return acc;
  }, {});

  // Compute performance multiplier for demo timeframes
  const getTimeframeChange = (stock: Stock) => {
    switch (selectedTimeframe) {
      case '1W':
        return +(stock.changePercent * 2.1).toFixed(2);
      case '1M':
        return +(stock.changePercent * 4.3).toFixed(2);
      case 'YTD':
        return +(stock.changePercent * 8.6).toFixed(2);
      case '1D':
      default:
        return stock.changePercent;
    }
  };

  // Get background color based on percentage change (TradingView standard palette)
  const getPerformanceBg = (change: number) => {
    if (change >= 4.0) return 'bg-[#089981] hover:brightness-110 text-white';
    if (change >= 2.0) return 'bg-[#0bb297] hover:brightness-110 text-white';
    if (change >= 0.5) return 'bg-[#188876] hover:brightness-110 text-white';
    if (change >= 0) return 'bg-[#20675c] hover:brightness-110 text-white';
    if (change >= -0.5) return 'bg-[#6d2a32] hover:brightness-110 text-white';
    if (change >= -2.0) return 'bg-[#a32b35] hover:brightness-110 text-white';
    if (change >= -4.0) return 'bg-[#d82a38] hover:brightness-110 text-white';
    return 'bg-[#f23645] hover:brightness-110 text-white';
  };

  const handleMouseMove = (e: React.MouseEvent, stock: Stock) => {
    setHoveredStock(stock);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] overflow-hidden">
      {/* Heatmap Header & Controls */}
      <div className="p-4 md:p-5 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2962ff]" />
            <h2 className="text-lg font-bold text-white dark:text-white light:text-[#131722] tracking-tight">
              S&P 500 Market Heatmap
            </h2>
          </div>
          <p className="text-xs text-[#787b86] mt-0.5">
            Sized by market capitalization, colored by price performance
          </p>
        </div>

        {/* Controls: Timeframe & Sector Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] p-1 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
            {(['1D', '1W', '1M', 'YTD'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-[#d1d4dc] light:hover:text-[#131722]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Sector Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] px-3 py-1.5 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] text-xs font-medium text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
            <Filter className="w-3.5 h-3.5 text-[#787b86]" />
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-[#1e222d] text-white">All Sectors</option>
              {sectorsList.map(sec => (
                <option key={sec} value={sec} className="bg-[#1e222d] text-white">
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="px-5 py-2.5 bg-[#131722]/60 dark:bg-[#131722]/60 light:bg-[#f0f3fa] border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex flex-wrap items-center justify-between text-xs text-[#787b86]">
        <div className="flex items-center gap-1.5">
          <span>Performance:</span>
          <div className="flex items-center gap-1 ml-1">
            <span className="w-5 h-3.5 rounded bg-[#f23645] inline-block" title="-4% or worse" />
            <span className="w-5 h-3.5 rounded bg-[#d82a38] inline-block" />
            <span className="w-5 h-3.5 rounded bg-[#a32b35] inline-block" />
            <span className="w-5 h-3.5 rounded bg-[#6d2a32] inline-block" />
            <span className="text-[10px] px-1 font-mono">0%</span>
            <span className="w-5 h-3.5 rounded bg-[#20675c] inline-block" />
            <span className="w-5 h-3.5 rounded bg-[#188876] inline-block" />
            <span className="w-5 h-3.5 rounded bg-[#0bb297] inline-block" />
            <span className="w-5 h-3.5 rounded bg-[#089981] inline-block" title="+4% or more" />
          </div>
        </div>
        <div className="text-[11px]">
          Showing <span className="font-semibold text-white dark:text-white light:text-[#131722]">{filteredStocks.length}</span> top US equities
        </div>
      </div>

      {/* Main Heatmap Treemap View */}
      <div className="p-4 md:p-5 min-h-[460px] flex flex-col gap-4">
        {Object.entries(groupedBySector).map(([sectorName, sectorStocks]) => {
          // Sector aggregate market cap
          const totalSectorCap = sectorStocks.reduce((sum, s) => sum + s.marketCapNumeric, 0);

          return (
            <div
              key={sectorName}
              className="bg-[#131722]/40 dark:bg-[#131722]/40 light:bg-[#f8f9fc] rounded-lg p-2.5 border border-[#2a2e39]/60 dark:border-[#2a2e39]/60 light:border-[#e0e3eb]"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722] uppercase tracking-wider">
                  {sectorName}
                </span>
                <span className="text-[11px] text-[#787b86]">
                  {sectorStocks.length} Stocks · ${(totalSectorCap / 1000).toFixed(2)}T Cap
                </span>
              </div>

              {/* Flex Treemap layout proportional to Market Cap */}
              <div className="flex flex-wrap gap-1.5 w-full">
                {sectorStocks.map(stock => {
                  const chg = getTimeframeChange(stock);
                  // Calculate relative weight (min width 90px, max flex-grow based on market cap)
                  const flexWeight = Math.max(1, Math.round(stock.marketCapNumeric / 300));
                  const bgClass = getPerformanceBg(chg);

                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      onMouseMove={e => handleMouseMove(e, stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      style={{
                        flex: `${flexWeight} 1 ${flexWeight > 3 ? '180px' : '100px'}`,
                        minHeight: flexWeight > 4 ? '110px' : '82px',
                      }}
                      className={`${bgClass} rounded-md p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden group text-left`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={stock.logo}
                            alt=""
                            className="w-4 h-4 rounded-full bg-white/20 p-0.5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-bold text-sm leading-none drop-shadow-sm tracking-tight">
                            {stock.symbol}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80 font-mono">
                          {stock.marketCap}
                        </span>
                      </div>

                      <div className="mt-1">
                        <div className="font-mono tabular-nums text-xs font-semibold drop-shadow-sm">
                          ${stock.price.toFixed(2)}
                        </div>
                        <div className="font-mono tabular-nums text-xs font-bold flex items-center gap-0.5 mt-0.5">
                          {chg >= 0 ? '+' : ''}
                          {chg.toFixed(2)}%
                        </div>
                      </div>

                      {/* Quiet company name on larger tiles */}
                      {flexWeight > 3 && (
                        <div className="text-[10px] opacity-75 truncate mt-1">
                          {stock.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip matching TradingView's inspection card */}
      {hoveredStock && (
        <div
          className="fixed z-50 pointer-events-none bg-[#1e222d] text-[#d1d4dc] border border-[#2a2e39] rounded-xl p-3.5 shadow-2xl w-64 backdrop-blur-md"
          style={{
            top: `${Math.min(window.innerHeight - 240, tooltipPos.y + 15)}px`,
            left: `${Math.min(window.innerWidth - 280, tooltipPos.x + 15)}px`,
          }}
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#2a2e39]">
            <img
              src={hoveredStock.logo}
              alt={hoveredStock.name}
              className="w-6 h-6 rounded-full bg-white/10 p-0.5 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                {hoveredStock.symbol}
                <span className="text-[10px] font-normal text-[#787b86]">
                  {hoveredStock.exchange}
                </span>
              </div>
              <div className="text-xs text-[#787b86] truncate max-w-[170px]">
                {hoveredStock.name}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            <div>
              <span className="text-[#787b86] block text-[11px]">Price</span>
              <span className="font-mono tabular-nums font-bold text-white">
                ${hoveredStock.price.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[#787b86] block text-[11px]">Change ({selectedTimeframe})</span>
              <span
                className={`font-mono tabular-nums font-bold ${
                  getTimeframeChange(hoveredStock) >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {getTimeframeChange(hoveredStock) >= 0 ? '+' : ''}
                {getTimeframeChange(hoveredStock).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[#787b86] block text-[11px]">Market Cap</span>
              <span className="font-mono tabular-nums text-white">
                {hoveredStock.marketCap}
              </span>
            </div>
            <div>
              <span className="text-[#787b86] block text-[11px]">Volume</span>
              <span className="font-mono tabular-nums text-white">
                {hoveredStock.volume}
              </span>
            </div>
            <div>
              <span className="text-[#787b86] block text-[11px]">P/E Ratio</span>
              <span className="font-mono tabular-nums text-white">
                {hoveredStock.peRatio.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-[#787b86] block text-[11px]">Tech Rating</span>
              <span className="font-semibold text-[#2962ff]">
                {hoveredStock.rating}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#2a2e39] text-[10px] text-[#787b86] text-center">
            Click to open SuperChart & Paper Trade
          </div>
        </div>
      )}
    </div>
  );
};
