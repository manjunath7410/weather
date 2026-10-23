import { 
  PipelineStage, 
  WorkerCore, 
  BenchmarkConfig, 
  BenchmarkResult, 
  BenchmarkDataPoint 
} from '../types/weather';

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage_ingest',
    name: 'Satellite Data Ingestion',
    stageNumber: 1,
    category: 'ingest',
    assignedWorkers: 4,
    queueDepth: 142,
    latencyMs: 1.8,
    throughputMBs: 437.5,
    status: 'running',
    opsPerSec: '1.82M pkts/s',
    dependencies: [],
    inputs: 'Raw Multi-Satellite CCSDS Frames (GOES-16/18, MTG-I1, Himawari-9, Sentinel-5P)',
    outputs: 'Decompressed L0 Packet Swath Chunks & Ephemeris Buffers',
    workload: 'Packet CRC32 validation, frame synchronization, Huffman decompression',
    processingTimeMs: 18.4,
    completionPct: 98,
  },
  {
    id: 'stage_cal',
    name: 'Radiometric Calibration',
    stageNumber: 2,
    category: 'calibration',
    assignedWorkers: 8,
    queueDepth: 38,
    latencyMs: 4.2,
    throughputMBs: 382.1,
    status: 'running',
    opsPerSec: '8.44 GFLOPS',
    dependencies: ['stage_ingest'],
    inputs: 'Decompressed L0 Sensor Digital Counts & Space-View Radiance Baselines',
    outputs: 'Calibrated L1b Top-of-Atmosphere (TOA) Brightness Temperatures (Tb [K])',
    workload: 'Geometric INR navigation, non-linear detector gain, solar parallax adjustment',
    processingTimeMs: 42.1,
    completionPct: 94,
  },
  {
    id: 'stage_optflow',
    name: 'Atmospheric Motion Estimation',
    stageNumber: 3,
    category: 'optical_flow',
    assignedWorkers: 6,
    queueDepth: 19,
    latencyMs: 6.5,
    throughputMBs: 310.4,
    status: 'running',
    opsPerSec: '12.8 TFLOPS',
    dependencies: ['stage_cal'],
    inputs: 'Consecutive L1b 10-Minute Full Disc Swaths (10.3 µm & 6.9 µm)',
    outputs: '3D Atmospheric Motion Vectors (AMVs: u, v velocity fields & pressure heights)',
    workload: 'Dense optical flow cross-correlation (Horn-Schunck), spatial gradient FFT',
    processingTimeMs: 65.0,
    completionPct: 89,
  },
  {
    id: 'stage_4dvar',
    name: 'Parallel Weather Data Assimilation',
    stageNumber: 4,
    category: 'assimilation',
    assignedWorkers: 10,
    queueDepth: 8,
    latencyMs: 14.1,
    throughputMBs: 245.0,
    status: 'running',
    opsPerSec: '34.2 TFLOPS',
    dependencies: ['stage_cal', 'stage_optflow'],
    inputs: 'Background GFS/ECMWF priors + L1b Radiances + AMVs + Radiosonde sounding',
    outputs: 'Optimized 4D Analysis State Vector (X_a) with minimized error covariance J(x)',
    workload: '4D-Var EnKF variational solver, conjugate gradient minimization, Kalman gain',
    processingTimeMs: 141.2,
    completionPct: 82,
  },
  {
    id: 'stage_dyn_core',
    name: 'Numerical Weather Processing',
    stageNumber: 5,
    category: 'dynamical_core',
    assignedWorkers: 8,
    queueDepth: 4,
    latencyMs: 18.9,
    throughputMBs: 188.6,
    status: 'running',
    opsPerSec: '58.6 TFLOPS',
    dependencies: ['stage_4dvar'],
    inputs: 'Initial condition 4D analysis state X_a on 0.10° finite volume grid',
    outputs: 'T+00h to T+72h time-integrated non-hydrostatic atmospheric prognostic fields',
    workload: 'Compressible Navier-Stokes integration, Coriolis force, explicit cloud microphysics',
    processingTimeMs: 189.5,
    completionPct: 76,
  },
  {
    id: 'stage_distribution',
    name: 'Output Generation',
    stageNumber: 6,
    category: 'distribution',
    assignedWorkers: 4,
    queueDepth: 12,
    latencyMs: 2.1,
    throughputMBs: 480.0,
    status: 'running',
    opsPerSec: '940 MB/s',
    dependencies: ['stage_dyn_core'],
    inputs: 'Prognostic model arrays (temperature, geopotential, vorticity, precipitation)',
    outputs: 'Standardized NetCDF-4 (CF-1.8), Zarr cloud stores, and GeoJSON GIS layers',
    workload: 'Lossless chunked Zstandard compression, CF metadata indexing, cloud upload',
    processingTimeMs: 21.0,
    completionPct: 71,
  },
];

