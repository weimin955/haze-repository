import React from 'react';
import {
  AIR_QUALITY_LEVELS,
  SINGAPORE_REGIONS,
} from '../constants/singaporeData';
import { PsiApiResponse, RegionKey } from '../types/psi';
import {
  Activity,
  ArrowUpRight,
  Clock,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Wind,
} from 'lucide-react';

interface PsiOverviewProps {
  data: PsiApiResponse;
  selectedRegionKey: RegionKey;
  onSelectRegion: (key: RegionKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeScenario: 'live_nea' | 'haze' | 'elevated' | 'clean';
  onScenarioChange: (scenario: 'live_nea' | 'haze' | 'elevated' | 'clean') => void;
  psiThreshold: number;
}

export const PsiOverview: React.FC<PsiOverviewProps> = ({
  data,
  selectedRegionKey,
  onSelectRegion,
  onRefresh,
  isRefreshing,
  activeScenario,
  onScenarioChange,
  psiThreshold,
}) => {
  const nationalInfo = AIR_QUALITY_LEVELS[data.nationalBand];
  const regionKeys: RegionKey[] = ['central', 'north', 'south', 'east', 'west'];

  return (
    <section id="overview" className="space-y-6">
      {/* Telemetry Control & Scenario Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-cyan-400">Singapore NEA Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Synced: {data.updateTimestamp} SGT</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Dataset: 24-hr PSI & 1-hr PM2.5</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1">
            Singapore Air Quality & PSI Live Tracker
          </h1>
        </div>

        {/* Telemetry Actions & Simulation Scenarios */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Test Simulation Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              Feed:
            </span>
            <select
              aria-label="Air Quality Telemetry Feed"
              value={activeScenario}
              onChange={(e) =>
                onScenarioChange(e.target.value as 'live_nea' | 'haze' | 'elevated' | 'clean')
              }
              className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="live_nea">Live NEA API (data.gov.sg)</option>
              <option value="haze">Simulation: Transboundary Haze (PSI &gt; 160)</option>
              <option value="elevated">Simulation: Elevated Corridor (PSI 84)</option>
              <option value="clean">Simulation: Clear Day (PSI 38)</option>
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Fetch latest readings from Singapore National Environment Agency"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: National Overview + Regional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dominant National Gauge Tile (5 cols) */}
        <div
          className="lg:col-span-5 rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between"
          style={{
            borderColor: nationalInfo.borderColor,
            background: `linear-gradient(145deg, rgba(15, 23, 42, 0.95), ${nationalInfo.bgColor})`,
          }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                National 24-Hour PSI Index
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider"
                style={{
                  color: nationalInfo.color,
                  borderColor: nationalInfo.borderColor,
                  backgroundColor: nationalInfo.bgColor,
                }}
              >
                {nationalInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-6xl font-bold font-mono tracking-tight text-white tabular-nums">
                {data.nationalPsi}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / 500 MAX
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {nationalInfo.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                1-Hr PM2.5 Reading
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {data.nationalPm25}
                <span className="text-xs text-slate-400 font-normal ml-1">µg/m³</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Band I Normal (&lt;55 µg/m³)
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Wind Advection
              </span>
              <span className="text-lg font-bold font-mono text-white flex items-center gap-1">
                <Wind className="w-4 h-4 text-cyan-400" />
                {data.wind.direction}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  {data.wind.speedKmH} km/h
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                Bearing {data.wind.bearingDeg}°
              </span>
            </div>
          </div>
        </div>

        {/* 5 Regional Telemetry Tiles (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {regionKeys.map((regKey) => {
            const reg = data.regions[regKey];
            const meta = SINGAPORE_REGIONS[regKey];
            const info = AIR_QUALITY_LEVELS[reg.band];
            const isSelected = selectedRegionKey === regKey;
            const isBreached = reg.readings.psi24h >= psiThreshold;

            return (
              <div
                key={regKey}
                onClick={() => onSelectRegion(regKey)}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {meta.name}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                      style={{
                        color: info.color,
                        borderColor: info.borderColor,
                        backgroundColor: info.bgColor,
                      }}
                    >
                      {info.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <div>
                      <span className="text-3xl font-bold font-mono text-white tabular-nums">
                        {reg.readings.psi24h}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono ml-1.5">
                        PSI
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                        {reg.readings.pm25Hourly}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        µg/m³
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[150px]">
                    {meta.suburbs.slice(0, 2).join(', ')}
                  </span>
                  <span className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Alert Status Card */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/70 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Active Threshold Trigger
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  PSI &ge; {psiThreshold}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Notification fires immediately when any monitored region reaches this level.
              </p>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              <span className="text-emerald-400">✓ Web Notifications Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
