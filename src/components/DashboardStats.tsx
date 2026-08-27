import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Sparkles,
  Sliders,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { BatchProcessingStats } from '../types';

interface DashboardStatsProps {
  stats: BatchProcessingStats;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFilterIssues: (severity: 'all' | 'error' | 'warning') => void;
  onApplyAllFixes: () => void;
  fixableCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  activeTab,
  onTabChange,
  onFilterIssues,
  onApplyAllFixes,
  fixableCount
}) => {
  const healthPercent = stats.totalTokens > 0
    ? Math.round(((stats.validTokens + (stats.warningTokens * 0.7)) / stats.totalTokens) * 100)
    : 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Tokens */}
      <div 
        onClick={() => onTabChange('table')}
        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
          activeTab === 'table'
            ? 'bg-[#0a0a0f] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            : 'bg-[#0a0a0f] border-cyan-900/30 hover:border-cyan-500/40'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-cyan-400/80">Total Tokens</span>
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-white font-mono">
          {stats.totalTokens.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
          {stats.totalFiles} Source File{stats.totalFiles !== 1 ? 's' : ''}
        </div>
      </div>

      {/* 2. Valid Tokens */}
      <div 
        onClick={() => onTabChange('table')}
        className="p-3.5 rounded-xl bg-[#0a0a0f] border border-cyan-900/30 hover:border-emerald-500/40 transition cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-emerald-400/80">Valid Ready</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-emerald-400 font-mono">
          {stats.validTokens.toLocaleString()}
        </div>
        <div className="text-[10px] text-emerald-400/80 truncate mt-0.5 font-mono">
          {stats.totalTokens > 0 ? `${Math.round((stats.validTokens / stats.totalTokens) * 100)}% Standard Pass` : 'Ready'}
        </div>
      </div>

      {/* 3. Warnings */}
      <div 
        onClick={() => {
          onTabChange('validation');
          onFilterIssues('warning');
        }}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          stats.warningTokens > 0
            ? 'bg-[#0a0a0f] border-amber-900/50 hover:border-amber-500/50'
            : 'bg-[#0a0a0f] border-cyan-900/30 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-400/80">Warnings</span>
          <AlertTriangle className={`w-3.5 h-3.5 ${stats.warningTokens > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
        </div>
        <div className={`text-xl font-bold font-mono ${stats.warningTokens > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
          {stats.warningTokens.toLocaleString()}
        </div>
        <div className="text-[10px] text-amber-400/70 truncate mt-0.5 font-mono">
          Non-blocking Notices
        </div>
      </div>

      {/* 4. Critical Errors */}
      <div 
        onClick={() => {
          onTabChange('validation');
          onFilterIssues('error');
        }}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          stats.errorTokens > 0
            ? 'bg-[#0a0a0f] border-red-900/50 hover:border-red-500/60'
            : 'bg-[#0a0a0f] border-cyan-900/30 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-red-400/80">Validation Errors</span>
          <XCircle className={`w-3.5 h-3.5 ${stats.errorTokens > 0 ? 'text-red-400' : 'text-slate-600'}`} />
        </div>
        <div className={`text-xl font-bold font-mono ${stats.errorTokens > 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {stats.errorTokens.toLocaleString()}
        </div>
        <div className="text-[10px] text-red-400/70 truncate mt-0.5 font-mono">
          {stats.errorTokens > 0 ? 'Requires attention' : '0 Fatal Errors'}
        </div>
      </div>

      {/* 5. Distinct Traits */}
      <div 
        onClick={() => onTabChange('traits')}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          activeTab === 'traits'
            ? 'bg-[#0a0a0f] border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
            : 'bg-[#0a0a0f] border-cyan-900/30 hover:border-cyan-500/40'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-cyan-400/80">Trait Schema</span>
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-cyan-300 font-mono">
          {stats.distinctTraitsCount.toLocaleString()}
        </div>
        <div className="text-[10px] text-cyan-400/70 truncate mt-0.5 font-mono">
          Attribute Headers
        </div>
      </div>

      {/* 6. Health & Quick Fix Action */}
      <div className="p-3.5 rounded-xl bg-[#0a0a0f] border border-cyan-900/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-400">Health Index</span>
          <ShieldCheck className={`w-3.5 h-3.5 ${healthPercent >= 90 ? 'text-cyan-400' : healthPercent >= 70 ? 'text-amber-400' : 'text-red-400'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono ${healthPercent >= 90 ? 'text-cyan-400' : healthPercent >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {healthPercent}%
          </span>
          {fixableCount > 0 && (
            <button
              onClick={onApplyAllFixes}
              className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 flex items-center gap-1 transition font-mono"
              title="Auto-fix hex '#' backgrounds, empty names, and sequential IDs"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Fix ({fixableCount})
            </button>
          )}
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-1 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              healthPercent >= 90 
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                : healthPercent >= 70 
                ? 'bg-amber-400' 
                : 'bg-red-500'
            }`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

