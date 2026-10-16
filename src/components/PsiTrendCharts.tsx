import React, { useState } from 'react';
import { HistoricalReadingPoint, PollutantReadings, RegionData, RegionKey } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/singaporeData';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface PsiTrendChartsProps {
  history: HistoricalReadingPoint[];
  selectedRegion: RegionData;
  psiThreshold: number;
}

export const PsiTrendCharts: React.FC<PsiTrendChartsProps> = ({
  history,
  selectedRegion,
  psiThreshold,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<RegionKey>('national');

  const readings = selectedRegion.readings;

  // Compute SVG dimensions and points
  const maxPsi = Math.max(160, ...history.map((h) => Math.max(h.nationalPsi, h.west, h.east, h.south, h.north, h.central)));
  const minPsi = 0;
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + (idx / (history.length - 1)) * plotWidth;
    const y = svgHeight - paddingY - ((val - minPsi) / (maxPsi - minPsi)) * plotHeight;
    return { x, y };
  };

  // Generate SVG path string
  const createPath = (key: RegionKey) => {
    return history
      .map((pt, idx) => {
        const val =
          key === 'national'
            ? pt.nationalPsi
            : (pt as any)[key] ?? pt.nationalPsi;
        const { x, y } = getCoordinates(val, idx);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Threshold line Y
  const thresholdY = svgHeight - paddingY - ((psiThreshold - minPsi) / (maxPsi - minPsi)) * plotHeight;

  // Active hover point
  const currentHoverPt = hoverIndex !== null ? history[hoverIndex] : history[history.length - 1];

  // Pollutant standards comparison table
  const pollutants = [
    {
      name: 'PM2.5 (Fine Particulate)',
      formula: 'PM₂.₅',
      val: `${readings.pm25_24h}`,
      unit: 'µg/m³ (24h)',
      limit: '55 µg/m³',
      percent: Math.min(100, (readings.pm25_24h / 55) * 100),
      status: readings.pm25_24h > 55 ? 'Elevated' : 'Safe',
      statusColor: readings.pm25_24h > 55 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      name: 'PM10 (Inhalable Particles)',
      formula: 'PM₁₀',
      val: `${readings.pm10_24h}`,
      unit: 'µg/m³ (24h)',
      limit: '100 µg/m³',
      percent: Math.min(100, (readings.pm10_24h / 100) * 100),
      status: readings.pm10_24h > 100 ? 'Elevated' : 'Safe',
      statusColor: readings.pm10_24h > 100 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      name: 'Ozone (Photochemical)',
      formula: 'O₃',
      val: `${readings.o3_8hMax}`,
      unit: 'µg/m³ (8h max)',
      limit: '100 µg/m³',
      percent: Math.min(100, (readings.o3_8hMax / 100) * 100),
      status: readings.o3_8hMax > 100 ? 'Elevated' : 'Safe',
      statusColor: readings.o3_8hMax > 100 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      name: 'Nitrogen Dioxide',
      formula: 'NO₂',
      val: `${readings.no2_1hMax}`,
      unit: 'µg/m³ (1h max)',
      limit: '200 µg/m³',
      percent: Math.min(100, (readings.no2_1hMax / 200) * 100),
      status: 'Safe',
      statusColor: 'text-emerald-400',
    },
    {
      name: 'Sulphur Dioxide',
      formula: 'SO₂',
      val: `${readings.so2_24h}`,
      unit: 'µg/m³ (24h)',
      limit: '50 µg/m³',
      percent: Math.min(100, (readings.so2_24h / 50) * 100),
      status: 'Safe',
      statusColor: 'text-emerald-400',
    },
    {
      name: 'Carbon Monoxide',
      formula: 'CO',
      val: `${readings.co_8hMax}`,
      unit: 'mg/m³ (8h max)',
      limit: '10 mg/m³',
      percent: Math.min(100, (readings.co_8hMax / 10) * 100),
      status: 'Safe',
      statusColor: 'text-emerald-400',
    },
  ];

  return (
    <section id="trends" className="space-y-6 pt-6">
      {/* 24-Hour PSI Trend Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-400 font-semibold">Time-Series Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>24-Hour Rolling Historical Window</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            24-Hour PSI Index Trajectory
          </h2>
        </div>

        {/* Region curve selector tabs */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
          {(['national', 'west', 'south', 'central', 'east', 'north'] as const).map(
            (regKey) => (
              <button
                key={regKey}
                onClick={() => setActiveSeries(regKey)}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeSeries === regKey
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {SINGAPORE_REGIONS[regKey].name.replace(' (National)', '').replace(' Region', '')}
              </button>
            )
          )}
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 relative">
        {/* HUD readout for active point */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Timestamp:{' '}
              <span className="font-mono text-slate-200 font-semibold">
                {currentHoverPt?.timeLabel} SGT
              </span>
            </span>
            <span className="text-xs text-slate-400">
              {SINGAPORE_REGIONS[activeSeries].name} PSI:{' '}
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {(currentHoverPt as any)?.[activeSeries === 'national' ? 'nationalPsi' : activeSeries]}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400" />
              <span>{SINGAPORE_REGIONS[activeSeries].name}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-400" />
              <span>Unhealthy Threshold (100)</span>
            </span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Grid Lines */}
            {[50, 100, 150].map((gridVal) => {
              const y = svgHeight - paddingY - ((gridVal - minPsi) / (maxPsi - minPsi)) * plotHeight;
              return (
                <g key={gridVal}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Threshold Reference Line */}
            {thresholdY >= paddingY && thresholdY <= svgHeight - paddingY && (
              <line
                x1={paddingX}
                y1={thresholdY}
                x2={svgWidth - paddingX}
                y2={thresholdY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
            )}

            {/* National baseline (faint comparison curve) */}
            {activeSeries !== 'national' && (
              <path
                d={createPath('national')}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}

            {/* Active Region Curve */}
            <path
              d={createPath(activeSeries)}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Point Nodes & Hover Hitboxes */}
            {history.map((pt, idx) => {
              const val =
                activeSeries === 'national'
                  ? pt.nationalPsi
                  : (pt as any)[activeSeries] ?? pt.nationalPsi;
              const { x, y } = getCoordinates(val, idx);
              const isHovered = hoverIndex === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoverIndex(idx)}
                  className="cursor-pointer"
                >
                  {/* Invisible hit target for smooth hover */}
                  <rect
                    x={x - 12}
                    y={0}
                    width={24}
                    height={svgHeight}
                    fill="transparent"
                  />

                  {/* Scrubber vertical line */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 2.5}
                    fill={isHovered ? '#38bdf8' : '#06b6d4'}
                    stroke="#090d16"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* X Axis Time Labels */}
            {history
              .filter((_, idx) => idx % 4 === 0 || idx === history.length - 1)
              .map((pt, idx) => {
                const origIdx = history.indexOf(pt);
                const { x } = getCoordinates(pt.nationalPsi, origIdx);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 8}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {pt.timeLabel}
                  </text>
                );
              })}
          </svg>
        </div>
      </div>

      {/* Six Pollutant Breakdown Matrix */}
      <div id="pollutants" className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Six-Pollutant Concentration Breakdown: {selectedRegion.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            NEA Singapore National Ambient Air Quality Standards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pollutants.map((item) => (
            <div
              key={item.formula}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {item.formula}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-[11px] font-semibold ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3">
                  <div>
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      {item.val}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      {item.unit}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Limit: {item.limit}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.percent > 90
                      ? 'bg-rose-500'
                      : item.percent > 60
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
