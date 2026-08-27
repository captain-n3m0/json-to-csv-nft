import React, { useState } from 'react';
import { 
  Sliders, 
  Eye, 
  EyeOff, 
  Search, 
  BarChart2, 
  Sparkles, 
  CheckSquare, 
  Square,
  HelpCircle
} from 'lucide-react';
import { TraitDefinition, ConversionOptions } from '../types';

interface TraitMappingManagerProps {
  traitsMap: Map<string, TraitDefinition>;
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  totalTokens: number;
}

export const TraitMappingManager: React.FC<TraitMappingManagerProps> = ({
  traitsMap,
  options,
  onOptionsChange,
  totalTokens
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const traitList: TraitDefinition[] = Array.from(traitsMap.values());

  const filteredTraits = traitList.filter((t: TraitDefinition) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.inferredDisplayType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sampleValues.some((val: string | number) => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExcludeTrait = (traitName: string) => {
    // Generate the exact column name as it would appear
    let colName = traitName;
    if (options.presetFormat === 'opensea') {
      const tDef = traitsMap.get(traitName);
      if (tDef?.inferredDisplayType === 'number') colName = `number[${traitName}]`;
      else if (tDef?.inferredDisplayType === 'boost_percentage') colName = `boost_percentage[${traitName}]`;
      else if (tDef?.inferredDisplayType === 'boost_number') colName = `boost_number[${traitName}]`;
      else if (tDef?.inferredDisplayType === 'date') colName = `date[${traitName}]`;
      else colName = `property[${traitName}]`;
    }

    const currentExcluded = new Set(options.excludedColumns);
    if (currentExcluded.has(colName) || currentExcluded.has(traitName)) {
      currentExcluded.delete(colName);
      currentExcluded.delete(traitName);
    } else {
      currentExcluded.add(colName);
    }

    onOptionsChange({
      ...options,
      excludedColumns: Array.from(currentExcluded)
    });
  };

  const selectAllTraits = (include: boolean) => {
    if (include) {
      onOptionsChange({
        ...options,
        excludedColumns: []
      });
    } else {
      const allCols: string[] = [];
      traitList.forEach(t => {
        allCols.push(t.name);
        allCols.push(`property[${t.name}]`);
        allCols.push(`number[${t.name}]`);
        allCols.push(`boost_percentage[${t.name}]`);
        allCols.push(`boost_number[${t.name}]`);
        allCols.push(`date[${t.name}]`);
      });
      onOptionsChange({
        ...options,
        excludedColumns: allCols
      });
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col font-mono">
      {/* Header Bar */}
      <div className="p-4 border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 bg-[#050508]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              Attribute & Trait Column Manager
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Discovered {traitList.length} distinct traits across {totalTokens} tokens. Toggle columns for CSV export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => selectAllTraits(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#050508] hover:bg-slate-800 text-cyan-300 border border-cyan-900/40 transition uppercase tracking-wider"
          >
            Include All
          </button>
          <button
            onClick={() => selectAllTraits(false)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#050508] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-cyan-900/40 transition uppercase tracking-wider"
          >
            Exclude All
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-2.5 bg-[#0a0a0f] border-b border-cyan-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70" />
          <input
            type="text"
            placeholder="Search traits or sample values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Need to extract nested keys like <code className="text-cyan-300 font-mono">stats.elemental</code>? Switch to <strong>Advanced Mapping</strong> tab.</span>
        </div>
      </div>

      {/* Traits Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        {filteredTraits.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No attributes detected. Upload NFT metadata JSON files with attributes.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="sticky top-0 bg-[#050508] border-b border-cyan-900/30 text-slate-400 uppercase tracking-wider font-bold text-[10px] z-10">
              <tr>
                <th className="py-2.5 px-4 w-10">Export</th>
                <th className="py-2.5 px-3">Trait Type / Name</th>
                <th className="py-2.5 px-3">OpenSea Display Type</th>
                <th className="py-2.5 px-3">Occurrence / Rarity</th>
                <th className="py-2.5 px-4">Sample Discovered Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/20 font-mono">
              {filteredTraits.map((tDef) => {
                let colName = tDef.name;
                if (options.presetFormat === 'opensea') {
                  if (tDef.inferredDisplayType === 'number') colName = `number[${tDef.name}]`;
                  else if (tDef.inferredDisplayType === 'boost_percentage') colName = `boost_percentage[${tDef.name}]`;
                  else if (tDef.inferredDisplayType === 'boost_number') colName = `boost_number[${tDef.name}]`;
                  else if (tDef.inferredDisplayType === 'date') colName = `date[${tDef.name}]`;
                  else colName = `property[${tDef.name}]`;
                }

                const isExcluded = options.excludedColumns.includes(colName) || options.excludedColumns.includes(tDef.name);

                return (
                  <tr 
                    key={tDef.name}
                    className={`hover:bg-cyan-950/15 transition cursor-pointer ${
                      isExcluded ? 'opacity-40 bg-[#050508]/40' : ''
                    }`}
                    onClick={() => toggleExcludeTrait(tDef.name)}
                  >
                    {/* Checkbox / Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExcludeTrait(tDef.name);
                        }}
                        className={`p-1 rounded transition ${
                          !isExcluded ? 'text-cyan-400' : 'text-slate-600'
                        }`}
                      >
                        {!isExcluded ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Trait Type */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        {tDef.name}
                      </div>
                      <div className="font-mono text-[10px] text-cyan-400/90">
                        Header: {colName}
                      </div>
                    </td>

                    {/* Display Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        tDef.inferredDisplayType === 'boost_percentage'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : tDef.inferredDisplayType === 'boost_number'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : tDef.inferredDisplayType === 'number'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : tDef.inferredDisplayType === 'date'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-[#050508] text-slate-300 border-slate-700'
                      }`}>
                        {tDef.inferredDisplayType || 'string'}
                      </span>
                    </td>

                    {/* Occurrence */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${tDef.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-cyan-300 text-[11px]">
                          {tDef.count}/{totalTokens} ({tDef.percentage}%)
                        </span>
                      </div>
                    </td>

                    {/* Samples */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {tDef.sampleValues.map((val, idx) => (
                          <span 
                            key={idx} 
                            className="px-1.5 py-0.5 rounded bg-[#050508] border border-cyan-900/40 text-[10px] text-slate-300 font-mono"
                          >
                            {String(val)}
                          </span>
                        ))}
                      </div>
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
