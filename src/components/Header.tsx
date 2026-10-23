import React from 'react';
import { Activity, Play, Square, BookOpen } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onTogglePipeline: () => void;
  activeTab: 'monitor' | 'pipeline' | 'benchmark' | 'cluster' | 'sounding' | 'satellites';
  setActiveTab: (tab: 'monitor' | 'pipeline' | 'benchmark' | 'cluster' | 'sounding' | 'satellites') => void;
  onExportClick: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onTogglePipeline,
  activeTab,
  setActiveTab,
  onExportClick,
  onOpenGuide,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-6 px-6 py-3.5 bg-[#07090e] border-b border-slate-800 shrink-0 select-none z-30">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#monitor"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('monitor');
        }}
        className="text-lg font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 inline-block" />
        AeroStream Engine
      </a>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'monitor' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Global Monitor
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'pipeline' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Parallel DAG
        </button>
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'benchmark' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Parallel Benchmark
        </button>
        <button
          onClick={() => setActiveTab('cluster')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'cluster' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Compute Cluster
        </button>
        <button
          onClick={() => setActiveTab('sounding')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'sounding' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Atmospheric Sounding
        </button>
        <button
          onClick={() => setActiveTab('satellites')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'satellites' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Satellite Constellation
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/80 rounded transition-colors whitespace-nowrap shrink-0"
          title="Open interactive walkthrough & guide from scratch"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>System Guide</span>
        </button>
        <button
          onClick={onExportClick}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors whitespace-nowrap shrink-0"
        >
          Export NetCDF
        </button>
        <button
          onClick={onTogglePipeline}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
            isRunning
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Pause Ingest
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Pipeline
            </>
          )}
        </button>
      </div>
    </header>
  );
};
