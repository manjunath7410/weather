import React, { useState } from 'react';
import { AtmosphericProbe } from '../types/weather';
import { generateSoundingProfile } from '../services/atmosphericPhysics';
import { calculateBenchmark } from '../services/pipelineSimulator';
import { useTheme } from '../context/ThemeContext';
import { X, Download, Copy, Check, FileCode, Database, FileSpreadsheet, MapPin, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  probe: AtmosphericProbe;
  activeScenarioId: string;
  modelHour: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  probe,
  activeScenarioId,
  modelHour,
}) => {
  const { isLight } = useTheme();
  const [exportFormat, setExportFormat] = useState<
    'netcdf' | 'csv_sounding' | 'csv_benchmark' | 'csv_cluster' | 'csv_dag' | 'geojson'
  >('netcdf');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format 1: NetCDF-4 Metadata
  const netCdfMetadata = {
    Conventions: 'CF-1.8, ACDD-1.3',
    title: 'AeroStream Parallel Weather & High-Resolution Climate Model Analysis',
    institution: 'AeroStream Planetary Computing Core / Multi-Agency Satellite Mesh',
    source: 'GOES-16/18 ABI + MTG FCI + Himawari-9 AHI + 4D-Var EnKF Assimilation',
    history: `${new Date().toISOString()}: Ingestion, SIMD L1b calibration, and 4D-Var solver`,
    references: 'ECMWF IFS / NOAA GFS Non-Hydrostatic Dynamical Core Specification',
    dimensions: {
      time: 73,
      lat: 1801,
      lon: 3600,
      isobaric_level: 12,
      ensemble_member: 64,
    },
    variables: {
      brightness_temperature_ch14: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'K',
        long_name: 'ABI Band 14 (11.2 µm) Clean Infrared Brightness Temperature',
        standard_name: 'toa_brightness_temperature',
        sample_point_val: probe.brightnessTempK,
      },
      surface_air_pressure: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'Pa',
        long_name: 'Sea Level Surface Pressure',
        standard_name: 'surface_air_pressure',
        sample_point_val: probe.surfacePressureHpa * 100,
      },
      geopotential_height_500hPa: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'm',
        long_name: '500 hPa Geopotential Height',
        standard_name: 'geopotential_height',
        sample_point_val: probe.geopotentialHeightM,
      },
      precipitable_water: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'kg m-2',
        long_name: 'Atmosphere Total Column Precipitable Water Vapor',
        standard_name: 'atmosphere_water_vapor_content',
        sample_point_val: probe.precipitableWaterMm,
      },
      cape: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'J kg-1',
        long_name: 'Surface Convective Available Potential Energy',
        sample_point_val: probe.capeJkg,
      },
      radar_reflectivity: {
        dimensions: ['time', 'lat', 'lon'],
        units: 'dBZ',
        long_name: 'Equivalent Radar Reflectivity Factor',
        sample_point_val: probe.radarReflectivityDbz,
      },
    },
    spatial_coverage: {
      geospatial_lat_min: -90.0,
      geospatial_lat_max: 90.0,
      geospatial_lon_min: -180.0,
      geospatial_lon_max: 180.0,
      horizontal_resolution_deg: 0.1,
    },
    simulation_state: {
      scenario: activeScenarioId,
      forecast_hour: modelHour,
      probe_lat: probe.latitude,
      probe_lon: probe.longitude,
      data_category: 'SIMULATED_4DVAR_ENSEMBLE',
    },
  };

  // Format 2: CSV Sounding
  const soundingLevels = generateSoundingProfile(probe);
  const soundingCsv = [
    '# AeroStream Skew-T Atmospheric Sounding Dataset',
    `# Target Coordinates: ${probe.latitude} deg N, ${probe.longitude} deg E`,
    `# Forecast Hour: T+${modelHour}h, Scenario: ${activeScenarioId}`,
    '# Data Category: SAMPLE OBSERVATION PROFILE',
    'Pressure_hPa,Altitude_m,Temperature_C,DewPoint_C,ParcelTemp_C,Theta_K,WindSpeed_kts,WindDir_deg',
    ...soundingLevels.map(
      (lvl) =>
        `${lvl.pressureHpa},${lvl.altitudeM},${lvl.temperatureC},${lvl.dewPointC},${lvl.parcelTempC},${lvl.thetaK},${lvl.windSpeedKts},${lvl.windDirectionDeg}`
    ),
  ].join('\n');

  // Format 3: CSV Benchmark
  const bench = calculateBenchmark({
    datasetSizeMB: 1000,
    workerCount: 16,
    mode: 'parallel',
    workload: 'standard',
  });
  const benchmarkCsv = [
    '# AeroStream Multi-Core Parallel vs Sequential Benchmark Results',
    '# Computational Model: Deterministic Amdahl with Logarithmic Barrier Overhead',
    '# Dataset: 1000 MB, Sequential Baseline: 120.00s',
    '# Data Category: SIMULATED BENCHMARK',
    'Workers,ExecutionTime_Sec,Speedup_Ratio,Efficiency_Pct,Throughput_MBs,IdealLinearSpeedup',
    ...bench.dataPoints.map(
      (dp) =>
        `${dp.workers},${dp.executionTimeSec},${dp.speedup},${dp.efficiencyPct},${dp.throughputMBs},${dp.idealSpeedup}`
    ),
  ].join('\n');

  // Format 4: CSV Cluster Workers
  const clusterCsv = [
    '# AeroStream Compute Cluster Worker Status & NUMA Topology',
    '# Total Cores: 32, Active Nodes: 4 NUMA domains',
    '# Data Category: SIMULATED HARDWARE TELEMETRY',
    'Worker_ID,Node_Name,Core_Type,Utilization_Pct,Temperature_C,Memory_MB,Status,IPC_Score',
    '1,"Node-alpha","SIMD_AVX512",72,56,2140,"running",2.34',
    '2,"Node-alpha","SIMD_AVX512",68,54,2080,"running",2.28',
    '3,"Node-beta","GPU_TENSOR",88,68,3450,"busy",2.84',
    '4,"Node-beta","GPU_TENSOR",91,71,3620,"busy",2.91',
    '5,"Node-gamma","DYNAMIC_SOLVER",76,59,2490,"running",2.41',
    '6,"Node-gamma","DYNAMIC_SOLVER",74,58,2420,"running",2.39',
    '7,"Node-delta","DYNAMIC_SOLVER",82,62,2840,"running",2.55',
    '8,"Node-delta","DYNAMIC_SOLVER",79,61,2780,"running",2.51',
  ].join('\n');

  // Format 5: CSV DAG Execution Logs
  const dagCsv = [
    '# AeroStream 6-Stage Parallel DAG Execution Log',
    `# Timestamp: ${new Date().toISOString()}`,
    '# Data Category: SIMULATED WORKFLOW EXECUTION',
    'Stage_Num,Stage_ID,Stage_Name,Status,Assigned_Workers,Latency_ms,Throughput_MBs,Dependencies',
    '1,"stage_ingest","Satellite Data Ingestion","running",4,1.8,437.5,"NONE"',
    '2,"stage_cal","Radiometric Calibration","running",8,4.2,382.1,"stage_ingest"',
    '3,"stage_optflow","Atmospheric Motion Estimation","running",6,6.5,310.4,"stage_cal"',
    '4,"stage_4dvar","Parallel Weather Data Assimilation","running",10,14.1,245.0,"stage_cal;stage_optflow"',
    '5,"stage_dyn_core","Numerical Weather Processing","running",8,18.9,188.6,"stage_4dvar"',
    '6,"stage_distribution","Output Generation","running",4,2.1,480.0,"stage_dyn_core"',
  ].join('\n');

  // Format 6: GeoJSON
  const geoJsonFeature = {
    type: 'FeatureCollection',
    properties: {
      dataset: 'AeroStream Atmospheric Column Sample',
      modelHour,
      scenario: activeScenarioId,
    },
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [probe.longitude, probe.latitude],
        },
        properties: {
          surface_pressure_hpa: probe.surfacePressureHpa,
          brightness_temp_k: probe.brightnessTempK,
          wind_speed_kts: probe.windSpeedKts,
          wind_direction_deg: probe.windDirectionDeg,
          cape_j_kg: probe.capeJkg,
          precipitable_water_mm: probe.precipitableWaterMm,
          radar_reflectivity_dbz: probe.radarReflectivityDbz,
        },
      },
    ],
  };

  // Preview content based on active format
  let previewContent = '';
  let filename = '';
  let mimeType = 'text/plain';

  if (exportFormat === 'netcdf') {
    previewContent = JSON.stringify(netCdfMetadata, null, 2);
    filename = `aerostream_netcdf4_cf18_${activeScenarioId}_T${modelHour}.json`;
    mimeType = 'application/json';
  } else if (exportFormat === 'csv_sounding') {
    previewContent = soundingCsv;
    filename = `aerostream_sounding_${probe.latitude}_${probe.longitude}.csv`;
    mimeType = 'text/csv';
  } else if (exportFormat === 'csv_benchmark') {
    previewContent = benchmarkCsv;
    filename = 'aerostream_parallel_benchmark_amdahl.csv';
    mimeType = 'text/csv';
  } else if (exportFormat === 'csv_cluster') {
    previewContent = clusterCsv;
    filename = 'aerostream_cluster_worker_telemetry.csv';
    mimeType = 'text/csv';
  } else if (exportFormat === 'csv_dag') {
    previewContent = dagCsv;
    filename = 'aerostream_dag_execution_log.csv';
    mimeType = 'text/csv';
  } else {
    previewContent = JSON.stringify(geoJsonFeature, null, 2);
    filename = `aerostream_probe_${probe.latitude}_${probe.longitude}.geojson`;
    mimeType = 'application/geo+json';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([previewContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-3xl border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0a0e1a] border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#07090e] border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-100">
                Scientific & Benchmark Dataset Exporter
              </h3>
              <p className="text-[11px] text-slate-400">
                Download verified NetCDF-4 schemas and CSV datasets for external analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 px-6 py-3 border-b text-xs font-mono bg-[#06080e] border-slate-800/80">
          <span className="text-slate-500 mr-1">FORMAT:</span>
          {[
            { id: 'netcdf', label: 'NetCDF-4 (CF-1.8)' },
            { id: 'csv_sounding', label: 'Sounding CSV' },
            { id: 'csv_benchmark', label: 'Benchmark CSV' },
            { id: 'csv_cluster', label: 'Cluster Cores CSV' },
            { id: 'csv_dag', label: 'DAG Logs CSV' },
            { id: 'geojson', label: 'GeoJSON Point' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setExportFormat(fmt.id as any)}
              className={`px-3 py-1 rounded-md transition-all ${
                exportFormat === fmt.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Preview Content */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">{filename}</span>
            <span>{previewContent.split('\n').length} lines · {new Blob([previewContent]).size} bytes</span>
          </div>

          <div className="bg-[#05070d] border border-slate-800 rounded-xl p-4 max-h-[360px] overflow-y-auto font-mono text-xs text-slate-300">
            <pre className="whitespace-pre-wrap">{previewContent}</pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#07090e] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Ready for Python Xarray, Pandas, MetPy, and GIS ingestion
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Download Dataset File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
