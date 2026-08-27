import React from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Layers, 
  Download,
  FolderArchive,
  Terminal,
  Zap,
  Cloud
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/samples';
import { CSVPresetFormat } from '../types';

interface HeaderProps {
  onLoadSample: (sampleId: string) => void;
  onOpenPasteModal: () => void;
  onOpenDocModal: () => void;
  onOpenAWSModal?: () => void;
  onReset: () => void;
  hasData: boolean;
  totalTokens: number;
  currentPreset: CSVPresetFormat;
  onChangePreset: (preset: CSVPresetFormat) => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenPasteModal,
  onOpenDocModal,
  onOpenAWSModal,
  onReset,
  hasData,
  totalTokens,
  currentPreset,
  onChangePreset,
  onExportCSV
}) => {
  return (
    <header className="border-b border-cyan-500/20 bg-[#030305]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] shrink-0">
            <span className="text-black font-bold text-xl font-mono">N</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-base sm:text-lg text-white tracking-wider truncate uppercase">
                NEBULA NFT <span className="text-cyan-400 font-mono">→</span> CSV COMPILER
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Batch v2.4.0
              </span>
            </div>
            <p className="text-xs text-cyan-400/70 font-mono uppercase tracking-tighter truncate hidden sm:block">
              OpenSea • ERC-721 / 1155 • Nested Attribute Flattening Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Preset Selector */}
          <div className="hidden md:flex items-center bg-[#0a0a0f] border border-cyan-900/30 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => onChangePreset('opensea')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                currentPreset === 'opensea'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OpenSea property[...] and boost format"
            >
              OpenSea Standard
            </button>
            <button
              onClick={() => onChangePreset('thirdweb')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                currentPreset === 'thirdweb'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Thirdweb / Manifold bulk upload CSV"
            >
              Thirdweb
            </button>
            <button
              onClick={() => onChangePreset('direct_traits')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                currentPreset === 'direct_traits'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Direct trait column headers"
            >
              Direct
            </button>
          </div>

          {/* Sample Preset Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0a0a0f] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
              id="btn-sample-presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-mono">Presets</span>
            </button>
            <div className="absolute right-0 mt-2 w-72 bg-[#0a0a0f] border border-cyan-900/40 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest px-2 py-1 mb-1 font-mono">
                Preset NFT Collections
              </div>
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample.id)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-900 transition flex flex-col gap-0.5 group/item"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover/item:text-cyan-300 font-mono">
                      {sample.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-cyan-900/40">
                      {sample.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">
                    {sample.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Paste JSON Modal Trigger */}
          <button
            onClick={onOpenPasteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0a0a0f] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition font-mono"
            title="Paste JSON or _metadata.json text"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Paste JSON</span>
          </button>

          {/* Cloud & Production Guide */}
          {onOpenAWSModal && (
            <button
              onClick={onOpenAWSModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0a0a0f] border border-cyan-900/40 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-950/30 transition font-mono shadow-sm"
              title="Vercel, AWS S3/CloudFront & Production Deployment Guide"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Deploy Guide</span>
            </button>
          )}

          {/* Documentation Guide */}
          <button
            onClick={onOpenDocModal}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-[#0a0a0f] rounded-lg border border-transparent hover:border-cyan-500/30 transition"
            title="OpenSea & CSV Standards Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Reset button when data exists */}
          {hasData && (
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-900/50 transition"
              title="Clear all metadata & start over"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Quick Export Button */}
          {hasData && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition active:scale-95 tracking-wide uppercase font-mono"
              id="btn-quick-export-csv"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export CSV ({totalTokens})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

