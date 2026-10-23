import React, { useState, useEffect } from 'react';
import { 
  ProjectionMode, 
  WeatherLayer, 
  AtmosphericProbe, 
  SatelliteFeed, 
  ScenarioPreset,
  AnomalyEvent
} from './types/weather';
import { INITIAL_SATELLITES, SCENARIO_PRESETS, INITIAL_ANOMALIES } from './data/satellites';
import { sampleAtmosphereAt } from './services/atmosphericPhysics';
import { INITIAL_PIPELINE_STAGES, generateWorkerCluster } from './services/pipelineSimulator';
import { Header } from './components/Header';
import { GlobalClimateGlobe } from './components/GlobalClimateGlobe';
import { ClimateModelControls } from './components/ClimateModelControls';
import { AtmosphericSounding } from './components/AtmosphericSounding';
import { PipelineGraph } from './components/PipelineGraph';
import { ClusterWorkerMatrix } from './components/ClusterWorkerMatrix';
import { SatelliteRoster } from './components/SatelliteRoster';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import { ExportModal } from './components/ExportModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ParallelBenchmark } from './components/ParallelBenchmark';
import { 
  Activity, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  Thermometer, 
  Layers, 
  Radio, 
  Compass, 
  ArrowUpRight 
} from 'lucide-react';

