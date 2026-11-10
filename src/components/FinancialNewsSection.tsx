import React from 'react';
import { FINANCIAL_NEWS, STOCKS_DATA } from '../data/stocksData';
import { Newspaper, Calendar, Gauge, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

export const FinancialNewsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Col 1 & 2: Breaking Market News */}
      <div className="lg:col-span-2 bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#2962ff]" />
            <h3 className="font-bold text-base text-white dark:text-white light:text-[#131722] tracking-tight">
              Market Catalysts & Breaking News
            </h3>
          </div>
          <span className="text-xs text-[#787b86]">Live Feed</span>
        </div>

        <div className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb] mt-2">
          {FINANCIAL_NEWS.map(item => (
            <div
              key={item.id}
              className="py-4 hover:bg-[#131722]/30 dark:hover:bg-[#131722]/30 light:hover:bg-slate-50 transition-colors rounded-lg px-2 group"
            >
              <div className="flex items-center justify-between text-xs text-[#787b86] mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                    {item.source}
                  </span>
                  <span>·</span>
                  <span>{item.timeAgo}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    item.sentiment === 'Bullish'
                      ? 'text-[#089981] bg-[#089981]/15'
                      : item.sentiment === 'Bearish'
                      ? 'text-[#f23645] bg-[#f23645]/15'
                      : 'text-[#787b86] bg-[#787b86]/15'
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white dark:text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-[#787b86] mt-1.5 leading-relaxed">
                {item.summary}
              </p>

              <div className="flex items-center gap-1.5 mt-2.5">
                {item.relatedSymbols.map(sym => (
                  <span
                    key={sym}
                    className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-[#131722] dark:bg-[#131722] light:bg-[#f0f3fa] text-[#2962ff] rounded border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]"
                  >
                    ${sym}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3: Market Sentiment & Upcoming Earnings Calendar */}
      <div className="space-y-5">
        {/* Market Sentiment Fear & Greed Gauge */}
        <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <Gauge className="w-5 h-5 text-[#089981]" />
            <h3 className="font-bold text-sm text-white dark:text-white light:text-[#131722]">
              Market Sentiment Index
            </h3>
          </div>

          <div className="pt-4 text-center">
            <div className="text-4xl font-extrabold font-mono text-[#089981]">
              68
            </div>
            <div className="text-sm font-bold text-white dark:text-white light:text-[#131722] mt-0.5">
              Greed
            </div>
            <p className="text-xs text-[#787b86] mt-1">
              Previous close: 64 (Greed) · 1 Month Ago: 54 (Neutral)
            </p>

            {/* Visual gradient bar */}
            <div className="mt-4 w-full h-2 rounded-full bg-gradient-to-r from-[#f23645] via-[#f5a623] to-[#089981] relative">
              <div
                className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#131722] absolute top-1/2 -translate-y-1/2 shadow-md"
                style={{ left: '68%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#787b86] font-mono mt-1.5">
              <span>Extreme Fear</span>
              <span>Neutral</span>
              <span>Extreme Greed</span>
            </div>
          </div>
        </div>

        {/* Upcoming Earnings Reports */}
        <div className="bg-[#1e222d] dark:bg-[#1e222d] light:bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb] p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <Calendar className="w-5 h-5 text-[#2962ff]" />
            <h3 className="font-bold text-sm text-white dark:text-white light:text-[#131722]">
              Upcoming Key Earnings
            </h3>
          </div>

          <div className="mt-3 divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
            {STOCKS_DATA.slice(0, 5).map(stock => (
              <div key={stock.symbol} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={stock.logo}
                    alt={stock.name}
                    className="w-5 h-5 rounded-full bg-white/10 p-0.5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <span className="font-bold text-white dark:text-white light:text-[#131722]">
                      {stock.symbol}
                    </span>
                    <span className="text-[11px] text-[#787b86] block">
                      Est. EPS: ${stock.epsEstimate.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-medium text-white dark:text-white light:text-[#131722]">
                    {stock.earningsDate}
                  </span>
                  <span className="text-[10px] text-[#2962ff] block">
                    After Market Close
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
