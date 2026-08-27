import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Table, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  Zap,
  Sliders
} from 'lucide-react';
import { ParsedNFTItem } from '../types';
import { resolveDisplayImageUrl } from '../utils/converter';

interface TokenDetailModalProps {
  item: ParsedNFTItem | null;
  onClose: () => void;
}

export const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flattened' | 'raw' | 'traits'>('flattened');
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const raw = item.raw;
  const imgUrl = raw.image || raw.image_url;
  const displayUrl = resolveDisplayImageUrl(imgUrl);
  const bgColor = raw.background_color ? `#${String(raw.background_color).replace(/^#/, '')}` : '#0f172a';

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(raw, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#0a0a0f] border border-cyan-900/40 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-900/30 flex items-center justify-between bg-[#050508]">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-xs">
              #{item.tokenId}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {raw.name || `Token #${item.tokenId}`}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Source: {item.fileName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Visual & Issues (4 cols) */}
          <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-cyan-900/30 flex flex-col gap-4 bg-[#050508]">
            {/* Artwork Frame */}
            <div 
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-cyan-900/40 flex items-center justify-center shadow-inner"
              style={{ backgroundColor: bgColor }}
            >
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={raw.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-600" />
                  <span className="text-[10px] font-mono">No Image Preview</span>
                </div>
              )}
            </div>

            {/* Validation Issues for this token */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Validation Status</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {item.issues.length} issue{item.issues.length !== 1 ? 's' : ''}
                </span>
              </h4>

              {item.issues.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Valid OpenSea Standard</span>
                </div>
              ) : (
                <div className="space-y-2 font-mono">
                  {item.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        issue.severity === 'error'
                          ? 'bg-red-950/30 border-red-900/50 text-red-300'
                          : issue.severity === 'warning'
                          ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                          : 'bg-cyan-950/30 border-cyan-900/50 text-cyan-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                        {issue.severity === 'error' ? <XCircle className="w-3.5 h-3.5 text-red-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="font-mono">[{issue.field}]</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-tight">
                        {issue.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tabbed Inspector (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-[#0a0a0f]">
            {/* Tab buttons */}
            <div className="px-5 py-2.5 bg-[#050508] border-b border-cyan-900/30 flex items-center justify-between font-mono">
              <div className="flex items-center gap-1 bg-[#0a0a0f] p-0.5 rounded-lg border border-cyan-900/40 text-xs">
                <button
                  onClick={() => setActiveTab('flattened')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                    activeTab === 'flattened' ? 'bg-[#050508] text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Flattened CSV Row</span>
                </button>
                <button
                  onClick={() => setActiveTab('traits')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                    activeTab === 'traits' ? 'bg-[#050508] text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Traits ({item.attributes.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                    activeTab === 'raw' ? 'bg-[#050508] text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Raw JSON</span>
                </button>
              </div>

              {activeTab === 'raw' && (
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#050508] hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 text-xs transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {/* Tab 1: Flattened CSV Columns */}
            {activeTab === 'flattened' && (
              <div className="p-5 overflow-y-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-cyan-900/30">
                    <tr>
                      <th className="pb-2">CSV Column Header</th>
                      <th className="pb-2">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-950/20 font-mono text-[11px]">
                    {Object.entries(item.flattenedData).map(([col, val]) => (
                      <tr key={col} className="hover:bg-cyan-950/20">
                        <td className="py-2 pr-4 text-cyan-400 font-bold align-top whitespace-nowrap">
                          {col}
                        </td>
                        <td className="py-2 text-slate-200 break-all font-sans">
                          {String(val ?? '')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Detected Traits */}
            {activeTab === 'traits' && (
              <div className="p-5 overflow-y-auto max-h-[500px]">
                {item.attributes.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans">No traits found in this metadata object.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.attributes.map((attr, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#050508] border border-cyan-900/40 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">
                          <span>{attr.trait_type || 'Trait'}</span>
                          {attr.display_type && (
                            <span className="font-mono text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/60 text-[10px]">
                              {attr.display_type}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-white font-mono">
                          {String(attr.value)}
                        </div>
                        {attr.max_value !== undefined && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Max value: {attr.max_value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Raw JSON */}
            {activeTab === 'raw' && (
              <div className="p-5 bg-[#030305] overflow-auto max-h-[500px]">
                <pre className="text-xs text-cyan-300 font-mono leading-relaxed">
                  {JSON.stringify(raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#050508] border-t border-cyan-900/30 flex items-center justify-end font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 text-xs font-bold transition uppercase tracking-wider"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
