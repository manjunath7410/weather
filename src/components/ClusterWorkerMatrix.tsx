import React, { useState, useEffect, useMemo } from 'react';
import { WorkerCore, FaultRecoveryEvent } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { 
  Cpu, 
  Server, 
  Zap, 
  Flame, 
  HardDrive, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertOctagon, 
  Download,
  Info,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface ClusterWorkerMatrixProps {
  workers: WorkerCore[];
  workerCount: number;
  setWorkerCount: (count: number) => void;
}

export const ClusterWorkerMatrix: React.FC<ClusterWorkerMatrixProps> = ({
  workers: initialWorkers,
  workerCount,
  setWorkerCount,
}) => {
  const { isLight } = useTheme();
  const [workers, setWorkers] = useState<WorkerCore[]>(initialWorkers);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedWorker, setSelectedWorker] = useState<WorkerCore | null>(null);

  // Simulation play/pause state
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Fault Lab state
  const [failedWorkerIds, setFailedWorkerIds] = useState<number[]>([]);
  const [recoveryEvents, setRecoveryEvents] = useState<FaultRecoveryEvent[]>([
    {
      timestamp: '10:41:02.140',
      workerId: 6,
      action: 'TASK_MIGRATED',
      details: 'Work-stealing engine migrated "Scanline Parallax Correction" to Worker #2',
      migratedToWorkerId: 2,
    }
  ]);
  const [recoveryTimeSec, setRecoveryTimeSec] = useState<number>(0.42);

  // Sync when initialWorkers changes from parent
  useEffect(() => {
    setWorkers(initialWorkers);
  }, [initialWorkers]);

  // Real-time ticking simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => {
          if (w.status === 'failed') return w;

          const delta = (Math.random() - 0.5) * 6;
          const newUtil = Math.round(Math.max(20, Math.min(99, w.utilization + delta)));
          const newStatus = newUtil > 90 ? 'busy' : 'running';

          return {
            ...w,
            utilization: newUtil,
            temperatureC: Math.round(50 + (newUtil / 100) * 26),
            tasksCompleted: w.tasksCompleted + Math.floor(Math.random() * 2),
          };
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Aggregate cluster stats
  const activeWorkers = workers.filter((w) => w.status !== 'failed');
  const avgUtil = Math.round(
    activeWorkers.reduce((acc, w) => acc + w.utilization, 0) / (activeWorkers.length || 1)
  );
  const avgTemp = (
    activeWorkers.reduce((acc, w) => acc + w.temperatureC, 0) / (activeWorkers.length || 1)
  ).toFixed(1);
  const totalMemGB = (
    workers.reduce((acc, w) => acc + w.memoryUsageMB, 0) / 1024
  ).toFixed(1);
  const estimatedTflops = ((activeWorkers.length * 4.2) * (avgUtil / 100)).toFixed(1);

  // Deliberately fail a worker node (Feature 5)
  const handleFailWorker = (workerId: number) => {
    if (failedWorkerIds.includes(workerId)) return;

    const target = workers.find((w) => w.id === workerId);
    if (!target) return;

    // Find healthiest worker for task migration
    const candidates = workers.filter((w) => w.id !== workerId && w.status !== 'failed');
    const recipient = candidates.reduce((min, w) => (w.utilization < min.utilization ? w : min), candidates[0]);

    setFailedWorkerIds((prev) => [...prev, workerId]);
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            status: 'failed',
            utilization: 0,
            temperatureC: 38,
          };
        }
        if (recipient && w.id === recipient.id) {
          return {
            ...w,
            utilization: Math.min(98, w.utilization + 18),
            currentTask: `${target.currentTask} [MIGRATED]`,
          };
        }
        return w;
      })
    );

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
    const newEvent: FaultRecoveryEvent = {
      timestamp: timeStr,
      workerId,
      action: 'FAIL_INJECTED',
      details: `Node #${workerId} tripped (Thermal/ECC). Migrated "${target.currentTask}" to Node #${recipient?.id || 'Pool'}`,
      migratedToWorkerId: recipient?.id,
    };

    setRecoveryEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
    setRecoveryTimeSec(Number((0.35 + Math.random() * 0.25).toFixed(2)));
  };

  // Restore failed node
  const handleRestoreWorker = (workerId: number) => {
    setFailedWorkerIds((prev) => prev.filter((id) => id !== workerId));
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            status: 'running',
            utilization: 64,
            temperatureC: 52,
          };
        }
        return w;
      })
    );

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
    setRecoveryEvents((prev) => [
      {
        timestamp: timeStr,
        workerId,
        action: 'NODE_RESTORED',
        details: `Worker #${workerId} hot-plug restored and rejoined NUMA thread ring`,
      },
      ...prev.slice(0, 9)
    ]);
  };

  // Restore all nodes
  const handleRestoreAll = () => {
    setFailedWorkerIds([]);
    setWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        status: 'running',
        utilization: Math.round(55 + Math.random() * 25),
        temperatureC: 54,
      }))
    );
  };

  // Cluster thermal flush
  const handleThermalFlush = () => {
    setWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        temperatureC: Math.max(38, w.temperatureC - 14),
      }))
    );
  };

  // Simulate workload surge
  const handleSimulateSurge = () => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.status === 'failed') return w;
        const surge = Math.min(99, w.utilization + Math.floor(Math.random() * 22) + 10);
        return {
          ...w,
          utilization: surge,
          temperatureC: Math.min(88, w.temperatureC + 8),
          status: surge > 90 ? 'busy' : 'running',
        };
      })
    );
  };

  // Rebalance cluster
  const handleRebalance = () => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.status === 'failed') return w;
        return {
          ...w,
          utilization: Math.round(62 + (Math.random() - 0.5) * 10),
          temperatureC: 55,
          status: 'running',
        };
      })
    );
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setFailedWorkerIds([]);
    setWorkers((prev) =>
      prev.map((w, idx) => ({
        ...w,
        status: 'running',
        utilization: 68 + Math.sin(idx * 1.5) * 20,
        temperatureC: 54,
      }))
    );
  };

  // Export worker metrics CSV
  const handleExportClusterCSV = () => {
    const header = 'Worker_ID,Node_Name,Core_Type,Utilization_Pct,Temperature_C,Memory_MB,Status,Tasks_Completed,Current_Task\n';
    const rows = workers
      .map(
        (w) =>
          `${w.id},"${w.nodeName}","${w.coreType}",${w.utilization},${w.temperatureC},${w.memoryUsageMB},"${w.status}",${w.tasksCompleted},"${w.currentTask}"`
      )
      .join('\n');

    const meta = `# AeroStream Compute Cluster Worker Telemetry\n# Active Workers: ${activeWorkers.length}/${workerCount}, Avg Utilization: ${avgUtil}%\n`;
    const blob = new Blob([meta + header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aerostream_cluster_workers_${workerCount}nodes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredWorkers = workers.filter((w) => filterType === 'ALL' || w.coreType === filterType);

  return (
    <div className={`w-full border rounded-xl p-5 flex flex-col gap-6 shadow-xl transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d18] border-slate-800 text-slate-100'
    }`}>
      {/* Cluster Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="text-xs uppercase font-mono font-semibold tracking-wider flex items-center gap-2">
            <span className="text-cyan-400">High-Performance Computing Cluster</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Heterogeneous SIMD & Tensor Worker Pool</span>
          </div>
          <h3 className="text-base font-bold mt-0.5 text-slate-100 font-mono">
            Distributed Compute Cluster ({workerCount} Cores) & Fault Lab
          </h3>
        </div>

        {/* Scaler & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start/Pause controls */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Pause Heartbeat
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume Heartbeat
              </>
            )}
          </button>

          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Reset worker pool"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleExportClusterCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Export CSV of worker metrics"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <div className="h-4 w-px mx-1 bg-slate-800 hidden sm:block" />

          {/* Node Count Scaler */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono bg-[#06080e] border-slate-800 text-slate-400">
            <span className="text-slate-400">Pool:</span>
            {[8, 16, 32, 64].map((count) => (
              <button
                key={count}
                onClick={() => setWorkerCount(count)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  workerCount === count
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Telemetry Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-[#06080e] p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">ACTIVE CORES</span>
          <span className="text-slate-100 font-bold text-sm">
            {activeWorkers.length} / {workerCount}
          </span>
          {failedWorkerIds.length > 0 && (
            <span className="text-rose-400 text-[10px] ml-1 font-semibold">({failedWorkerIds.length} Failed)</span>
          )}
        </div>

        <div>
          <span className="text-slate-500 block">AVG UTILIZATION</span>
          <span className={`font-bold text-sm ${avgUtil > 88 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {avgUtil}%
          </span>
        </div>

        <div>
          <span className="text-slate-500 block">CORE TEMPERATURE</span>
          <span className="text-cyan-400 font-bold text-sm">{avgTemp}°C</span>
        </div>

        <div>
          <span className="text-slate-500 block">ALLOCATED MEMORY</span>
          <span className="text-slate-200 font-bold text-sm">{totalMemGB} GB</span>
        </div>

        <div>
          <span className="text-slate-500 block">COMPUTE CAPACITY</span>
          <span className="text-purple-400 font-bold text-sm">{estimatedTflops} TFLOPS</span>
        </div>
      </div>

      {/* FEATURE 5: FAILURE & RECOVERY LABORATORY (Interactive Fault Tolerance) */}
      <div className="p-4 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
                Failure & Recovery Laboratory (Fault Tolerance Simulator)
                <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Self-Healing Engine
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                Inject deterministic hardware faults, observe work-stealing task migration, and evaluate resilience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFailWorker(workers[Math.floor(Math.random() * workers.length)].id)}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Inject Worker Crash
            </button>

            {failedWorkerIds.length > 0 && (
              <button
                onClick={handleRestoreAll}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restore All Nodes ({failedWorkerIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Side-by-side resilience comparison metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#05070d] border border-slate-800/80">
            <span className="text-slate-500 block uppercase text-[10px]">Recovery Latency:</span>
            <span className="text-emerald-400 font-bold text-base tabular-nums">
              {recoveryTimeSec}s
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Task redistributed via work-stealing</span>
          </div>

          <div className="p-3 rounded-lg bg-[#05070d] border border-slate-800/80">
            <span className="text-slate-500 block uppercase text-[10px]">Completion With Self-Healing:</span>
            <span className="text-cyan-400 font-bold text-base tabular-nums">
              98.4%
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Zero dropped telemetry packets</span>
          </div>

          <div className="p-3 rounded-lg bg-[#05070d] border border-slate-800/80">
            <span className="text-slate-500 block uppercase text-[10px]">Completion Without Fault Tolerance:</span>
            <span className="text-amber-400 font-bold text-base tabular-nums">
              {failedWorkerIds.length > 0 ? `${(100 - failedWorkerIds.length * 12).toFixed(1)}%` : '74.2%'}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Dropped frames & pipeline stalls</span>
          </div>
        </div>

        {/* Live Event Log */}
        <div className="bg-[#05070d] rounded-lg p-3 border border-slate-800/80 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold flex items-center justify-between">
            <span>Recent Fault Recovery Events:</span>
            <span className="text-slate-600">Ring Interconnect Active</span>
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px]">
            {recoveryEvents.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">[{evt.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  evt.action === 'FAIL_INJECTED' 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : evt.action === 'NODE_RESTORED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {evt.action}
                </span>
                <span className="truncate">{evt.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Card Matrix Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Architecture:</span>
            {['ALL', 'GPU_TENSOR', 'SIMD_AVX512', 'DYNAMIC_SOLVER'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterType === type
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal (&lt;75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> High (75-90%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Overload / Failed (&gt;90%)
            </span>
          </div>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {filteredWorkers.map((worker) => {
            const isFailed = worker.status === 'failed';
            const isOverloaded = worker.utilization > 90;
            const isHigh = worker.utilization >= 75 && worker.utilization <= 90;
            const isSelected = selectedWorker?.id === worker.id;

            let utilBg = 'bg-emerald-400';
            let statusBadge = 'bg-emerald-500/20 text-emerald-300';
            let cardBorder = 'border-slate-800';

            if (isFailed) {
              utilBg = 'bg-rose-500';
              statusBadge = 'bg-rose-500/30 text-rose-300';
              cardBorder = 'border-rose-600/70 ring-1 ring-rose-500/30';
            } else if (isOverloaded) {
              utilBg = 'bg-rose-500';
              statusBadge = 'bg-rose-500/20 text-rose-300';
              cardBorder = 'border-rose-600/50';
            } else if (isHigh) {
              utilBg = 'bg-amber-400';
              statusBadge = 'bg-amber-500/20 text-amber-300';
            }

            if (isSelected) {
              cardBorder = 'border-cyan-500 ring-2 ring-cyan-500/40';
            }

            return (
              <div
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all bg-[#06080e] ${cardBorder} flex flex-col justify-between gap-2`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-200">#0{worker.id}</span>
                  <span className={`px-1 py-0.2 rounded font-semibold text-[9px] ${statusBadge}`}>
                    {isFailed ? 'FAIL' : `${worker.utilization}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full ${utilBg} transition-all duration-300`}
                    style={{ width: `${isFailed ? 0 : worker.utilization}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {worker.temperatureC}°C · {worker.memoryUsageMB}MB
                </div>

                {/* Quick Trip/Restore button */}
                <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500">{worker.coreType.split('_')[0]}</span>
                  {isFailed ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreWorker(worker.id);
                      }}
                      className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFailWorker(worker.id);
                      }}
                      className="px-1 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40"
                      title="Inject fault"
                    >
                      Trip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Worker Workload Inspection Drawer */}
      {selectedWorker && (
        <div className="p-4 rounded-xl bg-[#06080e] border border-cyan-500/40 text-xs font-mono flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">WORKER INSPECTION: Node #{selectedWorker.id} ({selectedWorker.nodeName})</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                {selectedWorker.coreType}
              </span>
            </div>
            <p className="text-slate-300 text-xs">
              Assigned Workload: <span className="text-emerald-400 font-semibold">{selectedWorker.currentTask}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <div>
              <span>IPC SCORE: </span>
              <span className="text-slate-100 font-bold">{selectedWorker.ipcScore || '2.14'}</span>
            </div>
            <div>
              <span>L2 CACHE HIT: </span>
              <span className="text-cyan-400 font-bold">{selectedWorker.cacheHitPct || '96.2'}%</span>
            </div>
            <div>
              <span>TASKS COMPLETED: </span>
              <span className="text-purple-400 font-bold">{selectedWorker.tasksCompleted}</span>
            </div>
            <button
              onClick={() => setSelectedWorker(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
