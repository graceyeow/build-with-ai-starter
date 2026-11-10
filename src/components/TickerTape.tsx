import React from 'react';
import { TICKER_TAPE_ITEMS } from '../data/stocksData';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  onSelectSymbol?: (symbol: string) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ onSelectSymbol }) => {
  // Duplicate list to create seamless infinite scroll effect
  const displayItems = [...TICKER_TAPE_ITEMS, ...TICKER_TAPE_ITEMS];

  return (
    <div className="w-full bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] overflow-hidden select-none py-1.5 text-xs">
      <div className="flex w-max animate-[scroll_45s_linear_infinite] hover:[animation-play-state:paused] items-center">
        {displayItems.map((item, idx) => {
          return (
            <button
              key={`${item.symbol}-${idx}`}
              onClick={() => onSelectSymbol?.(item.symbol)}
              className="inline-flex items-center gap-2 px-4 border-r border-[#2a2e39]/50 dark:border-[#2a2e39]/50 light:border-[#e0e3eb] text-left transition-colors hover:bg-[#1e222d] dark:hover:bg-[#1e222d] light:hover:bg-white/60 py-0.5 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="font-semibold text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                {item.symbol}
              </span>
              <span className="font-mono tabular-nums text-[#787b86] dark:text-[#787b86] light:text-[#6a6d78]">
                {item.price}
              </span>
              <span
                className={`font-mono tabular-nums font-medium flex items-center gap-0.5 ${
                  item.positive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {item.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {item.change}
              </span>
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
