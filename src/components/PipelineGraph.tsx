import React, { useState, useEffect, useMemo } from 'react';
import { PipelineStage } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Database, 
  Zap, 
  Clock, 
  ChevronRight,
  Sliders,
  CheckCircle2,
  HardDrive,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  AlertOctagon,
  Download,
  AlertTriangle,
  ArrowRight,
  Info,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

interface PipelineGraphProps {
  stages: PipelineStage[];
  onUpdateWorkerCount?: (stageId: string, count: number) => void;
}

export const PipelineGraph: React.FC<PipelineGraphProps> = ({ stages: initialStages }) => {
  const { isLight } = useTheme();
  const [stages, setStages] = useState<PipelineStage[]>(initialStages);
  const [selectedStageId, setSelectedStageId] = useState<string>('stage_4dvar'); // Default to 4D-Var
  const [isSolving4DVar, setIsSolving4DVar] = useState<boolean>(false);
  const [solverIteration, setSolverIteration] = useState<number>(12);
  const [costHistory, setCostHistory] = useState<number[]>([
    14820, 9340, 5820, 3410, 2190, 1420, 940, 680, 510, 420, 360, 310, 285
  ]);

  // Failure and recovery state
  const [failedStageId, setFailedStageId] = useState<string | null>(null);

  // Sync with initialStages if changed externally
  useEffect(() => {
    setStages(initialStages);
  }, [initialStages]);

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  // Calculate downstream affected stages using DAG dependencies
  const downstreamFailedIds = useMemo(() => {
    if (!failedStageId) return new Set<string>();
    const downstream = new Set<string>();

    const checkDownstream = (currentId: string) => {
      stages.forEach((s) => {
        if (s.dependencies.includes(currentId) && !downstream.has(s.id)) {
          downstream.add(s.id);
          checkDownstream(s.id);
        }
      });
    };

    checkDownstream(failedStageId);
    return downstream;
  }, [failedStageId, stages]);

  // Adjust worker core allocation for a stage
  const handleAdjustWorkers = (stageId: string, delta: number) => {
    setStages((prevStages) =>
      prevStages.map((s) => {
        if (s.id !== stageId) return s;
        const newWorkers = Math.max(2, Math.min(24, s.assignedWorkers + delta));
        const speedup = Math.sqrt(newWorkers / s.assignedWorkers);
        return {
          ...s,
          assignedWorkers: newWorkers,
          latencyMs: Number((s.latencyMs / speedup).toFixed(1)),
          throughputMBs: Math.round(s.throughputMBs * speedup),
        };
      })
    );
  };

  // Inject stage failure
  const handleInjectFailure = (stageId: string) => {
    setFailedStageId(stageId);
    setStages((prev) =>
      prev.map((s) => {
        if (s.id === stageId) {
          return {
            ...s,
            status: 'failed',
            failureReason: 'Thermal trip / L1b Radiance Parity Checksum Error',
          };
        }
        return s;
      })
    );
  };

  // Recover from failure
  const handleRecoverPipeline = () => {
    setFailedStageId(null);
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'running',
        failureReason: undefined,
      }))
    );
  };

  // Run interactive 4D-Var Variational solver sweep
  const handleRun4DVarSolver = () => {
    if (isSolving4DVar) return;
    setIsSolving4DVar(true);
    setSolverIteration(1);
    setCostHistory([14820]);

    let iter = 1;
    const interval = setInterval(() => {
      iter += 1;
      setSolverIteration(iter);
      setCostHistory((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.round(last * (0.68 + Math.random() * 0.12));
        return [...prev, Math.max(240, next)];
      });

      if (iter >= 12) {
        clearInterval(interval);
        setIsSolving4DVar(false);
      }
    }, 280);
  };

  // Export pipeline execution logs CSV
  const handleExportDAGLogs = () => {
    const header = 'Stage_Number,Stage_ID,Stage_Name,Status,Workers,Latency_ms,Throughput_MBs,Queue_Depth,Dependencies\n';
    const rows = stages
      .map(
        (s) =>
          `${s.stageNumber},"${s.id}","${s.name}","${failedStageId === s.id ? 'failed' : downstreamFailedIds.has(s.id) ? 'blocked' : s.status}",${s.assignedWorkers},${s.latencyMs},${s.throughputMBs},${s.queueDepth},"${s.dependencies.join(';')}"`
      )
      .join('\n');

    const meta = `# AeroStream Parallel Weather DAG Execution Log\n# Timestamp: ${new Date().toISOString()}\n`;
    const blob = new Blob([meta + header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aerostream_dag_execution_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stageDetails: Record<string, { math: string; description: string; kernels: string[]; inputs: string; outputs: string }> = {
    stage_ingest: {
      math: 'P(t) = \\sum_{s \\in S} \\text{Demux}(\\text{CCSDS}_s(t))',
      description: 'Demultiplexes high-rate raw L0 packet bitstreams across GOES-16/18 ABI, Meteosat FCI, Himawari AHI, and polar sounders. Employs SIMD Huffman and CCSDS lossy/lossless decompression.',
      kernels: ['ccsd_packet_depacketizer_avx2', 'crc32_frame_validator', 'dma_ringbuffer_sync'],
      inputs: 'Raw S-Band / X-Band Telemetry Frames (120 Mbps)',
      outputs: 'Decoded L0 Raw Swath Chunks in Shared Memory',
    },
    stage_cal: {
      math: 'L_{\\lambda} = G_{\\lambda} \\cdot (C - C_0) + \\Delta L_{\\text{inst}}',
      description: 'Converts instrument digital count values to calibrated spectral radiances and brightness temperatures. Performs real-time geometric image navigation and registration (INR) with sub-pixel parallax correction.',
      kernels: ['radiometric_gain_correction_avx512', 'ellipsoidal_geolocation_transform', 'solar_zenith_parallax_warp'],
      inputs: 'L0 Demuxed Sensor Counts & Ephemeris Vectors',
      outputs: 'Calibrated L1b Top-of-Atmosphere Radiances (Tb [K])',
    },
    stage_optflow: {
      math: '\\min_{\\vec{u}} \\int (\\nabla I \\cdot \\vec{u} + I_t)^2 + \\alpha^2 (|\\nabla u|^2 + |\\nabla v|^2) d\\Omega',
      description: 'Computes multi-level Atmospheric Motion Vectors (AMVs) by cross-correlating successive thermal IR and water vapor cloud swaths. Tracks cloud motion vectors across tropospheric pressure altitudes.',
      kernels: ['cross_correlation_fft_cuda', 'dense_optical_flow_horn_schunck', 'cloud_drift_height_assigner'],
      inputs: 'Consecutive L1b 10-Minute Full Disc Swaths (10.3 µm & 6.9 µm)',
      outputs: 'Horizontal Wind Vectors (u, v) at 850, 500, 300, 200 hPa',
    },
    stage_4dvar: {
      math: 'J(x) = \\frac{1}{2}(x - x_b)^T B^{-1}(x - x_b) + \\frac{1}{2}(y - \\mathcal{H}(x))^T R^{-1}(y - \\mathcal{H}(x))',
      description: 'Solves the 4-Dimensional Variational Data Assimilation problem over a 6-hour rolling window. Blends satellite radiances with background ensemble fields using an iterative preconditioned Conjugate Gradient solver.',
      kernels: ['enkf_covariance_perturbation', 'cg_minimizer_lanczos', 'adjoint_observation_operator_H'],
      inputs: 'L1b Radiances + L2 AMVs + Background Ensemble State',
      outputs: 'Analysis Atmospheric State Vector x_a (Optimal Initial Conditions)',
    },
    stage_dyn_core: {
      math: '\\frac{\\partial \\rho}{\\partial t} + \\nabla \\cdot (\\rho \\vec{u}) = 0, \\quad \\frac{D\\vec{u}}{Dt} + 2\\vec{\\Omega} \\times \\vec{u} = -\\frac{1}{\\rho}\\nabla p + \\vec{g} + \\vec{F}',
      description: 'High-resolution non-hydrostatic dynamical atmospheric core running on an icosahedral hexagonal mesh grid (0.1° resolution). Solves fully compressible Euler/Navier-Stokes equations with physics parameterizations.',
      kernels: ['icosahedral_flux_reconstruction', 'nonhydrostatic_acoustic_step', 'cloud_microphysics_thompson'],
      inputs: 'Initial State Vector x_a + Radiative Boundary Forcing',
      outputs: 'High-Resolution 72-Hour Prognostic Forecast Fields',
    },
    stage_distribution: {
      math: '\\text{ZarrChunk}_{i,j,k} = \\text{BloscCompress}(\\mathcal{F}_{\\text{model}}(t))',
      description: 'Real-time multi-threaded compression and broadcasting into cloud-native NetCDF-4, Zarr, and web map tile caches. Synchronizes streaming feeds to research clusters and operational disaster centers.',
      kernels: ['blosc_zstd_parallel_compress', 'geotiff_pyramid_generator', 'websocket_telemetry_broadcast'],
      inputs: 'Model Forecast Grid & Extreme Alert Events',
      outputs: 'Cloud Zarr Datastores & Operational GeoTIFF Slices',
    },
  };

  const details = stageDetails[selectedStage.id] || stageDetails['stage_4dvar'];
  const totalThroughput = stages.reduce((acc, s) => acc + s.throughputMBs, 0);
  const totalLatency = stages.reduce((acc, s) => acc + s.latencyMs, 0);
  const avgCompletion = Math.round(stages.reduce((acc, s) => acc + s.completionPct, 0) / stages.length);

  return (
    <div className={`w-full border rounded-xl p-5 flex flex-col gap-6 shadow-xl transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d18] border-slate-800 text-slate-100'
    }`}>
      {/* Header and Topology Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="text-xs uppercase font-mono font-semibold tracking-wider flex items-center gap-2">
            <span className="text-cyan-400">Parallel Computing Architecture</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Directed Acyclic Graph (DAG) Pipeline</span>
          </div>
          <h3 className="text-base font-bold mt-0.5 text-slate-100 font-mono">
            6-Stage Weather Processing & Data Assimilation Workflow
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDAGLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export DAG Logs
          </button>

          {failedStageId ? (
            <button
              onClick={handleRecoverPipeline}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recover & Resync Pipeline
            </button>
          ) : (
            <button
              onClick={() => handleInjectFailure('stage_cal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
              title="Test downstream fault propagation on Stage 2"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Inject Stage 2 Failure
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Status Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#06080e] p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">PIPELINE COMPLETION</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-cyan-400" 
                style={{ width: `${failedStageId ? 33 : avgCompletion}%` }}
              />
            </div>
            <span className="text-slate-200 font-bold">{failedStageId ? '33% (Halted)' : `${avgCompletion}%`}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block">END-TO-END LATENCY</span>
          <span className="text-emerald-400 font-bold text-sm">{totalLatency.toFixed(1)} ms</span>
        </div>

        <div>
          <span className="text-slate-500 block">TOTAL THROUGHPUT</span>
          <span className="text-cyan-400 font-bold text-sm">{(totalThroughput / 1024).toFixed(2)} GB/s</span>
        </div>

        <div>
          <span className="text-slate-500 block">WORKFLOW HEALTH</span>
          {failedStageId ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              CASCADE BLOCKED ({1 + downstreamFailedIds.size} STAGES)
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PIPELINE NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* Downstream Failure Alert Banner (Feature 2 Requirement) */}
      {failedStageId && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/60 text-xs font-mono text-rose-200 flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 block text-sm">
                Upstream Fault Injected: Stage 02 ({stages.find(s => s.id === failedStageId)?.name})
              </span>
              <p className="text-rose-200/90 text-xs mt-1">
                Downstream stages ({Array.from(downstreamFailedIds).map(id => stages.find(s => s.id === id)?.name).join(' → ')}) are 
                <span className="font-bold text-rose-300 ml-1">BLOCKED</span> waiting on prerequisite tensor buffers.
              </p>
            </div>
          </div>
          <button
            onClick={handleRecoverPipeline}
            className="px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition-colors whitespace-nowrap text-xs"
          >
            Clear & Resume
          </button>
        </div>
      )}

      {/* Animated SVG Stream & Interactive Stage Cards Grid */}
      <div className="space-y-3">
        {/* Animated packet stream SVG indicator */}
        <div className="hidden lg:block w-full py-1">
          <svg className="w-full h-4 overflow-visible">
            <line 
              x1="5%" 
              y1="8" 
              x2="95%" 
              y2="8" 
              stroke="#1e293b" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
            />
            {!failedStageId && (
              <circle r="3.5" fill="#22d3ee">
                <animate 
                  attributeName="cx" 
                  from="5%" 
                  to="95%" 
                  dur="2.4s" 
                  repeatCount="indefinite" 
                />
              </circle>
            )}
          </svg>
        </div>

        {/* The 6 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const isDirectFailed = stage.id === failedStageId;
            const isDownstreamBlocked = downstreamFailedIds.has(stage.id);

            let statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            let cardBorder = 'border-slate-800';
            let cardBg = 'bg-[#06080e]';

            if (isDirectFailed) {
              statusColor = 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse';
              cardBorder = 'border-rose-500 ring-1 ring-rose-500/40';
              cardBg = 'bg-rose-950/20';
            } else if (isDownstreamBlocked) {
              statusColor = 'bg-amber-500/30 text-amber-300 border-amber-500/50';
              cardBorder = 'border-amber-600/60 ring-1 ring-amber-500/30';
              cardBg = 'bg-amber-950/20';
            } else if (isSelected) {
              cardBorder = 'border-cyan-500 ring-1 ring-cyan-500/40';
              cardBg = 'bg-slate-900';
            }

            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${cardBg} ${cardBorder}`}
              >
                {/* Stage Step Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    Stage 0{stage.stageNumber}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold border ${statusColor}`}>
                    {isDirectFailed ? 'FAILED' : isDownstreamBlocked ? 'BLOCKED' : stage.status}
                  </span>
                </div>

                {/* Stage Name */}
                <div>
                  <h4 className="text-xs font-semibold line-clamp-2 leading-tight text-slate-100">
                    {stage.name}
                  </h4>
                </div>

                {/* Stage Telemetry Metrics */}
                <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>Throughput:</span>
                    <span className="tabular-nums font-semibold text-cyan-300">
                      {isDirectFailed || isDownstreamBlocked ? '0.0 MB/s' : `${stage.throughputMBs} MB/s`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Latency:</span>
                    <span className="tabular-nums text-slate-200">
                      {stage.latencyMs} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-slate-400">
                    <span>Workers:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustWorkers(stage.id, -2);
                        }}
                        className="w-4 h-4 rounded flex items-center justify-center text-[10px] leading-none bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Reduce assigned cores"
                      >
                        -
                      </button>
                      <span className="font-bold tabular-nums text-amber-400">
                        {stage.assignedWorkers}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustWorkers(stage.id, 2);
                        }}
                        className="w-4 h-4 rounded flex items-center justify-center text-[10px] leading-none bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Increase assigned cores"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action button inside card */}
                <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">
                    {stage.dependencies.length > 0 ? `Dep: S0${stages.find(s=>s.id===stage.dependencies[0])?.stageNumber || '1'}` : 'Root'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (stage.id === failedStageId) {
                        handleRecoverPipeline();
                      } else {
                        handleInjectFailure(stage.id);
                      }
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                      stage.id === failedStageId
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-rose-300 hover:border-rose-700/60 border-slate-800'
                    }`}
                  >
                    {stage.id === failedStageId ? 'Restore' : 'Trip'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Deep Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-xl bg-[#070b14] border border-slate-800/80 text-xs">
        {/* Left: Stage Physics & Mathematical Formulation */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45" />
                <span className="font-mono text-cyan-400 font-semibold text-sm">
                  Stage 0{selectedStage.stageNumber}: {selectedStage.name}
                </span>
              </div>
              <span className="font-mono text-slate-500">
                Rate: {selectedStage.opsPerSec}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {details.description}
            </p>

            <div className="mt-3.5 p-3 rounded-lg bg-[#05070d] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Mathematical Governing Formulation:</span>
              <code>{details.math}</code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-[11px] font-mono">
              <div className="p-2.5 rounded bg-[#05070d] border border-slate-800/80">
                <span className="text-slate-500 block uppercase text-[10px]">Direct Inputs:</span>
                <span className="text-slate-200 mt-0.5 block">{details.inputs}</span>
              </div>
              <div className="p-2.5 rounded bg-[#05070d] border border-slate-800/80">
                <span className="text-slate-500 block uppercase text-[10px]">Downstream Outputs:</span>
                <span className="text-emerald-400 mt-0.5 block">{details.outputs}</span>
              </div>
            </div>
          </div>

          {/* Kernels tag list */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 font-mono text-[10px]">
            <span className="text-slate-500">Compiled GPU/SIMD Kernels:</span>
            {details.kernels.map((k) => (
              <span key={k} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {k}()
              </span>
            ))}
          </div>
        </div>

        {/* Right: Interactive 4D-Var Variational Cost Minimizer */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#05070d] border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-mono">
              <span className="text-cyan-400 font-semibold text-xs flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5" />
                4D-Var EnKF Cost Curve
              </span>
              <span className="text-slate-500 text-[10px]">
                Iter: {solverIteration}/12
              </span>
            </div>

            <div className="text-[11px] text-slate-400 leading-tight mb-2">
              Conjugate Gradient Descent minimizing background error covariance cost function J(x):
            </div>

            {/* Sparkline chart of cost function descent */}
            <div className="h-24 w-full flex items-end gap-1.5 pt-2 pb-1 px-1 bg-slate-950/60 rounded border border-slate-800/60">
              {costHistory.map((cost, idx) => {
                const max = 15000;
                const hPct = Math.max(8, (cost / max) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full bg-cyan-500/80 hover:bg-cyan-400 rounded-t transition-all duration-300"
                      style={{ height: `${hPct}%` }}
                      title={`Iteration ${idx + 1}: J = ${cost}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
              <span>Residual Norm:</span>
              <span className="text-emerald-400 font-bold">||∇J|| = 4.12e-5</span>
            </div>
          </div>

          <button
            onClick={handleRun4DVarSolver}
            disabled={isSolving4DVar}
            className={`w-full py-2 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 ${
              isSolving4DVar
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {isSolving4DVar ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                Minimizing Variational Cost...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run 4D-Var Solver Sweep
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
