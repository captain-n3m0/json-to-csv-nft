import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Split, 
  Maximize2,
  FileSpreadsheet
} from 'lucide-react';
import { ConversionOptions } from '../types';

interface RawCSVViewerProps {
  csvContent: string;
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  onDownloadCSV: () => void;
  rowCount: number;
}

export const RawCSVViewer: React.FC<RawCSVViewerProps> = ({
  csvContent,
  options,
  onOptionsChange,
  onDownloadCSV,
  rowCount
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = csvContent ? csvContent.split('\r\n') : [];
  const previewLines = lines.slice(0, 150);

  return (
    <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col font-mono text-xs">
      {/* Header Bar */}
      <div className="p-3.5 bg-[#050508] border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-bold font-display text-xs">
              Raw Generated CSV Output
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {rowCount} rows • {new Blob([csvContent]).size.toLocaleString()} bytes • Delimiter: <span className="text-cyan-300 font-bold">{options.csvDelimiter === '\t' ? '\\t (Tab)' : `"${options.csvDelimiter}"`}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Delimiter Switch */}
          <div className="flex items-center bg-[#0a0a0f] border border-cyan-900/40 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => onOptionsChange({ ...options, csvDelimiter: ',' })}
              className={`px-2 py-1 rounded font-bold transition ${
                options.csvDelimiter === ',' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comma (,)
            </button>
            <button
              onClick={() => onOptionsChange({ ...options, csvDelimiter: ';' })}
              className={`px-2 py-1 rounded font-bold transition ${
                options.csvDelimiter === ';' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semicolon (;)
            </button>
            <button
              onClick={() => onOptionsChange({ ...options, csvDelimiter: '\t' })}
              className={`px-2 py-1 rounded font-bold transition ${
                options.csvDelimiter === '\t' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tab (\t)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050508] hover:bg-slate-800 text-slate-200 border border-cyan-900/40 transition text-xs font-bold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy CSV</span>
              </>
            )}
          </button>

          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition active:scale-95 text-xs uppercase tracking-wider font-mono"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-[#030305] p-4 max-h-[500px] overflow-auto text-[11px] leading-relaxed text-slate-300 selection:bg-cyan-900 selection:text-cyan-100">
        <table className="w-full border-collapse">
          <tbody>
            {previewLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-cyan-950/20 transition">
                <td className="w-12 select-none text-slate-600 text-right pr-4 font-mono align-top text-[10px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-200 break-all">
                  {idx === 0 ? (
                    <span className="text-cyan-300 font-bold">{line}</span>
                  ) : (
                    <span>{line}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lines.length > 150 && (
          <div className="mt-4 text-center text-slate-500 py-2 border-t border-cyan-900/30 font-mono">
            ... and {lines.length - 150} more rows. Download complete CSV to view all.
          </div>
        )}
      </div>
    </div>
  );
};
