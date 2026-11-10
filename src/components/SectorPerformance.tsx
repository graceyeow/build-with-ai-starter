import React from 'react';
import { SECTOR_PERFORMANCE, SectorData } from '../data/stocksData';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';

interface SectorPerformanceProps {
  onSelectSector?: (sectorName: string) => void;
}

export const SectorPerformance: React.FC<SectorPerformanceProps> = ({
  onSelectSector,
}) => {
  return (
    <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#2962ff]" />
          <div>
            <h3 className="font-bold text-base text-white dark:text-white light:text-[#131722] tracking-tight">
              Sector Performance Breakdown
            </h3>
            <p className="text-xs text-[#787b86]">
              US economic sectors ranked by intraday performance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {SECTOR_PERFORMANCE.map(sector => {
          const isPositive = sector.changePercent >= 0;
          const barWidth = Math.min(100, Math.abs(sector.changePercent) * 25);

          return (
            <button
              key={sector.name}
              onClick={() => onSelectSector?.(sector.name)}
              className="bg-[#131722]/50 dark:bg-[#131722]/50 light:bg-[#f8f9fc] hover:bg-[#2a2e39]/50 rounded-lg p-3 border border-[#2a2e39]/50 dark:border-[#2a2e39]/50 light:border-[#e0e3eb] text-left transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white dark:text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                  {sector.name}
                </span>
                <span
                  className={`font-mono tabular-nums text-xs font-semibold flex items-center gap-0.5 ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? '+' : ''}
                  {sector.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-[#1e222d] dark:bg-[#1e222d] light:bg-[#e0e3eb] h-1.5 rounded-full overflow-hidden my-1 relative">
                <div
                  className={`h-full rounded-full transition-all ${
                    isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'
                  }`}
                  style={{ width: `${Math.max(8, barWidth)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#787b86] mt-1">
                <span>Top: <strong className="text-[#d1d4dc] font-medium">{sector.topStock}</strong></span>
                <span className="font-mono">{sector.marketCap} Cap</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
