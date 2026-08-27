import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface DocGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocGuideModal: React.FC<DocGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#0a0a0f] border border-cyan-900/40 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-900/30 flex items-center justify-between bg-[#050508]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                OpenSea & Bulk NFT Metadata Guidelines
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Standards for OpenSea, ERC-721/1155, Thirdweb, and nested attribute conversion
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1: OpenSea Standard */}
          <section className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-display text-sm mb-2">
              <Layers className="w-4 h-4" />
              1. OpenSea CSV Bulk Upload Format
            </div>
            <p className="mb-3 text-slate-400 font-sans text-xs">
              OpenSea metadata CSV uses specific column header conventions to determine how traits are displayed on the asset page:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#0a0a0f] border border-cyan-900/40">
                <span className="text-cyan-300 font-bold">property[TraitName]</span>
                <p className="text-slate-400 font-sans text-[10px] mt-0.5">
                  Standard string trait (e.g. <code className="text-amber-300">property[Background] = "Cyan"</code>).
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a0a0f] border border-cyan-900/40">
                <span className="text-cyan-300 font-bold">number[TraitName]</span>
                <p className="text-slate-400 font-sans text-[10px] mt-0.5">
                  Standard numeric counter (e.g. <code className="text-amber-300">number[Generation] = 2</code>).
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a0a0f] border border-cyan-900/40">
                <span className="text-purple-300 font-bold">boost_percentage[TraitName]</span>
                <p className="text-slate-400 font-sans text-[10px] mt-0.5">
                  Rendered as a gauge bar with percentage (e.g. <code className="text-amber-300">boost_percentage[Stamina] = 85</code>).
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a0a0f] border border-cyan-900/40">
                <span className="text-emerald-300 font-bold">date[TraitName]</span>
                <p className="text-slate-400 font-sans text-[10px] mt-0.5">
                  Unix timestamp in seconds (e.g. <code className="text-amber-300">date[Birthday] = 1672531199</code>).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Nested Attribute Flattening */}
          <section className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-display text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              2. Support for Nested Attributes & Objects
            </div>
            <p className="mb-2 text-slate-400 font-sans text-xs">
              When working with complex game items, RPG equipment, or multi-tiered properties, nested JSON objects are automatically flattened into dedicated columns:
            </p>
            <div className="p-3 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 font-mono text-[11px] space-y-1">
              <div className="text-slate-500">// Nested Source JSON:</div>
              <div className="text-cyan-300">"stats": &#123; "elemental": &#123; "power": 120 &#125; &#125;</div>
              <div className="text-slate-500 mt-1">// Generated CSV Header (with dot separator):</div>
              <div className="text-emerald-400">stats.elemental.power → 120</div>
            </div>
          </section>

          {/* Section 3: Critical Validation Rules */}
          <section className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
            <div className="flex items-center gap-2 text-red-400 font-bold font-display text-sm mb-2">
              <ShieldCheck className="w-4 h-4" />
              3. Critical OpenSea Compliance Checklist
            </div>
            <ul className="space-y-2 text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Background Color:</strong> Must be a 6-character hexadecimal code WITHOUT the '#' prefix (e.g. <code className="text-cyan-300 bg-[#0a0a0f] px-1 py-0.5 rounded font-mono">0F172A</code>, not <code className="text-red-400 line-through font-mono">#0F172A</code>). The converter auto-sanitizes this!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Image URI:</strong> Accepts IPFS protocols (<code className="text-cyan-300 bg-[#0a0a0f] px-1 py-0.5 rounded font-mono">ipfs://Qm...</code>) or HTTPS URLs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Numeric Display Types:</strong> Values for <code className="text-cyan-300 bg-[#0a0a0f] px-1 py-0.5 rounded font-mono">number</code>, <code className="text-cyan-300 bg-[#0a0a0f] px-1 py-0.5 rounded font-mono">boost_number</code>, and <code className="text-cyan-300 bg-[#0a0a0f] px-1 py-0.5 rounded font-mono">boost_percentage</code> must be valid integers or floats.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#050508] border-t border-cyan-900/30 flex items-center justify-between font-mono">
          <a
            href="https://docs.opensea.io/docs/metadata-standards"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
          >
            <span>OpenSea Metadata Standard Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 text-xs font-bold transition uppercase tracking-wider"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
