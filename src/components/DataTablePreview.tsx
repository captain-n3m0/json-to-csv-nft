import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Eye,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { ParsedNFTItem, ConversionOptions, TraitDefinition } from '../types';

interface DataTablePreviewProps {
  items: ParsedNFTItem[];
  options: ConversionOptions;
  traitsMap: Map<string, TraitDefinition>;
  onSelectToken: (item: ParsedNFTItem) => void;
}

export const DataTablePreview: React.FC<DataTablePreviewProps> = ({
  items,
  options,
  traitsMap,
  onSelectToken
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<string>('token_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Compute all visible columns based on options and exclusions
  const columns = useMemo(() => {
    let baseCols: string[] = [];
    if (options.presetFormat === 'opensea') {
      baseCols = [
        'token_id',
        'name',
        'description',
        'image',
        'external_url',
        'animation_url',
        'youtube_url',
        'background_color'
      ];
    } else if (options.presetFormat === 'thirdweb') {
      baseCols = [
        'name',
        'description',
        'image',
        'animation_url',
        'external_url',
        'background_color'
      ];
    } else {
      baseCols = [
        'token_id',
        'name',
        'description',
        'image',
        'external_url',
        'animation_url',
        'background_color'
      ];
    }

    const dynamicCols = new Set<string>();
    for (const item of items) {
      for (const key of Object.keys(item.flattenedData)) {
        if (!baseCols.includes(key) && !options.excludedColumns.includes(key)) {
          dynamicCols.add(key);
        }
      }
    }

    let dynArray = Array.from(dynamicCols);
    if (options.sortTraitsAlphabetically) {
      dynArray.sort((a, b) => a.localeCompare(b));
    }

    return [...baseCols.filter(c => !options.excludedColumns.includes(c)), ...dynArray];
  }, [items, options]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchId = String(item.tokenId).toLowerCase().includes(q);
      const matchName = String(item.raw.name || '').toLowerCase().includes(q);
      const matchDesc = String(item.raw.description || '').toLowerCase().includes(q);
      const matchAnyField = Object.values(item.flattenedData).some(v => 
        String(v).toLowerCase().includes(q)
      );
      return matchId || matchName || matchDesc || matchAnyField;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let valA = a.flattenedData[sortColumn] ?? '';
        let valB = b.flattenedData[sortColumn] ?? '';

        // If numeric sort
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [items, searchQuery, sortColumn, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col font-mono">
      {/* Controls Header */}
      <div className="p-3.5 bg-[#050508] border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70" />
          <input
            type="text"
            placeholder="Search across all flattened columns..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0a0a0f] border border-cyan-900/40 focus:border-cyan-500 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Page Size:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-slate-200 focus:outline-none font-mono text-xs"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>

          <div className="text-cyan-400/80 font-mono text-[11px]">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAndSortedItems.length)} of {filteredAndSortedItems.length}
          </div>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead className="sticky top-0 bg-[#050508] border-b border-cyan-900/30 text-slate-400 uppercase tracking-wider font-bold text-[10px] z-10">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">Status</th>
              {columns.map((col) => {
                const isSorted = sortColumn === col;
                const isTrait = col.includes('[') || !['token_id', 'name', 'description', 'image', 'external_url', 'animation_url', 'youtube_url', 'background_color'].includes(col);

                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-900 transition select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={isTrait ? 'text-cyan-300 font-mono' : 'text-slate-300 font-mono'}>
                        {col}
                      </span>
                      <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                );
              })}
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-950/20 font-mono">
            {paginatedItems.map((item) => {
              const hasError = item.issues.some(i => i.severity === 'error');
              const hasWarning = item.issues.some(i => i.severity === 'warning');

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectToken(item)}
                  className="hover:bg-cyan-950/15 transition cursor-pointer group"
                >
                  {/* Status Indicator */}
                  <td className="py-2.5 px-3 text-center">
                    {hasError ? (
                      <XCircle className="w-4 h-4 text-red-400 inline" />
                    ) : hasWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 inline" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    )}
                  </td>

                  {/* Dynamic Column Values */}
                  {columns.map((col) => {
                    const val = item.flattenedData[col];
                    const isBg = col === 'background_color';

                    return (
                      <td
                        key={col}
                        className="py-2.5 px-3 whitespace-nowrap max-w-xs truncate text-slate-300 font-mono text-[11px]"
                      >
                        {isBg && val ? (
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-3.5 h-3.5 rounded border border-slate-700 inline-block shadow-sm"
                              style={{ backgroundColor: `#${String(val).replace(/^#/, '')}` }}
                            />
                            <span className="text-cyan-300 font-semibold">{String(val)}</span>
                          </div>
                        ) : (
                          String(val !== undefined && val !== null ? val : '')
                        )}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectToken(item);
                      }}
                      className="p-1 rounded bg-[#050508] hover:bg-slate-800 text-slate-400 group-hover:text-cyan-300 border border-cyan-900/30 transition"
                      title="Inspect Token Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-[#050508] border-t border-cyan-900/30 flex items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 text-[11px]">
          Page <span className="font-bold text-cyan-300">{currentPage}</span> of <span className="font-bold text-slate-300">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-slate-400 font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
