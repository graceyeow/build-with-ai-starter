import React, { useState } from 'react';
import { IndexData } from '../data/stocksData';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

interface IndexCardProps {
  index: IndexData;
  onOpenChart: (index: IndexData) => void;
}

export const IndexCard: React.FC<IndexCardProps> = ({ index, onOpenChart }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const isPositive = index.change >= 0;

  // Day Range calculations
  const dayRangeSpread = index.dayHigh - index.dayLow || 1;
  const dayProgress = Math.min(
    100,
    Math.max(0, ((index.price - index.dayLow) / dayRangeSpread) * 100)
  );

  // SVG sparkline path creation
  const points = index.sparkline;
  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;

  const width = 220;
  const height = 48;
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - minVal) / range) * (height - 10) - 5;
    return { x, y, value: p };
  });

  const linePath = coords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const strokeColor = isPositive ? '#089981' : '#f23645';
  const fillColor = isPositive ? 'rgba(8, 153, 129, 0.15)' : 'rgba(242, 54, 69, 0.15)';

  return (
    <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] p-4 transition-all hover:border-[#787b86]/50 flex flex-col justify-between group">
      {/* Top Header: Symbol, Name and Action */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white dark:text-white light:text-[#131722] tracking-tight">
              {index.symbol}
            </span>
            <span className="text-xs text-[#787b86] dark:text-[#787b86] light:text-[#6a6d78]">
              {index.name}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 mt-1.5">
            <span className="font-mono tabular-nums text-xl font-bold text-white dark:text-white light:text-[#131722]">
              {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`font-mono tabular-nums text-xs font-semibold flex items-center gap-0.5 ${
                isPositive ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {index.change.toFixed(2)} ({isPositive ? '+' : ''}
              {index.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpenChart(index)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-[#787b86] hover:text-[#2962ff] hover:bg-[#2962ff]/10 rounded-md transition-all cursor-pointer"
          title="Open in SuperChart"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Sparkline Chart */}
      <div className="my-3 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-12 overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${index.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#grad-${index.symbol})`} />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === idx ? 4 : 2}
              fill={hoverIndex === idx ? '#ffffff' : strokeColor}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        {hoverIndex !== null && (
          <div className="absolute top-0 right-0 bg-[#131722] text-[11px] font-mono px-2 py-0.5 rounded border border-[#2a2e39] text-[#d1d4dc]">
            {coords[hoverIndex].value.toFixed(2)}
          </div>
        )}
      </div>

      {/* Day Range Bar */}
      <div className="mt-1 pt-2 border-t border-[#2a2e39]/50 dark:border-[#2a2e39]/50 light:border-[#e0e3eb]">
        <div className="flex items-center justify-between text-[11px] text-[#787b86] mb-1">
          <span>Day Low: {index.dayLow.toLocaleString()}</span>
          <span>Day High: {index.dayHigh.toLocaleString()}</span>
        </div>
        <div className="w-full bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] h-1.5 rounded-full overflow-hidden relative">
          <div
            className="bg-[#2962ff] h-full rounded-full transition-all"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
