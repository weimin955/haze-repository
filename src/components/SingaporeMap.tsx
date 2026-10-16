import React, { useEffect, useRef, useState } from 'react';
import {
  AIR_QUALITY_LEVELS,
  REGIONAL_COORDINATES_POLYGONS,
  SINGAPORE_REGIONS,
} from '../constants/singaporeData';
import { PsiApiResponse, RegionData, RegionKey } from '../types/psi';
import {
  Compass,
  Layers,
  MapPin,
  Wind,
  Maximize2,
  Minimize2,
  Activity,
  AlertCircle,
} from 'lucide-react';
import L from 'leaflet';

interface SingaporeMapProps {
  data: PsiApiResponse;
  selectedRegionKey: RegionKey;
  onSelectRegion: (key: RegionKey) => void;
  psiThreshold: number;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  data,
  selectedRegionKey,
  onSelectRegion,
  psiThreshold,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeMetricLayer, setActiveMetricLayer] = useState<'psi' | 'pm25'>('psi');
  const [showWindOverlay, setShowWindOverlay] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'leaflet' | 'vector'>('leaflet');

  const selectedRegion: RegionData =
    data.regions[selectedRegionKey] || data.regions.national;
  const selectedLevel = AIR_QUALITY_LEVELS[selectedRegion.band];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (mapMode !== 'leaflet' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 11,
        minZoom: 10,
        maxZoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Render regional polygons
    (Object.keys(REGIONAL_COORDINATES_POLYGONS) as Array<Exclude<RegionKey, 'national'>>).forEach(
      (regKey) => {
        const polyData = REGIONAL_COORDINATES_POLYGONS[regKey];
        const regInfo = data.regions[regKey];
        const isSelected = selectedRegionKey === regKey;
        const isBreached = regInfo.readings.psi24h >= psiThreshold;
        const color = AIR_QUALITY_LEVELS[regInfo.band].color;

        const polygon = L.polygon(polyData.coordinates, {
          color: isSelected ? '#38bdf8' : color,
          weight: isSelected ? 3 : 1.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.18,
          dashArray: isBreached ? '4, 4' : undefined,
        });

        polygon.on('click', () => {
          onSelectRegion(regKey);
        });

        polygon.bindTooltip(
          `<strong>${regInfo.name}</strong><br/>24-hr PSI: ${regInfo.readings.psi24h}<br/>1-hr PM2.5: ${regInfo.readings.pm25Hourly} µg/m³`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs font-sans' }
        );

        polygon.addTo(layerGroup);

        // Marker Pin
        const displayValue =
          activeMetricLayer === 'psi'
            ? regInfo.readings.psi24h
            : `${regInfo.readings.pm25Hourly}µg`;

        const markerHtml = `
          <div class="relative group cursor-pointer transition-transform duration-150 hover:scale-110">
            <div class="flex items-center gap-1 px-2 py-1 rounded shadow-lg border ${
              isSelected
                ? 'border-cyan-400 bg-slate-900 ring-2 ring-cyan-500/40 text-cyan-300'
                : 'border-slate-700 bg-slate-950/90 text-slate-100'
            }">
              <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
              <span class="text-xs font-mono font-bold tabular-nums">${displayValue}</span>
            </div>
            ${
              isBreached
                ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-ping"></div>`
                : ''
            }
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-psi-marker',
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });

        const marker = L.marker([polyData.center[0], polyData.center[1]], {
          icon,
        });

        marker.on('click', () => {
          onSelectRegion(regKey);
        });

        marker.addTo(layerGroup);
      }
    );

    // If a specific region is selected, pan smoothly
    if (selectedRegionKey !== 'national') {
      const coord = SINGAPORE_REGIONS[selectedRegionKey];
      map.panTo([coord.latitude, coord.longitude], { animate: true, duration: 0.8 });
    } else {
      map.panTo([1.3521, 103.8198], { animate: true, duration: 0.8 });
    }
  }, [mapMode, activeMetricLayer, selectedRegionKey, data, psiThreshold, onSelectRegion]);

  return (
    <div id="interactive-map" className="space-y-3">
      {/* Map Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Map Metric:</span>
          </div>
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveMetricLayer('psi')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeMetricLayer === 'psi'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-Hr PSI
            </button>
            <button
              onClick={() => setActiveMetricLayer('pm25')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeMetricLayer === 'pm25'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Hr PM2.5
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowWindOverlay(!showWindOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              showWindOverlay
                ? 'bg-slate-800 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind & Vector Flow</span>
          </button>

          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMapMode('leaflet')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                mapMode === 'leaflet'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Leaflet GIS
            </button>
            <button
              onClick={() => setMapMode('vector')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                mapMode === 'vector'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical Vector
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Overlay Split */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {mapMode === 'leaflet' ? (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        ) : (
          /* Tactical SVG Vector Map fallback with high-definition Singapore Island projection */
          <div className="w-full h-full p-4 flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Grid coordinate overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <svg
              viewBox="0 0 900 520"
              className="w-full h-full max-h-[480px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Singapore Mainland Outline Vector Base */}
              <g className="transition-all duration-300">
                {/* West Sector */}
                <path
                  d="M 120 220 L 260 140 L 370 230 L 320 340 L 190 380 L 100 310 Z"
                  fill={AIR_QUALITY_LEVELS[data.regions.west.band].bgColor}
                  stroke={selectedRegionKey === 'west' ? '#38bdf8' : AIR_QUALITY_LEVELS[data.regions.west.band].color}
                  strokeWidth={selectedRegionKey === 'west' ? '3' : '1.5'}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSelectRegion('west')}
                />
                {/* North Sector */}
                <path
                  d="M 260 140 L 460 70 L 540 160 L 440 220 L 370 230 Z"
                  fill={AIR_QUALITY_LEVELS[data.regions.north.band].bgColor}
                  stroke={selectedRegionKey === 'north' ? '#38bdf8' : AIR_QUALITY_LEVELS[data.regions.north.band].color}
                  strokeWidth={selectedRegionKey === 'north' ? '3' : '1.5'}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSelectRegion('north')}
                />
                {/* Central Sector */}
                <path
                  d="M 370 230 L 440 220 L 510 270 L 480 340 L 380 340 L 320 340 Z"
                  fill={AIR_QUALITY_LEVELS[data.regions.central.band].bgColor}
                  stroke={selectedRegionKey === 'central' ? '#38bdf8' : AIR_QUALITY_LEVELS[data.regions.central.band].color}
                  strokeWidth={selectedRegionKey === 'central' ? '3' : '1.5'}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSelectRegion('central')}
                />
                {/* East Sector */}
                <path
                  d="M 540 160 L 740 180 L 780 260 L 680 340 L 510 270 L 440 220 Z"
                  fill={AIR_QUALITY_LEVELS[data.regions.east.band].bgColor}
                  stroke={selectedRegionKey === 'east' ? '#38bdf8' : AIR_QUALITY_LEVELS[data.regions.east.band].color}
                  strokeWidth={selectedRegionKey === 'east' ? '3' : '1.5'}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSelectRegion('east')}
                />
                {/* South Sector */}
                <path
                  d="M 320 340 L 380 340 L 480 340 L 510 270 L 680 340 L 560 410 L 400 420 L 320 380 Z"
                  fill={AIR_QUALITY_LEVELS[data.regions.south.band].bgColor}
                  stroke={selectedRegionKey === 'south' ? '#38bdf8' : AIR_QUALITY_LEVELS[data.regions.south.band].color}
                  strokeWidth={selectedRegionKey === 'south' ? '3' : '1.5'}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => onSelectRegion('south')}
                />

                {/* Sentosa Island */}
                <ellipse
                  cx="430"
                  cy="445"
                  rx="35"
                  ry="12"
                  fill={AIR_QUALITY_LEVELS[data.regions.south.band].bgColor}
                  stroke={AIR_QUALITY_LEVELS[data.regions.south.band].color}
                  strokeWidth="1"
                />

                {/* Pulau Ubin & Tekong (East) */}
                <ellipse
                  cx="700"
                  cy="140"
                  rx="30"
                  ry="10"
                  fill={AIR_QUALITY_LEVELS[data.regions.east.band].bgColor}
                  stroke={AIR_QUALITY_LEVELS[data.regions.east.band].color}
                  strokeWidth="1"
                />
                <ellipse
                  cx="760"
                  cy="150"
                  rx="30"
                  ry="14"
                  fill={AIR_QUALITY_LEVELS[data.regions.east.band].bgColor}
                  stroke={AIR_QUALITY_LEVELS[data.regions.east.band].color}
                  strokeWidth="1"
                />
              </g>

              {/* Station Markers with Labels */}
              {[
                { key: 'west' as RegionKey, x: 230, y: 260 },
                { key: 'north' as RegionKey, x: 420, y: 150 },
                { key: 'central' as RegionKey, x: 420, y: 280 },
                { key: 'east' as RegionKey, x: 630, y: 250 },
                { key: 'south' as RegionKey, x: 470, y: 370 },
              ].map((pin) => {
                const reg = data.regions[pin.key];
                const isSelected = selectedRegionKey === pin.key;
                const isBreached = reg.readings.psi24h >= psiThreshold;
                const displayVal =
                  activeMetricLayer === 'psi' ? reg.readings.psi24h : `${reg.readings.pm25Hourly}µg`;

                return (
                  <g
                    key={pin.key}
                    transform={`translate(${pin.x}, ${pin.y})`}
                    className="cursor-pointer transition-transform duration-150 hover:scale-105"
                    onClick={() => onSelectRegion(pin.key)}
                  >
                    <rect
                      x="-42"
                      y="-18"
                      width="84"
                      height="36"
                      rx="6"
                      fill="#090d16"
                      stroke={isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1'}
                    />
                    <circle
                      cx="-26"
                      cy="0"
                      r="4"
                      fill={AIR_QUALITY_LEVELS[reg.band].color}
                    />
                    <text
                      x="-16"
                      y="-4"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="600"
                      className="uppercase"
                    >
                      {pin.key}
                    </text>
                    <text
                      x="-16"
                      y="11"
                      fill="#f8fafc"
                      fontSize="12"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {displayVal}
                    </text>
                    {isBreached && (
                      <circle cx="36" cy="-12" r="4" fill="#f43f5e" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Floating Telemetry HUD (Selected Region Focus) */}
        <div className="absolute top-4 left-4 z-[500] max-w-xs w-full bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {selectedRegion.name}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {SINGAPORE_REGIONS[selectedRegionKey].stationName}
              </p>
            </div>
            <div
              className="text-[11px] font-bold px-2 py-0.5 rounded border"
              style={{
                color: selectedLevel.color,
                backgroundColor: selectedLevel.bgColor,
                borderColor: selectedLevel.borderColor,
              }}
            >
              {selectedLevel.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                24-Hr PSI
              </span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {selectedRegion.readings.psi24h}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Band: {selectedLevel.psiRange}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                1-Hr PM2.5
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {selectedRegion.readings.pm25Hourly}
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  µg/m³
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Safe: &lt;55 µg/m³
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <span className="text-slate-400 font-medium">Coverage: </span>
            <span>{SINGAPORE_REGIONS[selectedRegionKey].suburbs.slice(0, 3).join(', ')}...</span>
          </div>
        </div>

        {/* Floating Wind & Atmospheric Vector Compass (Bottom Left) */}
        {showWindOverlay && (
          <div className="absolute bottom-4 left-4 z-[500] bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl pointer-events-auto flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
              <div
                className="transition-transform duration-700 ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${data.wind.bearingDeg}deg)`,
                }}
              >
                <div className="w-0.5 h-6 bg-cyan-400 relative">
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 transform -rotate-45" />
                </div>
              </div>
              <span className="absolute top-0.5 text-[8px] font-mono text-slate-400 font-bold">
                N
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Surface Wind: {data.wind.direction} at {data.wind.speedKmH} km/h
                </span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-[220px] leading-tight mt-0.5">
                {data.wind.summary}
              </p>
            </div>
          </div>
        )}

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-[500] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            NEA PSI Band Spectrum
          </div>
          <div className="flex items-center gap-2">
            {(['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'] as const).map(
              (band) => {
                const info = AIR_QUALITY_LEVELS[band];
                return (
                  <div key={band} className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-[10px] text-slate-300 font-mono">
                      {info.label}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
