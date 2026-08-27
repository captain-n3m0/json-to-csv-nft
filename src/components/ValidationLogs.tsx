import React, { useState } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  CheckCircle2, 
  Zap, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { ValidationIssue, ParsedNFTItem } from '../types';

interface ValidationLogsProps {
  issues: ValidationIssue[];
  items: ParsedNFTItem[];
  onSelectToken: (item: ParsedNFTItem) => void;
  onApplyAllFixes: () => void;
  fixableCount: number;
}

export const ValidationLogs: React.FC<ValidationLogsProps> = ({
  issues,
  items,
  onSelectToken,
  onApplyAllFixes,
  fixableCount
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIssues = issues.filter(issue => {
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMsg = issue.message.toLowerCase().includes(q);
      const matchField = issue.field.toLowerCase().includes(q);
      const matchToken = String(issue.tokenId || '').toLowerCase().includes(q);
      const matchFile = String(issue.fileName || '').toLowerCase().includes(q);
      return matchMsg || matchField || matchToken || matchFile;
    }
    return true;
  });

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return (
    <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col font-mono">
      {/* Header controls bar */}
      <div className="p-4 border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 bg-[#050508]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              Metadata Error Validation Logs
            </h3>
            <p className="text-xs text-slate-400">
              {issues.length === 0 
                ? 'All metadata files pass OpenSea & ERC-721 compliance checks!'
                : `Detected ${errorCount} errors, ${warningCount} warnings, and ${infoCount} notices.`}
            </p>
          </div>
        </div>

        {/* Action button */}
        {fixableCount > 0 && (
          <button
            onClick={onApplyAllFixes}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition active:scale-95 uppercase tracking-wider font-mono"
            id="btn-fix-all-validation"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Auto-Fix Compatible Issues ({fixableCount})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-3 bg-[#0a0a0f] border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 bg-[#050508] p-0.5 rounded-lg border border-cyan-900/30">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] uppercase tracking-wider ${
              filterSeverity === 'all' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => setFilterSeverity('error')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition text-[11px] uppercase tracking-wider ${
              filterSeverity === 'error' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <XCircle className="w-3 h-3 text-red-400" />
            Errors ({errorCount})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition text-[11px] uppercase tracking-wider ${
              filterSeverity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Warnings ({warningCount})
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition text-[11px] uppercase tracking-wider ${
              filterSeverity === 'info' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            <Info className="w-3 h-3 text-cyan-400" />
            Notices ({infoCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70" />
          <input
            type="text"
            placeholder="Search by field, file, or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
          />
        </div>
      </div>

      {/* Issues Table or Empty State */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">
              {issues.length === 0 ? 'Zero Validation Issues' : 'No matching issues found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {issues.length === 0 
                ? 'Your metadata conforms strictly to OpenSea and marketplace standard specifications.'
                : 'Try adjusting the search query or severity filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="sticky top-0 bg-[#050508] border-b border-cyan-900/30 text-slate-400 uppercase tracking-wider font-bold text-[10px] z-10">
              <tr>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-3">Token / File</th>
                <th className="py-2.5 px-3">Field Target</th>
                <th className="py-2.5 px-4">Validation Description</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/20 font-mono">
              {filteredIssues.map((issue) => {
                const targetItem = items[issue.itemIndex];
                return (
                  <tr 
                    key={issue.id} 
                    className="hover:bg-cyan-950/15 transition group cursor-pointer"
                    onClick={() => targetItem && onSelectToken(targetItem)}
                  >
                    {/* Severity Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {issue.severity === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          ERROR
                        </span>
                      )}
                      {issue.severity === 'warning' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          WARNING
                        </span>
                      )}
                      {issue.severity === 'info' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Info className="w-3 h-3" />
                          NOTICE
                        </span>
                      )}
                    </td>

                    {/* Token ID / File */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-cyan-300 font-semibold">
                        Token #{issue.tokenId !== undefined ? issue.tokenId : (issue.itemIndex + 1)}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {issue.fileName || `item_${issue.itemIndex}.json`}
                      </div>
                    </td>

                    {/* Field Target */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#050508] text-cyan-300 border border-cyan-900/40">
                        {issue.field}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="py-3 px-4 text-slate-300 leading-relaxed font-sans text-xs">
                      {issue.message}
                      {issue.fixable && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                          <Zap className="w-2.5 h-2.5" /> Auto-fixable
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (targetItem) onSelectToken(targetItem);
                        }}
                        className="p-1.5 rounded-lg bg-[#050508] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-cyan-900/30 transition inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
