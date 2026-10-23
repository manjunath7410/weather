import React, { useState } from 'react';
import { SatelliteFeed } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { 
  Radio, 
  Crosshair, 
  Wifi, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Compass, 
  ArrowUpRight,
  Info
} from 'lucide-react';

interface SatelliteRosterProps {
  satellites: SatelliteFeed[];
  onSelectSatellite: (sat: SatelliteFeed) => void;
}

export const SatelliteRoster: React.FC<SatelliteRosterProps> = ({
  satellites,
  onSelectSatellite,
}) => {
  const { isLight } = useTheme();
  const [hoveredSatId, setHoveredSatId] = useState<string | null>(null);

  const [selectedBands, setSelectedBands] = useState<Record<string, string>>({
    'goes-16': 'Band 13 (Clean IR 10.3µm)',
    'goes-18': 'Band 08 (Water Vapor 6.2µm)',
    'mtg-i1': 'Band 14 (IR Window 11.2µm)',
    'himawari-9': 'Band 13 (Clean IR 10.3µm)',
    'sentinel-5p': 'Band 07 (TROPOMI NO2)',
    'noaa-21': 'Band M15 (VIIRS Thermal)',
  });

  const spectralBands = [
    { label: 'Band 02', desc: '0.64 µm High-Res Visible' },
    { label: 'Band 07', desc: '3.9 µm Shortwave IR Fire' },
    { label: 'Band 08', desc: '6.2 µm Upper Water Vapor' },
    { label: 'Band 13', desc: '10.3 µm Clean Convective IR' },
    { label: 'Band 14', desc: '11.2 µm Cloud Top Window' },
    { label: 'Band 16', desc: '13.3 µm CO2 Air Mass Layer' },
  ];

  return (
    <div className={`w-full border rounded-xl p-5 flex flex-col gap-6 shadow-xl transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d18] border-slate-800 text-slate-100'
    }`}>
      {/* Roster Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="text-xs uppercase font-mono font-semibold tracking-wider flex items-center gap-2">
            <span className="text-cyan-400">Orbital Ingestion Network</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Constellation Ground Feeds</span>
          </div>
          <h3 className="text-base font-bold mt-0.5 text-slate-100 font-mono">
            Real-Time Earth Observation Satellite Telemetry Streams
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            <span>Active Orbital Feeds: </span>
            <span className="font-bold text-emerald-400">{satellites.length} Satellites</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span>Total Stream Rate: </span>
            <span className="font-bold text-cyan-400">
              {satellites.reduce((acc, s) => acc + s.dataRateMbps, 0)} Mbps
            </span>
          </div>
        </div>
      </div>

      {/* Satellite Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {satellites.map((sat) => {
          const currentBand = selectedBands[sat.id] || 'Band 13 (Clean IR 10.3µm)';
          const isHovered = hoveredSatId === sat.id;

          const latFormatted = sat.latitude >= 0 
            ? `${sat.latitude.toFixed(2)}°N` 
            : `${Math.abs(sat.latitude).toFixed(2)}°S`;
          const lonFormatted = sat.longitude >= 0 
            ? `${sat.longitude.toFixed(2)}°E` 
            : `${Math.abs(sat.longitude).toFixed(2)}°W`;
          const mbpsFormatted = `${sat.dataRateMbps} Mbps`;
          const mbSecFormatted = `${(sat.dataRateMbps / 8).toFixed(1)} MB/s`;

          return (
            <div
              key={sat.id}
              onMouseEnter={() => setHoveredSatId(sat.id)}
              onMouseLeave={() => setHoveredSatId(null)}
              className={`rounded-xl border p-5 flex flex-col justify-between gap-4 transition-all duration-200 shadow-md relative ${
                isHovered
                  ? 'border-cyan-500/80 shadow-cyan-500/10 shadow-lg bg-[#070b14]'
                  : 'bg-[#06080e] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Hover-State Real-Time Telemetry Tooltip */}
              {isHovered && (
                <div 
                  className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-200 animate-fade-in w-[310px] max-w-[95vw]"
                  role="tooltip"
                >
                  <div className="bg-[#0b1222]/95 backdrop-blur-md border border-cyan-500/80 rounded-xl p-3 shadow-2xl shadow-cyan-950/80 text-xs font-mono text-slate-100 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-[11px]">
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        LIVE ORBITAL TELEMETRY
                      </span>
                      <span className="text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-[10px]">
                        {sat.health.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {/* Real-time throughput */}
                      <div className="p-1.5 rounded bg-[#060912] border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          Throughput
                        </span>
                        <span className="text-amber-300 font-bold text-sm block mt-0.5 tabular-nums">
                          {mbpsFormatted}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({mbSecFormatted})
                        </span>
                      </div>

                      {/* Current orbital coordinates */}
                      <div className="p-1.5 rounded bg-[#060912] border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                          <Crosshair className="w-3 h-3 text-cyan-400" />
                          Coordinates
                        </span>
                        <span className="text-cyan-300 font-bold text-xs block mt-0.5 tabular-nums">
                          {latFormatted}
                        </span>
                        <span className="text-cyan-300 font-bold text-xs block tabular-nums">
                          {lonFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Orbit: {sat.orbitType} @ {sat.altitudeKm.toLocaleString()} km</span>
                      <span className="text-slate-300">{(sat.packetCount / 1000).toFixed(1)}k pkts</span>
                    </div>
                  </div>

                  {/* Tooltip downward arrow anchor */}
                  <div className="w-2.5 h-2.5 bg-[#0b1222] border-r border-b border-cyan-500/80 rotate-45 mx-auto -mt-1.5 shadow-sm" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <span>{sat.agency}</span>
                      <span>·</span>
                      <span className="text-cyan-400">{sat.orbitType} ({sat.altitudeKm.toLocaleString()} km)</span>
                    </div>
                    <h4 className="text-base font-bold mt-0.5 text-slate-100 font-mono">
                      {sat.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 flex items-center gap-1 cursor-help"
                      title="Hover for real-time throughput & orbital coordinates"
                    >
                      <Activity className="w-2.5 h-2.5 text-cyan-400" />
                      Live Feed
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {sat.health}
                    </span>
                  </div>
                </div>

                {/* Sub-Satellite Coordinates & Swath */}
                <div className="space-y-1 text-xs font-mono p-3 rounded-lg border mt-3 bg-[#0a0f1d] border-slate-800/80">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-cyan-400" />
                      Sub-Sat Position:
                    </span>
                    <span className="font-bold text-cyan-300 tabular-nums">
                      {latFormatted}, {lonFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] truncate pt-0.5 text-slate-400">
                    <span className="text-slate-500">Active Sector:</span>
                    <span className="truncate font-medium text-slate-200">{sat.currentSwath}</span>
                  </div>
                  <div className="flex justify-between text-[11px] truncate pt-0.5 text-slate-400">
                    <span className="text-slate-500">Payload:</span>
                    <span className="truncate text-slate-300">{sat.instruments.join(', ')}</span>
                  </div>
                </div>

                {/* Spectral Radiometer Band Selector */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 text-slate-400">
                    <span>MULTI-SPECTRAL CHANNEL:</span>
                    <span className="font-semibold truncate max-w-[170px] text-cyan-400">{currentBand}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {spectralBands.slice(0, 3).map((b) => (
                      <button
                        key={b.label}
                        onClick={() => setSelectedBands((prev) => ({ ...prev, [sat.id]: `${b.label} (${b.desc.split(' ')[0]})` }))}
                        className={`text-[10px] font-mono px-1.5 py-1 rounded transition-colors truncate ${
                          currentBand.startsWith(b.label)
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                        title={b.desc}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Ingestion Metrics */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="block text-[10px] text-slate-500">CHANNELS</span>
                    <span className="font-bold text-slate-200">{sat.channels} Bands</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">NATIVE RES</span>
                    <span className="font-bold text-cyan-300">{sat.resolutionKm} km</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">BITRATE</span>
                    <span className="font-bold text-amber-300 tabular-nums">{sat.dataRateMbps} Mbps</span>
                  </div>
                </div>

                {/* Focus Button */}
                <button
                  onClick={() => onSelectSatellite(sat)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80"
                >
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  Focus Sub-Satellite View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