export function generateWorkerCluster(workerCount: number = 32): WorkerCore[] {
  const nodes = ['Node-α (Calib)', 'Node-β (OptFlow)', 'Node-γ (4D-Var)', 'Node-δ (DynCore)'];
  const types: ('SIMD_AVX512' | 'GPU_TENSOR' | 'DYNAMIC_SOLVER' | 'IO_INGEST')[] = [
    'SIMD_AVX512',
    'GPU_TENSOR',
    'DYNAMIC_SOLVER',
    'DYNAMIC_SOLVER',
  ];

  const tasks = [
    'Scanline Parallax Correction',
    'ABI Band 13 FFT Radiance FFT',
    'EnKF Perturbation Matrix Mult',
    'Navier-Stokes Advection Flux',
    'Cross-Track Sounding Inversion',
    'Cloud Top AMV Optical Tracking',
    'Kalman Gain Cholesky Decomp',
    'Coriolis Vorticity Integration',
    'Precipitation Microphysics Solver',
    'Zstandard NetCDF Chunk Compress',
  ];

  return Array.from({ length: workerCount }, (_, i) => {
    const nodeIdx = Math.floor((i / workerCount) * 4);
    const util = 68 + Math.sin(i * 1.5) * 20;
    return {
      id: i + 1,
      nodeName: nodes[nodeIdx],
      coreType: types[nodeIdx],
      utilization: Math.round(Math.max(25, Math.min(99, util))),
      temperatureC: Math.round(50 + (util / 100) * 26),
      memoryUsageMB: Math.round(1800 + (i % 8) * 320 + Math.random() * 200),
      currentTask: tasks[i % tasks.length],
      status: util > 92 ? 'busy' : 'running',
      ipcScore: Number((2.1 + (i % 4) * 0.3 + Math.random() * 0.1).toFixed(2)),
      cacheHitPct: Number((93.5 + Math.random() * 4).toFixed(1)),
      tasksCompleted: 140 + i * 18,
    };
  });
}

/**
 * Deterministic Parallel vs Sequential Benchmark Engine
 * Uses Amdahl's Law with communication and synchronization penalty:
 * T_par(N) = T_seq * ( (1 - P) + P / N + kappa * log2(N) )
 * 
 * - P = 0.94 (94% parallel fraction for weather data assimilation)
 * - kappa = 0.006 (inter-node MPI / PCIe communication overhead)
 */
export function calculateBenchmark(config: BenchmarkConfig): BenchmarkResult {
  const { datasetSizeMB, workerCount, mode, workload } = config;

  // Workload complexity factor (seconds per MB in single-threaded baseline)
  let workloadFactor = 0.12; // Standard default
  let parallelFraction = 0.94;
  let overheadFactor = 0.006;

  if (workload === 'lightweight') {
    workloadFactor = 0.04;
    parallelFraction = 0.96;
    overheadFactor = 0.004;
  } else if (workload === 'intensive') {
    workloadFactor = 0.32;
    parallelFraction = 0.92;
    overheadFactor = 0.008;
  }

  // Pure single-core sequential execution time (in seconds)
  const sequentialTimeSec = Number((datasetSizeMB * workloadFactor).toFixed(2));

  // Compute curve for standard worker steps: 1, 2, 4, 8, 16, 32
  const standardWorkerCounts = [1, 2, 4, 8, 16, 32];
  const dataPoints: BenchmarkDataPoint[] = standardWorkerCounts.map((N) => {
    if (N === 1) {
      return {
        workers: 1,
        executionTimeSec: sequentialTimeSec,
        speedup: 1.0,
        efficiencyPct: 100.0,
        throughputMBs: Number((datasetSizeMB / sequentialTimeSec).toFixed(1)),
        idealSpeedup: 1.0,
      };
    }

    // Amdahl's law with synchronization barrier penalty
    const serialPart = 1 - parallelFraction;
    const parallelPart = parallelFraction / N;
    const commPenalty = overheadFactor * Math.log2(N);
    const parTime = Number(
      Math.max(0.1, sequentialTimeSec * (serialPart + parallelPart + commPenalty)).toFixed(2)
    );

    const speedup = Number((sequentialTimeSec / parTime).toFixed(2));
    const efficiencyPct = Number(((speedup / N) * 100).toFixed(1));
    const throughputMBs = Number((datasetSizeMB / parTime).toFixed(1));

    return {
      workers: N,
      executionTimeSec: parTime,
      speedup,
      efficiencyPct,
      throughputMBs,
      idealSpeedup: N,
    };
  });

  // Target values for the currently selected workerCount & mode
  const currentPoint = dataPoints.find((dp) => dp.workers === workerCount) || dataPoints[0];
  const targetParallelTime = mode === 'sequential' ? sequentialTimeSec : currentPoint.executionTimeSec;
  const currentSpeedup = mode === 'sequential' ? 1.0 : currentPoint.speedup;
  const currentEfficiency = mode === 'sequential' ? 100.0 : currentPoint.efficiencyPct;
  const currentThroughput = mode === 'sequential' 
    ? Number((datasetSizeMB / sequentialTimeSec).toFixed(1))
    : currentPoint.throughputMBs;

  return {
    config,
    sequentialTimeSec,
    parallelTimeSec: targetParallelTime,
    speedup: currentSpeedup,
    efficiencyPct: currentEfficiency,
    throughputMBs: currentThroughput,
    dataPoints,
    calculatedAt: new Date().toISOString(),
    isSimulated: true,
  };
}
