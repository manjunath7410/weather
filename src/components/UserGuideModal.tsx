import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Globe2, 
  Cpu, 
  GitBranch, 
  BarChart3, 
  Radio, 
  Download, 
  Compass, 
  Sparkles,
  Info,
  ChevronRight,
  Play,
  TrendingUp
} from 'lucide-react';
import { WeatherLayer, ProjectionMode } from '../types/weather';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'monitor' | 'pipeline' | 'benchmark' | 'cluster' | 'sounding' | 'satellites') => void;
  onSelectScenario?: (scenarioId: string) => void;
  onChangeLayer?: (layer: WeatherLayer) => void;
  onChangeProjection?: (mode: ProjectionMode) => void;
  onOpenExport?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectScenario,
  onChangeLayer,
  onChangeProjection,
  onOpenExport,
}) => {
  const [guideSection, setGuideSection] = useState<'quickstart' | 'concepts' | 'features' | 'faq'>('quickstart');
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const quickStartSteps = [
    {
      step: 1,
      title: 'Global Climate Monitor & 3D Interactive Earth',
      badge: 'Main Viewport',
      icon: Globe2,
      summary: 'Explore real-time multi-spectral planetary layers and probe thermodynamic variables at any coordinate on Earth.',
      actionLabel: 'Go to Global Monitor',
      action: () => {
        onNavigateTab('monitor');
        onClose();
      },
      details: [
        'Drag the globe with your mouse to rotate; scroll to zoom in and out.',
        'Click anywhere on the globe to drop the Atmospheric Sounding Probe and inspect instant local pressure, wind velocity, and CAPE.',
        'Use the top-left projection button to switch between 3D Globe and 2D Robinson projection.',
        'Switch between Thermal IR, Water Vapor, Radar Precipitation, and Relative Vorticity layers.'
      ],
      interactiveTip: 'Clicking any coordinates immediately calculates full atmospheric column physics.'
    },
    {
      step: 2,
      title: 'Scenarios & Predictive Time Scrubber',
      badge: 'Climate Controls',
      icon: Compass,
      summary: 'Simulate high-impact meteorological events and scrub forward up to 72 hours of 4D-Var forecasted state.',
      actionLabel: 'Load Super Typhoon Scenario',
      action: () => {
        onNavigateTab('monitor');
        if (onSelectScenario) onSelectScenario('typhoon_cat5');
        onClose();
      },
      details: [
        'Select preconfigured extreme weather presets: Super Typhoon (Cat 5), Polar Vortex Intrusion, Atmospheric River Pineapple Express, or Sahel Heat Dome.',
        'Click "Play" or drag the timeline slider from T+00h (analysis time) up to T+72h forecast.',
        'Adjust grid resolution from 0.05° (~4.5 km ultra-fine) to 0.25° (~22.5 km macro-climate).',
        'Tune the ensemble member count (10 to 100 members) to observe perturbation spreads.'
      ],
      interactiveTip: 'Watch how atmospheric winds and brightness temperatures evolve hour by hour.'
    },
    {
      step: 3,
      title: 'Parallel DAG (Directed Acyclic Graph)',
      badge: 'Compute Pipeline',
      icon: GitBranch,
      summary: 'Inspect how raw multi-satellite telemetry flows through 4D-Var data assimilation into high-order fluid dynamics solvers.',
      actionLabel: 'View Parallel DAG',
      action: () => {
        onNavigateTab('pipeline');
        onClose();
      },
      details: [
        'Stage 1 (Constellation Ingestion): Decompresses multi-spectral radiance packets at gigabit rates.',
        'Stage 2 (Quality Control & Cloud Mask): Filters ground clutters and solar sensor glints.',
        'Stage 3 (4D-Var Cost Assimilation): Minimizes background error covariance against observational radiances.',
        'Stage 4 (Non-Hydrostatic Primitive Solver): Runs Navier-Stokes equations across finite atmospheric volume grids.',
        'Stage 5 (Spectral Post-Processing): Generates standardized NetCDF-4/Zarr products for climate research.'
      ],
      interactiveTip: 'Click "Trip Stage 2" to observe automated downstream fault propagation across dependent nodes.'
    },
    {
      step: 4,
      title: 'Parallel vs. Sequential Benchmark Simulator',
      badge: 'Speedup & Amdahl Lab',
      icon: TrendingUp,
      summary: 'Evaluate multi-core parallel scaling, Amdahl’s law efficiency limits, and communication overhead across 1 to 32 worker cores.',
      actionLabel: 'Launch Benchmark Lab',
      action: () => {
        onNavigateTab('benchmark');
        onClose();
      },
      details: [
        'Test datasets across 100 MB, 500 MB, 1 GB, and 5 GB cubes.',
        'Benchmark speedup ratio S = T_seq / T_par and parallel efficiency E = (S / N) × 100%.',
        'Compare actual speedup against the theoretical linear ceiling.',
        'Export verified benchmark CSV datasets for VTU examination analysis.'
      ],
      interactiveTip: 'Notice the diminishing returns as worker count scales beyond 16 cores due to synchronization barriers.'
    },
    {
      step: 5,
      title: 'Heterogeneous Compute Cluster Matrix',
      badge: 'Hardware Scaling',
      icon: Cpu,
      summary: 'Manage distributed acceleration hardware: NVIDIA H100 Tensor Core GPUs, AMD EPYC CPUs, and TPU v5e pods.',
      actionLabel: 'Inspect Compute Matrix',
      action: () => {
        onNavigateTab('cluster');
        onClose();
      },
      details: [
        'Use the node count slider to scale from 8 nodes up to 64 distributed compute workers.',
        'Monitor per-worker core utilization %, operating temperature (°C), memory bandwidth, and assigned pipeline task.',
        'See cluster aggregation statistics: total floating-point throughput (TFLOPS) and network fabric interconnects.'
      ],
      interactiveTip: 'Watch worker telemetry update continuously in real-time.'
    },
    {
      step: 6,
      title: 'Skew-T Log-P Thermodynamic Sounding',
      badge: 'Atmospheric Physics',
      icon: BarChart3,
      summary: 'Analyze vertical atmospheric stability, temperature lapse rates, and severe weather convective potential.',
      actionLabel: 'Open Skew-T Sounding',
      action: () => {
        onNavigateTab('sounding');
        onClose();
      },
      details: [
        'Displays vertical isobaric layers from 1000 hPa (surface) up to 100 hPa (stratosphere).',
        'Compares Environmental Temperature profile (red) vs Dewpoint profile (green).',
        'Calculates real-time Convective Available Potential Energy (CAPE) and Convective Inhibition (CIN).',
        'Shows wind barbs at standard pressure levels indicating wind speed and directional shear.'
      ],
      interactiveTip: 'Severe storm and tornado potentials correlate with CAPE values exceeding 2500 J/kg.'
    },
    {
      step: 7,
      title: 'Satellite Constellation & Data Export',
      badge: 'Operations & Research',
      icon: Radio,
      summary: 'Track live geostationary & polar-orbiting satellites and download WMO-compliant research datasets.',
      actionLabel: 'Export NetCDF-4 Dataset',
      action: () => {
        if (onOpenExport) {
          onOpenExport();
        } else {
          onNavigateTab('satellites');
        }
        onClose();
      },
      details: [
        'Monitor GOES-16, GOES-18, Meteosat-12, Himawari-9, Sentinel-5P, and JPSS-2.',
        'View live uplink bitrates, operational frequency bands (Ka-band / X-band / L-band), and downlink health.',
        'Export simulation runs as standardized NetCDF-4 binary metadata, GeoJSON vector grids, or CSV matrices.'
      ],
      interactiveTip: 'Ready for ingestion into Python Xarray, Panoply, and GIS workflows.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#0b101d] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-[#080c16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">AeroStream Engine Guide</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  From Scratch Walkthrough
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete operational guide for satellite ingest, 4D-Var data assimilation, and climate physics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Guide */}
        <div className="px-6 border-b border-slate-800 bg-[#07090e] flex items-center gap-6 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setGuideSection('quickstart')}
            className={`py-3 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              guideSection === 'quickstart'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Step-by-Step Interactive Tour
          </button>
          <button
            onClick={() => setGuideSection('concepts')}
            className={`py-3 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              guideSection === 'concepts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Core Concepts Explained
          </button>
          <button
            onClick={() => setGuideSection('features')}
            className={`py-3 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              guideSection === 'features'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            Features & Controls Cheat Sheet
          </button>
          <button
            onClick={() => setGuideSection('faq')}
            className={`py-3 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              guideSection === 'faq'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Quick FAQ & Tips
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* SECTION 1: Step-by-Step Interactive Tour */}
          {guideSection === 'quickstart' && (
            <div className="space-y-6">
              {/* Step indicator bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {quickStartSteps.map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeStep === s.step
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
                      <span>Step 0{s.step}</span>
                      {activeStep === s.step && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">
                      {s.badge}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Step Card */}
              {(() => {
                const current = quickStartSteps.find((s) => s.step === activeStep) || quickStartSteps[0];
                const IconComponent = current.icon;
                return (
                  <div className="bg-[#090d18] border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                              Step {current.step} of {quickStartSteps.length}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-400">{current.badge}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-100">{current.title}</h3>
                        </div>
                      </div>

                      <button
                        onClick={current.action}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
                      >
                        {current.actionLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {current.summary}
                    </p>

                    <div className="space-y-2 bg-[#060911] p-3.5 rounded-lg border border-slate-800/60">
                      <div className="text-xs font-mono uppercase text-slate-400 font-semibold">Key Instructions:</div>
                      <ul className="space-y-1.5">
                        {current.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pro Tip: {current.interactiveTip}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeStep > 1 && (
                          <button
                            onClick={() => setActiveStep((prev) => prev - 1)}
                            className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Previous
                          </button>
                        )}
                        {activeStep < quickStartSteps.length ? (
                          <button
                            onClick={() => setActiveStep((prev) => prev + 1)}
                            className="px-3 py-1 text-xs rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-colors flex items-center gap-1"
                          >
                            Next Step <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onNavigateTab('monitor');
                              onClose();
                            }}
                            className="px-3 py-1 text-xs rounded bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-colors"
                          >
                            Finish & Explore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SECTION 2: Core Concepts Explained */}
          {guideSection === 'concepts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <Radio className="w-4 h-4" />
                    1. Real-Time Satellite Ingestion
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AeroStream continuously ingests multi-spectral radiances from global geostationary satellites (GOES-16/18, MTG-I1, Himawari-9) and polar-orbiting sounders (Sentinel-5P, JPSS-2). The packets are validated, calibrated, and de-glinted in real time.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <GitBranch className="w-4 h-4" />
                    2. 4D-Var Data Assimilation
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Four-Dimensional Variational Data Assimilation (4D-Var) optimizes the initial state of the numerical weather model over a time window by minimizing differences between background forecasts and real-time physical observations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <Cpu className="w-4 h-4" />
                    3. Heterogeneous Parallel Workers
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Distributed across NVIDIA H100 GPUs (for matrix solves and tensor radiance calculations), AMD EPYC CPUs (for data decompression and I/O), and TPU pods (for spectral transform filters).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                    <BarChart3 className="w-4 h-4" />
                    4. Skew-T Log-P Thermodynamic Sounding
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Standard meteorological diagram where the y-axis represents logarithm of pressure (height) and isotherms are slanted (skewed). This enables instant visual assessment of atmospheric instability, inversion layers, CAPE, and wind shear.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-semibold text-cyan-300 block">Non-Hydrostatic Primitive Equations Engine</span>
                  AeroStream solves compressible, non-hydrostatic Navier-Stokes equations with explicit moisture microphysics. This allows accurate representation of deep convective updrafts in supercell storms and tropical cyclones.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Features & Controls Cheat Sheet */}
          {guideSection === 'features' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Control / Feature</th>
                      <th className="py-2.5 px-3">How to Use</th>
                      <th className="py-2.5 px-3">Result in AeroStream</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Left-Click + Drag on Globe</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Click on the Earth sphere and drag in any direction</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Rotates the 3D planetary viewpoint smoothly</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Mouse Scroll Wheel</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Scroll up/down over the viewport</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Zooms in for regional storm scale or zooms out for synoptic view</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Single Click on Coordinates</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Click any ocean or land location</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Drops the Atmospheric Probe and recalculates local thermodynamics</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Projection Toggle</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Top-left buttons (Globe vs Robinson Map)</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Switches between 3D spherical Earth and flat 2D projection</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Weather Layer Pills</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Click Thermal IR, Water Vapor, Radar, or Vorticity</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Renders dedicated atmospheric multi-spectral color ramps</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Timeline Scrubber</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Play button or slide between 0h and 72h</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Simulates atmospheric dynamics progression forward in time</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Pause/Run Ingest Button</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Top-right Header action button</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Toggles live packet telemetry stream and worker heartbeats</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">Export NetCDF Button</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">Top-right or footer link</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">Generates downloadable scientific NetCDF-4 / GeoJSON / Zarr schemas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: Quick FAQ & Tips */}
          {guideSection === 'faq' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-100 uppercase font-mono text-cyan-400">
                    Q: How do I investigate an active tropical cyclone or severe storm?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Click the "Typhoon Malakas (Cat 5)" preset in the Scenario panel, or click an alert card in the "Extreme Weather Anomalies" section below the globe. The camera centers directly onto the vortex, and the Atmospheric Sounding probe automatically profiles the storm eyewall.
                  </p>
                </div>

                <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-100 uppercase font-mono text-cyan-400">
                    Q: What does CAPE indicate in the Atmospheric Sounding?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Convective Available Potential Energy (CAPE) measures the buoyant energy an air parcel has when lifted through the atmosphere. Values above 2000 J/kg indicate severe convective thunderstorm and squall-line risks.
                  </p>
                </div>

                <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-100 uppercase font-mono text-cyan-400">
                    Q: Can I adjust cluster computing capacity?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Yes! Navigate to the "Compute Cluster" tab, where you can scale worker nodes from 8 to 64. You can see the load rebalance across GPU tensor cores and CPU pre-processing queues.
                  </p>
                </div>

                <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-100 uppercase font-mono text-cyan-400">
                    Q: Can I export simulation data to Python or GIS tools?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Yes. Click "Export NetCDF" in the top bar. You can choose between NetCDF-4 (CF-1.8 metadata compliance), GeoJSON, or Zarr, and download sample scientific files directly to your machine.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#080c16] border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            AeroStream Version 3.4.1 · WMO / IEEE 1588 Precision Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
          >
            Got It, Back to System
          </button>
        </div>
      </div>
    </div>
  );
};
