import React, { useState } from 'react';
import { X, FileCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/samples';

interface PasteJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jsonText: string) => void;
  onLoadSample: (sampleId: string) => void;
}

export const PasteJsonModal: React.FC<PasteJsonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onLoadSample
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSubmit = () => {
    if (!text.trim()) {
      setError('Please enter JSON text or metadata array.');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        setError('JSON must be an object or array of objects.');
        return;
      }
      onConfirm(text);
      onClose();
    } catch (e: any) {
      setError(`Invalid JSON syntax: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#0a0a0f] border border-cyan-900/40 rounded-xl w-full max-w-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-cyan-900/30 flex items-center justify-between bg-[#050508]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Paste Raw NFT Metadata JSON
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Paste single token JSON or array of tokens (e.g. <code className="text-cyan-300 font-mono">_metadata.json</code>)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="p-5 flex flex-col gap-3">
          <div className="relative">
            <textarea
              rows={12}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={`{\n  "name": "Cyber Ape #001",\n  "description": "Exclusive digital collectible",\n  "image": "ipfs://Qm...",\n  "attributes": [\n    { "trait_type": "Background", "value": "Neon Cyber" },\n    { "trait_type": "Stamina", "value": 90, "max_value": 100, "display_type": "boost_percentage" }\n  ]\n}`}
              className="w-full bg-[#030305] border border-cyan-900/40 focus:border-cyan-500 rounded-xl p-3.5 text-slate-200 font-mono text-xs focus:outline-none placeholder-slate-600 leading-relaxed"
            />
          </div>

          {/* Quick presets helper */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Load example:
            </span>
            <div className="flex gap-1.5">
              {SAMPLE_DATASETS.slice(0, 3).map(sample => (
                <button
                  key={sample.id}
                  onClick={() => setText(JSON.stringify(sample.data, null, 2))}
                  className="px-2 py-0.5 rounded bg-[#050508] hover:bg-slate-800 text-cyan-300 border border-cyan-900/30 text-[11px] transition font-mono"
                >
                  {sample.badge}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#050508] border-t border-cyan-900/30 flex items-center justify-end gap-2 text-xs font-mono">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition font-bold uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleValidateAndSubmit}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition active:scale-95 uppercase tracking-wider"
          >
            Convert to CSV
          </button>
        </div>
      </div>
    </div>
  );
};
