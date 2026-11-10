import React, { useState, useMemo } from 'react';
import { Stock, generateCandleData, CandleData } from '../data/stocksData';
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Sliders,
  DollarSign,
  Bookmark,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface SuperChartModalProps {
  stock: Stock;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  portfolioBalance: number;
  onExecuteTrade: (trade: {
    symbol: string;
    shares: number;
    action: 'BUY' | 'SELL';
    price: number;
  }) => void;
}

type ChartType = 'candles' | 'line' | 'area';
type TimeFrame = '1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL';

export const SuperChartModal: React.FC<SuperChartModalProps> = ({
  stock,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  portfolioBalance,
  onExecuteTrade,
}) => {
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Trading panel states
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesCount, setSharesCount] = useState<number>(10);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate realistic candles based on timeframe
  const candleCount = timeframe === '1D' ? 36 : timeframe === '5D' ? 45 : 55;
  const candles: CandleData[] = useMemo(() => {
    return generateCandleData(stock.price, candleCount);
  }, [stock.price, candleCount, timeframe]);

  // Compute SMA 10 for indicator
  const smaValues = useMemo(() => {
    const period = 8;
    return candles.map((_, idx) => {
      if (idx < period - 1) return null;
      const slice = candles.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return +(sum / period).toFixed(2);
    });
  }, [candles]);

  // Active hover candle or latest candle
  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 360;
  const paddingRight = 65;
  const paddingBottom = 30;
  const paddingTop = 25;
  const paddingLeft = 15;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const mainChartHeight = showRSI ? svgHeight - 90 - paddingBottom : svgHeight - paddingBottom - paddingTop;
  const rsiHeight = 65;
  const rsiTop = svgHeight - paddingBottom - rsiHeight;

  // Price Extents
  const minPrice = Math.min(...candles.map(c => c.low)) * 0.995;
  const maxPrice = Math.max(...candles.map(c => c.high)) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  // Volume Extents
  const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

  const candleStep = chartAreaWidth / candles.length;
  const candleBodyWidth = Math.max(3, candleStep * 0.65);

  const getYForPrice = (p: number) => {
    return paddingTop + mainChartHeight - ((p - minPrice) / priceRange) * mainChartHeight;
  };

  const isStockPositive = stock.change >= 0;
  const totalCost = sharesCount * stock.price;

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderAction === 'BUY' && totalCost > portfolioBalance) {
      setOrderNotification(`Insufficient cash. Needed: $${totalCost.toFixed(2)}`);
      setTimeout(() => setOrderNotification(null), 3000);
      return;
    }

    onExecuteTrade({
      symbol: stock.symbol,
      shares: sharesCount,
      action: orderAction,
      price: stock.price,
    });

    setOrderNotification(`Executed ${orderAction} ${sharesCount} ${stock.symbol} @ $${stock.price.toFixed(2)}`);
    setTimeout(() => setOrderNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#1e222d] dark:bg-[#1e222d] light:bg-white border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex flex-wrap items-center justify-between gap-4 bg-[#131722]/50 dark:bg-[#131722]/50 light:bg-[#f8f9fc]">
          <div className="flex items-center gap-3">
            <img
              src={stock.logo}
              alt={stock.name}
              className="w-8 h-8 rounded-full bg-white/10 p-0.5 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white dark:text-white light:text-[#131722] tracking-tight">
                  {stock.symbol}
                </span>
                <span className="text-xs text-[#787b86] font-mono px-1.5 py-0.5 bg-[#1e222d] rounded">
                  {stock.exchange}
                </span>
                <span className="text-xs font-semibold text-[#2962ff] bg-[#2962ff]/10 px-2 py-0.5 rounded">
                  {stock.rating}
                </span>
              </div>
              <div className="text-xs text-[#787b86] truncate max-w-sm">
                {stock.name} · {stock.sector}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Price and Change */}
            <div className="text-right">
              <div className="font-mono tabular-nums text-xl font-bold text-white dark:text-white light:text-[#131722]">
                ${stock.price.toFixed(2)}
              </div>
              <div
                className={`font-mono tabular-nums text-xs font-semibold flex items-center justify-end gap-1 ${
                  isStockPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isStockPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isStockPositive ? '+' : ''}
                {stock.change.toFixed(2)} ({isStockPositive ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            {/* Watchlist Bookmark */}
            <button
              onClick={() => onToggleWatchlist(stock.symbol)}
              className="p-2 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark
                className={`w-4 h-4 ${isWatchlisted ? 'fill-[#2962ff] text-[#2962ff]' : ''}`}
              />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Toolbar: Timeframes & Type & Indicators */}
        <div className="px-5 py-2 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] flex flex-wrap items-center justify-between gap-3 text-xs bg-[#1e222d]">
          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 font-semibold rounded transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2.5 py-1 font-semibold rounded transition-colors cursor-pointer ${
                chartType === 'candles' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 font-semibold rounded transition-colors cursor-pointer ${
                chartType === 'area' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 font-semibold rounded transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Line
            </button>
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSMA(prev => !prev)}
              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                showSMA
                  ? 'border-[#f5a623] text-[#f5a623] bg-[#f5a623]/10'
                  : 'border-[#2a2e39] text-[#787b86]'
              }`}
            >
              SMA 8
            </button>
            <button
              onClick={() => setShowVolume(prev => !prev)}
              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                showVolume
                  ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                  : 'border-[#2a2e39] text-[#787b86]'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setShowRSI(prev => !prev)}
              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                showRSI
                  ? 'border-[#ab47bc] text-[#ab47bc] bg-[#ab47bc]/10'
                  : 'border-[#2a2e39] text-[#787b86]'
              }`}
            >
              RSI (14)
            </button>
          </div>
        </div>

        {/* OHLC Readout Bar */}
        <div className="px-5 py-1.5 bg-[#131722]/80 border-b border-[#2a2e39] text-[11px] font-mono flex items-center gap-4 text-[#787b86]">
          <span>
            Time: <strong className="text-[#d1d4dc]">{activeCandle.time}</strong>
          </span>
          <span>
            O: <strong className="text-white">${activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-white">${activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-white">${activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="text-white">${activeCandle.close.toFixed(2)}</strong>
          </span>
          <span>
            Vol: <strong className="text-white">{activeCandle.volume.toLocaleString()}</strong>
          </span>
        </div>

        {/* Body Grid: SuperChart Canvas (Left) + Paper Trading & Stats (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 overflow-y-auto">
          {/* Main Chart Area */}
          <div className="lg:col-span-3 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2a2e39] bg-[#131722] relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full min-h-[320px] max-h-[460px] overflow-visible"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Horizontal Price Grid Lines & Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const priceVal = minPrice + (1 - ratio) * priceRange;
                const y = paddingTop + ratio * mainChartHeight;
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#2a2e39"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={svgWidth - paddingRight + 8}
                      y={y + 3}
                      fill="#787b86"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      ${priceVal.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Volume Bars */}
              {showVolume &&
                candles.map((candle, idx) => {
                  const x = paddingLeft + idx * candleStep + candleStep / 2;
                  const volHeight = (candle.volume / maxVolume) * 45;
                  const y = paddingTop + mainChartHeight - volHeight;
                  const isUp = candle.close >= candle.open;
                  const barColor = isUp ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)';

                  return (
                    <rect
                      key={`vol-${idx}`}
                      x={x - candleBodyWidth / 2}
                      y={y}
                      width={candleBodyWidth}
                      height={volHeight}
                      fill={barColor}
                    />
                  );
                })}

              {/* Candlesticks rendering */}
              {chartType === 'candles' &&
                candles.map((candle, idx) => {
                  const x = paddingLeft + idx * candleStep + candleStep / 2;
                  const yOpen = getYForPrice(candle.open);
                  const yClose = getYForPrice(candle.close);
                  const yHigh = getYForPrice(candle.high);
                  const yLow = getYForPrice(candle.low);

                  const isUp = candle.close >= candle.open;
                  const candleColor = isUp ? '#089981' : '#f23645';

                  const top = Math.min(yOpen, yClose);
                  const height = Math.max(2, Math.abs(yOpen - yClose));

                  return (
                    <g
                      key={`candle-${idx}`}
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoverIndex(idx)}
                    >
                      {/* High-Low Wick */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={candleColor}
                        strokeWidth="1.5"
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - candleBodyWidth / 2}
                        y={top}
                        width={candleBodyWidth}
                        height={height}
                        fill={candleColor}
                        stroke={candleColor}
                        strokeWidth="0.5"
                        rx="0.5"
                      />
                    </g>
                  );
                })}

              {/* Line / Area rendering */}
              {(chartType === 'line' || chartType === 'area') && (() => {
                const pts = candles.map((c, i) => {
                  const x = paddingLeft + i * candleStep + candleStep / 2;
                  const y = getYForPrice(c.close);
                  return { x, y };
                });

                const lineString = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
                const areaString = `${lineString} L ${pts[pts.length - 1].x} ${paddingTop + mainChartHeight} L ${pts[0].x} ${paddingTop + mainChartHeight} Z`;

                return (
                  <g>
                    {chartType === 'area' && (
                      <>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2962ff" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaString} fill="url(#areaGrad)" />
                      </>
                    )}
                    <path
                      d={lineString}
                      fill="none"
                      stroke="#2962ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}

              {/* SMA 8 Indicator line overlay */}
              {showSMA && (() => {
                const smaPoints: { x: number; y: number }[] = [];
                candles.forEach((_, idx) => {
                  const val = smaValues[idx];
                  if (val !== null) {
                    const x = paddingLeft + idx * candleStep + candleStep / 2;
                    const y = getYForPrice(val);
                    smaPoints.push({ x, y });
                  }
                });

                if (smaPoints.length > 1) {
                  const path = smaPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke="#f5a623"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  );
                }
                return null;
              })()}

              {/* RSI Sub-Chart Indicator */}
              {showRSI && (
                <g>
                  {/* RSI background container */}
                  <rect
                    x={paddingLeft}
                    y={rsiTop}
                    width={chartAreaWidth}
                    height={rsiHeight}
                    fill="#1e222d"
                    stroke="#2a2e39"
                    strokeWidth="1"
                    rx="3"
                  />
                  {/* Overbought 70 & Oversold 30 horizontal lines */}
                  <line
                    x1={paddingLeft}
                    y1={rsiTop + rsiHeight * 0.3}
                    x2={paddingLeft + chartAreaWidth}
                    y2={rsiTop + rsiHeight * 0.3}
                    stroke="#2a2e39"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={paddingLeft}
                    y1={rsiTop + rsiHeight * 0.7}
                    x2={paddingLeft + chartAreaWidth}
                    y2={rsiTop + rsiHeight * 0.7}
                    stroke="#2a2e39"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={svgWidth - paddingRight + 8}
                    y={rsiTop + rsiHeight * 0.3 + 3}
                    fill="#787b86"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    70
                  </text>
                  <text
                    x={svgWidth - paddingRight + 8}
                    y={rsiTop + rsiHeight * 0.7 + 3}
                    fill="#787b86"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    30
                  </text>
                  {/* RSI oscillating curve */}
                  {(() => {
                    const rsiPts = candles.map((c, i) => {
                      const x = paddingLeft + i * candleStep + candleStep / 2;
                      // Simulated realistic RSI movement between 35 and 68
                      const candleChg = ((c.close - c.open) / (c.open || 1)) * 100;
                      const simulatedRsi = 50 + Math.sin(i * 0.4) * 16 + (candleChg * 1.5);
                      const clampedRsi = Math.max(15, Math.min(85, simulatedRsi));
                      const y = rsiTop + rsiHeight - (clampedRsi / 100) * rsiHeight;
                      return { x, y };
                    });
                    const rsiPath = rsiPts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
                    return (
                      <path
                        d={rsiPath}
                        fill="none"
                        stroke="#ab47bc"
                        strokeWidth="1.5"
                      />
                    );
                  })()}
                  <text
                    x={paddingLeft + 6}
                    y={rsiTop + 14}
                    fill="#ab47bc"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    RSI (14): 58.42
                  </text>
                </g>
              )}

              {/* Crosshair Cursor */}
              {hoverIndex !== null && (() => {
                const curX = paddingLeft + hoverIndex * candleStep + candleStep / 2;
                const curY = getYForPrice(candles[hoverIndex].close);
                return (
                  <g pointerEvents="none">
                    {/* Vertical line */}
                    <line
                      x1={curX}
                      y1={paddingTop}
                      x2={curX}
                      y2={svgHeight - paddingBottom}
                      stroke="#787b86"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    {/* Horizontal line */}
                    <line
                      x1={paddingLeft}
                      y1={curY}
                      x2={svgWidth - paddingRight}
                      y2={curY}
                      stroke="#787b86"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    {/* Point dot */}
                    <circle cx={curX} cy={curY} r="3.5" fill="#2962ff" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                );
              })()}
            </svg>

            <div className="flex items-center justify-between text-[11px] text-[#787b86] pt-2 border-t border-[#2a2e39]/50">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#089981]" />
                Live Market Stream · NASDAQ Delayed 15m
              </span>
              <span>TradingView Interactive SuperChart Engine</span>
            </div>
          </div>

          {/* Right Sidebar: Paper Trading Widget & Fundamental Ratios */}
          <div className="p-5 flex flex-col justify-between bg-[#1e222d] dark:bg-[#1e222d] light:bg-white">
            {/* Paper Trading Execution Panel */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39] mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#089981]" />
                  <span className="font-bold text-sm text-white">Paper Trade</span>
                </div>
                <span className="text-[11px] font-mono text-[#787b86]">
                  Cash: ${portfolioBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Action Buttons: Buy / Sell */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setOrderAction('BUY')}
                  className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    orderAction === 'BUY'
                      ? 'bg-[#089981] text-white shadow-md'
                      : 'bg-[#131722] text-[#787b86] hover:text-white border border-[#2a2e39]'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setOrderAction('SELL')}
                  className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    orderAction === 'SELL'
                      ? 'bg-[#f23645] text-white shadow-md'
                      : 'bg-[#131722] text-[#787b86] hover:text-white border border-[#2a2e39]'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Order Form */}
              <form onSubmit={handleTradeSubmit} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#787b86] mb-1">
                    <span>Shares</span>
                    <span className="font-mono">{sharesCount} shares</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={sharesCount}
                    onChange={e => setSharesCount(Number(e.target.value))}
                    className="w-full accent-[#2962ff] cursor-pointer"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={sharesCount}
                      onChange={e => setSharesCount(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-[#131722] text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-[#2a2e39] outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#787b86]">
                    <span>Execution Price</span>
                    <span className="font-mono text-white">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#787b86]">
                    <span>Total Amount</span>
                    <span className="font-mono font-bold text-white">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer shadow-md ${
                    orderAction === 'BUY'
                      ? 'bg-[#089981] hover:bg-[#0aa38a]'
                      : 'bg-[#f23645] hover:bg-[#d82a38]'
                  }`}
                >
                  Confirm {orderAction} Order
                </button>
              </form>

              {orderNotification && (
                <div className="mt-3 p-2 bg-[#2962ff]/15 border border-[#2962ff]/30 text-[#2962ff] rounded-lg text-xs font-semibold text-center animate-in fade-in">
                  {orderNotification}
                </div>
              )}
            </div>

            {/* Key Fundamental Ratios */}
            <div className="mt-6 pt-4 border-t border-[#2a2e39]">
              <h4 className="font-bold text-xs text-white mb-2.5">Key Financial Ratios</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86]">Market Cap</span>
                  <span className="font-mono text-white">{stock.marketCap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86]">P/E Ratio (TTM)</span>
                  <span className="font-mono text-white">{stock.peRatio.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86]">52-Week Range</span>
                  <span className="font-mono text-white">${stock.low52.toFixed(1)} - ${stock.high52.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86]">Analyst Target</span>
                  <span className="font-mono font-bold text-[#089981]">${stock.analystTarget.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86]">Next Earnings</span>
                  <span className="text-white">{stock.earningsDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
