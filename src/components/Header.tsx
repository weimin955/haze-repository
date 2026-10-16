import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onOpenAlertModal: () => void;
  activeBreachCount: number;
  unreadAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlertModal,
  activeBreachCount,
  unreadAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold">
            SG
          </div>
          <span>SG AirGuard</span>
        </a>

        {/* Zone 2: 4-5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a
            href="#overview"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#interactive-map"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Regional Map
          </a>
          <a
            href="#trends"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            24h Trends
          </a>
          <a
            href="#advisory"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Health Advisory
          </a>
          <a
            href="#pollutants"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Pollutants
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAlertModal}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              activeBreachCount > 0
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
            }`}
            title="Configure air quality thresholds and notifications"
          >
            {activeBreachCount > 0 ? (
              <ShieldAlert className="w-4 h-4 text-slate-950" />
            ) : (
              <Bell className="w-4 h-4 text-cyan-400" />
            )}
            <span>Alert Settings</span>
            {(activeBreachCount > 0 || unreadAlertCount > 0) && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold tabular-nums">
                {activeBreachCount > 0 ? activeBreachCount : unreadAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