export default function App() {
  // Navigation & Pipeline State
  const [activeTab, setActiveTab] = useState<'monitor' | 'pipeline' | 'benchmark' | 'cluster' | 'sounding' | 'satellites'>('monitor');
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Visualization & Scenario State
  const [projection, setProjection] = useState<ProjectionMode>('globe');
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('thermal_ir');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('typhoon_cat5');
  const [showWindParticles, setShowWindParticles] = useState<boolean>(true);
  const [showSatellites, setShowSatellites] = useState<boolean>(true);

  // Model Timeline Scrubber State
  const [modelHour, setModelHour] = useState<number>(12);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [gridResolution, setGridResolution] = useState<string>('0.10');
  const [ensembleMembers, setEnsembleMembers] = useState<number>(50);

  // Probe & Sounding Coordinates (defaults to Super Typhoon Malakas center)
  const [selectedProbe, setSelectedProbe] = useState<AtmosphericProbe>(() =>
    sampleAtmosphereAt(18.4, 132.8, 'typhoon_cat5', 12)
  );

  // Pipeline Telemetry & Cluster State
  const [stages, setStages] = useState(INITIAL_PIPELINE_STAGES);
  const [workerCount, setWorkerCount] = useState<number>(32);
  const [workers, setWorkers] = useState(() => generateWorkerCluster(32));
  const [satellites, setSatellites] = useState<SatelliteFeed[]>(INITIAL_SATELLITES);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  const [cycleTime, setCycleTime] = useState<number>(0);

  // Regeneration of worker pool when count changes
  useEffect(() => {
    setWorkers(generateWorkerCluster(workerCount));
  }, [workerCount]);

  // Real-Time Background Pipeline & Packet Tick Loop
  useEffect(() => {
    if (!isRunningPipeline) return;

    const interval = setInterval(() => {
      setCycleTime((prev) => prev + 1);

      // Increment satellite packet counters
      setSatellites((prevSats) =>
        prevSats.map((sat) => ({
          ...sat,
          packetCount: sat.packetCount + Math.floor(sat.dataRateMbps * 12),
        }))
      );

      // Subtle live worker utilization heartbeat
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => {
          const delta = (Math.random() - 0.5) * 6;
          const newUtil = Math.round(Math.max(20, Math.min(99, w.utilization + delta)));
          return {
            ...w,
            utilization: newUtil,
            temperatureC: Math.round(52 + (newUtil / 100) * 26),
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunningPipeline]);

  // Timeline auto-advancement loop when playing
  useEffect(() => {
    if (!isPlayingTimeline) return;

    const timer = setInterval(() => {
      setModelHour((prev) => {
        const next = prev + 1;
        return next > 72 ? 0 : next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlayingTimeline]);

  // Update probe values when forecast modelHour shifts
  useEffect(() => {
    setSelectedProbe((prev) =>
      sampleAtmosphereAt(prev.latitude, prev.longitude, activeScenarioId, modelHour)
    );
  }, [modelHour]);

  // Scenario selection handler
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setActiveScenarioId(scenario.id);
    setActiveLayer(scenario.activeLayer);
    setSelectedProbe(
      sampleAtmosphereAt(scenario.targetLat, scenario.targetLon, scenario.id, modelHour)
    );
  };

  // Satellite selection handler
  const handleSelectSatellite = (sat: SatelliteFeed) => {
    setSelectedProbe(
      sampleAtmosphereAt(sat.latitude, sat.longitude, activeScenarioId, modelHour)
    );
    setActiveTab('monitor');
  };

  // Anomaly inspection handler
  const handleSelectAnomaly = (anom: AnomalyEvent) => {
    setSelectedProbe(
      sampleAtmosphereAt(anom.coordinates[0], anom.coordinates[1], activeScenarioId, modelHour)
    );
    setActiveTab('monitor');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Header Contract */}
      <Header
        isRunning={isRunningPipeline}
        onTogglePipeline={() => setIsRunningPipeline(!isRunningPipeline)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportClick={() => setIsExportModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Top Telemetry Precision Ribbon (Scientific Authority) */}
      <div className="w-full bg-[#0a0f1d] border-b border-slate-800/80 px-6 py-2 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">PIPELINE:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              4D-VAR NOMINAL
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CYCLE:</span>
            <span className="text-slate-200 font-semibold tabular-nums">
              T+{Math.floor(cycleTime / 60)}m:{cycleTime % 60 < 10 ? `0${cycleTime % 60}` : cycleTime % 60}s
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-500">INGESTED SOUNDINGS:</span>
            <span className="text-cyan-400 font-semibold tabular-nums">
              {(satellites.reduce((acc, s) => acc + s.packetCount, 0) / 1000000).toFixed(2)}M pkts
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">DYNAMIC CORE GRID:</span>
            <span className="text-slate-200 font-semibold">
              {gridResolution}° (~{Number(gridResolution) * 90} km)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>ENSEMBLE MEMBERS:</span>
            <span className="text-amber-400 font-bold">{ensembleMembers}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>RESIDUAL NORM:</span>
            <span className="text-emerald-400 font-mono">||∇J|| = 4.12e-5</span>
          </div>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline flex items-center gap-1"
            title="Open system walkthrough from scratch"
          >
            <span>▶ New User Guide</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* TAB 1: Global Planetary Monitor */}
        {activeTab === 'monitor' && (
          <div className="flex flex-col gap-6">
            {/* Split Console: 3D Interactive Canvas & Quick Probe Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Planetary Canvas Viewport */}
              <div className="lg:col-span-8 rounded-xl overflow-hidden border border-slate-800 h-[560px] relative shadow-lg">
                <GlobalClimateGlobe
                  projection={projection}
                  setProjection={setProjection}
                  activeLayer={activeLayer}
                  setActiveLayer={setActiveLayer}
                  activeScenarioId={activeScenarioId}
                  modelHour={modelHour}
                  satellites={satellites}
                  selectedProbe={selectedProbe}
                  setSelectedProbe={setSelectedProbe}
                  showWindParticles={showWindParticles}
                  setShowWindParticles={setShowWindParticles}
                  showSatellites={showSatellites}
                  setShowSatellites={setShowSatellites}
                />
              </div>

              {/* Side Column: Sounding Snapshot & Key Atmospheric Indices */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div className="bg-[#0a0e1a] rounded-xl border border-slate-800 p-4.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs uppercase font-mono text-cyan-400 font-semibold">
                        Atmospheric Column Telemetry
                      </span>
                      <button
                        onClick={() => setActiveTab('sounding')}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        Full Skew-T <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-mono">TARGET COORDINATES</span>
                        <span className="text-sm font-bold text-slate-100 font-mono">
                          {selectedProbe.latitude >= 0 ? `${selectedProbe.latitude}°N` : `${Math.abs(selectedProbe.latitude)}°S`},{' '}
                          {selectedProbe.longitude >= 0 ? `${selectedProbe.longitude}°E` : `${Math.abs(selectedProbe.longitude)}°W`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">SFC Pressure</span>
                          <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                            {selectedProbe.surfacePressureHpa}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">hPa</span>
                        </div>

                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Cloud Top Tb</span>
                          <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                            {selectedProbe.brightnessTempK}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">K</span>
                        </div>

                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Wind Velocity</span>
                          <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                            {selectedProbe.windSpeedKts}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">kts @ {selectedProbe.windDirectionDeg}°</span>
                        </div>

                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Column PWV</span>
                          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                            {selectedProbe.precipitableWaterMm}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">mm</span>
                        </div>

                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">CAPE Energy</span>
                          <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                            {selectedProbe.capeJkg}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">J/kg</span>
                        </div>

                        <div className="bg-[#06080e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Relative Humidity</span>
                          <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                            {selectedProbe.relativeHumidityPct}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Micro-diagnostic footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Vorticity: {selectedProbe.vorticityRate} × 10⁻⁵ s⁻¹</span>
                    <span className="text-cyan-400">Flux: {selectedProbe.radiativeFluxWm2} W/m²</span>
                  </div>
                </div>

                {/* Quick Ingest Constellation Status Bar */}
                <div className="bg-[#0a0e1a] rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-mono text-slate-400 block">Active Constellation</span>
                    <span className="text-sm font-bold text-slate-200">
                      6 Operational Satellites Streaming
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('satellites')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors"
                  >
                    View Constellation
                  </button>
                </div>
              </div>
            </div>

            {/* Scenario Presets & Timeline Scrubber */}
            <ClimateModelControls
              activeScenarioId={activeScenarioId}
              onSelectScenario={handleSelectScenario}
              modelHour={modelHour}
              setModelHour={setModelHour}
              isPlayingTimeline={isPlayingTimeline}
              setIsPlayingTimeline={setIsPlayingTimeline}
              gridResolution={gridResolution}
              setGridResolution={setGridResolution}
              ensembleMembers={ensembleMembers}
              setEnsembleMembers={setEnsembleMembers}
            />

            {/* Extreme Weather Anomaly Alerts */}
            <AnomalyAlerts
              anomalies={anomalies}
              onSelectAnomaly={handleSelectAnomaly}
            />
          </div>
        )}

        {/* TAB 2: Parallel DAG Pipeline */}
        {activeTab === 'pipeline' && (
          <PipelineGraph stages={stages} />
        )}

        {/* TAB 3: Parallel vs. Sequential Benchmark Simulator */}
        {activeTab === 'benchmark' && (
          <ParallelBenchmark />
        )}

        {/* TAB 4: Heterogeneous Compute Cluster & Fault Lab */}
        {activeTab === 'cluster' && (
          <ClusterWorkerMatrix
            workers={workers}
            workerCount={workerCount}
            setWorkerCount={setWorkerCount}
          />
        )}

        {/* TAB 5: Atmospheric Sounding (Skew-T Log-P) */}
        {activeTab === 'sounding' && (
          <AtmosphericSounding 
            probe={selectedProbe} 
            onSelectPresetLocation={(lat, lon, scId) => {
              setActiveScenarioId(scId);
              setSelectedProbe(sampleAtmosphereAt(lat, lon, scId, modelHour));
            }}
          />
        )}

        {/* TAB 5: Satellite Constellation Roster */}
        {activeTab === 'satellites' && (
          <SatelliteRoster
            satellites={satellites}
            onSelectSatellite={handleSelectSatellite}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#07090e] px-6 py-4 mt-auto text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span>AeroStream Planetary Computing Core</span>
          <span className="mx-2">·</span>
          <span>4D-Var Data Assimilation & Non-Hydrostatic Climate Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span>GOES-16/18 · MTG-I1 · Himawari-9 · Sentinel-5P · JPSS-2</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">IEEE / WMO Standard Compliant</span>
        </div>
      </footer>

      {/* NetCDF-4 Science Data Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        probe={selectedProbe}
        activeScenarioId={activeScenarioId}
        modelHour={modelHour}
      />

      {/* Interactive System Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateTab={setActiveTab}
        onSelectScenario={(scenarioId) => {
          const sc = SCENARIO_PRESETS.find((s) => s.id === scenarioId);
          if (sc) handleSelectScenario(sc);
        }}
        onChangeLayer={setActiveLayer}
        onChangeProjection={setProjection}
        onOpenExport={() => setIsExportModalOpen(true)}
      />
    </div>
  );
}
