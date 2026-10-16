import React from 'react';
import { AlertTriangle, ChevronRight, X, Volume2 } from 'lucide-react';
import { RegionData, RegionKey } from '../types/psi';

interface ActiveAlertBannerProps {
  breachedRegions: RegionData[];
  onDismiss: () => void;
  onOpenSettings: () => void;
  onSelectRegion: (key: RegionKey) => void;
}

export const ActiveAlertBanner: React.FC<ActiveAlertBannerProps> = ({
  breachedRegions,
  onDismiss,
  onOpenSettings,
  onSelectRegion,
}) => {
  if (breachedRegions.length === 0) return null;

  return (
    <aside
      aria-label="Air Quality Warning"
      className="bg-amber-950/70 border-b border-amber-500/40 text-amber-100 px-4 py-3 relative overflow-hidden backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">
                Air Quality Threshold Alert:
              </span>
              <span className="text-xs text-amber-200">
                {breachedRegions.length} region{breachedRegions.length > 1 ? 's' : ''} currently exceed healthy parameters
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              {breachedRegions.map((reg) => (
                <button
                  key={reg.region}
                  onClick={() => onSelectRegion(reg.region)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{reg.name}:</span>
                  <span className="font-mono tabular-nums font-bold">PSI {reg.readings.psi24h}</span>
                  <span className="text-amber-400/80">({reg.readings.pm25Hourly} µg/m³)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            onClick={onOpenSettings}
            className="text-xs text-amber-300 hover:text-white font-medium flex items-center gap-1 px-2.5 py-1.5 rounded bg-amber-900/50 hover:bg-amber-800/60 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Thresholds</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert banner"
            className="p-1.5 rounded text-amber-300 hover:text-white hover:bg-amber-900/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
