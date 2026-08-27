import React, { useState, useMemo } from 'react';
import { 
  Workflow, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  Layers, 
  Split, 
  ListOrdered, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  ArrowRight,
  Braces,
  Settings2,
  Eye,
  SlidersHorizontal,
  FolderTree,
  Filter
} from 'lucide-react';
import { 
  ConversionOptions, 
  MappingRule, 
  DiscoveredPath, 
  ArrayHandlingMode, 
  TargetColumnFormat, 
  ValueTransformType,
  RawNFTMetadata,
  ParsedNFTItem 
} from '../types';
import { 
  discoverAllNestedPaths, 
  PRESET_MAPPING_RULES, 
  extractRawPathValue, 
  formatColumnHeader, 
  evaluateArrayValue,
  applyValueTransforms
} from '../utils/pathExtractor';

interface AdvancedMappingManagerProps {
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  rawItems: RawNFTMetadata[];
  parsedItems: ParsedNFTItem[];
}

export const AdvancedMappingManager: React.FC<AdvancedMappingManagerProps> = ({
  options,
  onOptionsChange,
  rawItems,
  parsedItems
}) => {
  // Discovered paths across the dataset
  const discoveredPaths = useMemo(() => {
    return discoverAllNestedPaths(rawItems);
  }, [rawItems]);

  // Search/filter state
  const [pathSearch, setPathSearch] = useState('');
  const [pathTypeFilter, setPathTypeFilter] = useState<'all' | 'nested' | 'array' | 'primitive'>('all');

  // Rule editor modal/drawer state
  const [editingRule, setEditingRule] = useState<MappingRule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Active rules
  const rules = options.mappingRules || [];

  // Filtered discovered paths
  const filteredDiscoveredPaths = useMemo(() => {
    return discoveredPaths.filter(dp => {
      const matchesSearch = dp.path.toLowerCase().includes(pathSearch.toLowerCase()) ||
        String(dp.sampleValue).toLowerCase().includes(pathSearch.toLowerCase());
      
      if (!matchesSearch) return false;

      if (pathTypeFilter === 'nested') return dp.isNested;
      if (pathTypeFilter === 'array') return dp.isArray || dp.type === 'array' || dp.type === 'array_of_objects';
      if (pathTypeFilter === 'primitive') return !dp.isArray && !dp.isNested;
      return true;
    });
  }, [discoveredPaths, pathSearch, pathTypeFilter]);

  // Handlers for Rules
  const handleToggleAdvancedMode = (enabled: boolean) => {
    // If enabling for the first time with empty rules, auto-seed with standard preset
    let currentRules = options.mappingRules;
    if (enabled && (!currentRules || currentRules.length === 0)) {
      currentRules = [...PRESET_MAPPING_RULES.opensea_standard.rules];
    }
    onOptionsChange({
      ...options,
      useAdvancedRules: enabled,
      mappingRules: currentRules
    });
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    onOptionsChange({
      ...options,
      mappingRules: updated
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    onOptionsChange({
      ...options,
      mappingRules: updated
    });
  };

  const handleDuplicateRule = (rule: MappingRule) => {
    const newRule: MappingRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${rule.name} (Copy)`,
      targetColumn: `${rule.targetColumn}_copy`
    };
    onOptionsChange({
      ...options,
      mappingRules: [...rules, newRule]
    });
  };

  const handleOpenAddRule = (prefilledPath?: string) => {
    const source = prefilledPath || '';
    const suggestedCol = source ? source.split('.').pop()?.replace(/\[\*\]/g, '') || source : 'New Column';
    
    setEditingRule({
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      enabled: true,
      name: `Extract ${suggestedCol}`,
      ruleType: source === 'attributes' ? 'key_value_attribute' : 'path_extract',
      sourcePath: source,
      targetColumn: suggestedCol,
      targetColumnFormat: 'property_bracket',
      arrayHandling: 'join_comma',
      customArraySeparator: ', ',
      maxUnrollCount: 3,
      transform: 'none',
      fallbackValue: '',
      prefix: '',
      suffix: ''
    });
    setIsEditorOpen(true);
  };

  const handleSaveRule = (rule: MappingRule) => {
    const exists = rules.some(r => r.id === rule.id);
    let updatedRules: MappingRule[];
    if (exists) {
      updatedRules = rules.map(r => r.id === rule.id ? rule : r);
    } else {
      updatedRules = [...rules, rule];
    }

    onOptionsChange({
      ...options,
      useAdvancedRules: true,
      mappingRules: updatedRules
    });
    setIsEditorOpen(false);
    setEditingRule(null);
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESET_MAPPING_RULES[presetKey];
    if (preset) {
      onOptionsChange({
        ...options,
        useAdvancedRules: true,
        mappingRules: [...preset.rules]
      });
    }
  };

  // Auto-generate rules from all discovered nested paths
  const handleAutoGenerateRules = () => {
    const generated: MappingRule[] = [];

    // 1. Add standard KV attributes rule
    generated.push({
      id: 'rule_auto_attributes',
      enabled: true,
      name: 'OpenSea Attributes (Key-Value Array)',
      ruleType: 'key_value_attribute',
      sourcePath: 'attributes',
      targetColumn: 'attributes',
      targetColumnFormat: 'property_bracket',
      arrayHandling: 'join_comma',
      transform: 'none'
    });

    // 2. Discover all non-standard paths
    const ignoredRoots = new Set(['attributes', 'traits', 'properties', 'name', 'description', 'image', 'image_url', 'token_id', 'tokenId', 'id', 'edition', 'dna', 'compiler', 'date', 'external_url', 'animation_url', 'youtube_url', 'background_color']);

    discoveredPaths.forEach(dp => {
      const rootKey = dp.path.split('.')[0].replace(/\[\d+\]/, '');
      if (!ignoredRoots.has(rootKey)) {
        const cleanName = dp.path.replace(/\./g, ' ').replace(/\[\*\]/g, '').replace(/_/g, ' ');
        const formattedTarget = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        let format: TargetColumnFormat = 'property_bracket';
        let transform: ValueTransformType = 'none';

        if (dp.type === 'number') {
          format = 'number_bracket';
          transform = 'number_int';
        }

        generated.push({
          id: `rule_auto_${dp.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          enabled: true,
          name: formattedTarget,
          ruleType: 'path_extract',
          sourcePath: dp.path,
          targetColumn: formattedTarget,
          targetColumnFormat: format,
          arrayHandling: dp.isArray ? 'join_comma' : 'first_item',
          transform,
          isAutoDiscovered: true
        });
      }
    });

    onOptionsChange({
      ...options,
      useAdvancedRules: true,
      mappingRules: generated
    });
  };

  // Sample token for live simulation
  const sampleToken = rawItems[0] || {};
  const sampleTokenId = sampleToken.token_id ?? sampleToken.tokenId ?? sampleToken.id ?? 1;

  return (
    <div className="flex flex-col gap-6 font-mono text-xs">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-[#0a0a0f] border border-cyan-900/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-white">
                Advanced Attribute & Nested Object Mapping Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                PRO PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Extract, transform, and flatten deep nested JSON structures (<code className="text-cyan-300 font-mono">stats.elemental.primary</code>, <code className="text-cyan-300 font-mono">equipment.durability</code>) and arrays into custom CSV headers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#050508] p-1 rounded-xl border border-cyan-900/40">
            <button
              onClick={() => handleToggleAdvancedMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                !options.useAdvancedRules
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Auto-Flatten Mode
            </button>
            <button
              onClick={() => handleToggleAdvancedMode(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-1.5 ${
                options.useAdvancedRules
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] font-extrabold'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rules Engine Active</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Rules Quick-Bar */}
      <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Load Preset Rule Templates:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLoadPreset('opensea_standard')}
            className="px-3 py-1 rounded-lg bg-[#050508] hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-cyan-900/30 hover:border-cyan-500/40 transition flex items-center gap-1.5"
          >
            <Braces className="w-3.5 h-3.5 text-cyan-400" />
            <span>OpenSea Key-Value Spec</span>
          </button>

          <button
            onClick={() => handleLoadPreset('rpg_game_items')}
            className="px-3 py-1 rounded-lg bg-[#050508] hover:bg-slate-900 text-slate-300 hover:text-purple-300 border border-purple-900/30 hover:border-purple-500/40 transition flex items-center gap-1.5"
          >
            <FolderTree className="w-3.5 h-3.5 text-purple-400" />
            <span>RPG Nested Stats &amp; Lore</span>
          </button>

          <button
            onClick={() => handleLoadPreset('array_showcase')}
            className="px-3 py-1 rounded-lg bg-[#050508] hover:bg-slate-900 text-slate-300 hover:text-emerald-300 border border-emerald-900/30 hover:border-emerald-500/40 transition flex items-center gap-1.5"
          >
            <Split className="w-3.5 h-3.5 text-emerald-400" />
            <span>Array Join &amp; Unroll Columns</span>
          </button>

          <button
            onClick={handleAutoGenerateRules}
            className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Generate All ({discoveredPaths.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Discovered Schema on Left, Active Rules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discovered Nested Paths Explorer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col">
            <div className="p-4 border-b border-cyan-900/30 bg-[#050508] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Discovered JSON Paths ({filteredDiscoveredPaths.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                {rawItems.length} tokens analyzed
              </span>
            </div>

            {/* Filter controls */}
            <div className="p-3 bg-[#0a0a0f] border-b border-cyan-900/30 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Search discovered paths or values..."
                value={pathSearch}
                onChange={(e) => setPathSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
              />

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setPathTypeFilter('all')}
                  className={`px-2 py-0.5 rounded ${pathTypeFilter === 'all' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All ({discoveredPaths.length})
                </button>
                <button
                  onClick={() => setPathTypeFilter('nested')}
                  className={`px-2 py-0.5 rounded ${pathTypeFilter === 'nested' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Nested Objects
                </button>
                <button
                  onClick={() => setPathTypeFilter('array')}
                  className={`px-2 py-0.5 rounded ${pathTypeFilter === 'array' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Arrays
                </button>
              </div>
            </div>

            {/* Discovered Paths List */}
            <div className="overflow-y-auto max-h-[460px] divide-y divide-cyan-950/20 p-2">
              {filteredDiscoveredPaths.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-sans">
                  No matching paths discovered in loaded metadata.
                </div>
              ) : (
                filteredDiscoveredPaths.map((dp) => {
                  const isAlreadyMapped = rules.some(r => r.sourcePath === dp.path && r.enabled);

                  return (
                    <div 
                      key={dp.path}
                      className="p-2.5 rounded-lg hover:bg-cyan-950/20 transition flex items-start justify-between gap-2 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-cyan-300 font-bold text-xs truncate">
                            {dp.path}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase border ${
                            dp.type === 'number'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : dp.type === 'array' || dp.type === 'array_of_objects'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : dp.type === 'boolean'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-[#050508] text-slate-400 border-slate-700'
                          }`}>
                            {dp.type}
                          </span>
                        </div>

                        {/* Sample value preview */}
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                          Sample: <span className="text-slate-300">{typeof dp.sampleValue === 'object' ? JSON.stringify(dp.sampleValue) : String(dp.sampleValue)}</span>
                        </div>

                        {/* Occurrence count */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 bg-slate-900 rounded-full h-1">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${dp.percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {dp.count}/{rawItems.length} tokens ({dp.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Add rule button */}
                      <button
                        onClick={() => handleOpenAddRule(dp.path)}
                        className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                          isAlreadyMapped
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-[#050508] group-hover:bg-cyan-500 group-hover:text-black text-slate-300 border border-cyan-900/40 transition'
                        }`}
                        title="Create a mapping rule for this path"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isAlreadyMapped ? 'Mapped' : 'Map Path'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Mapping Rules & Live Simulation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Rules List Container */}
          <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md flex flex-col">
            <div className="p-4 border-b border-cyan-900/30 bg-[#050508] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Active Mapping Rules ({rules.filter(r => r.enabled).length}/{rules.length})
                </h3>
              </div>

              <button
                onClick={() => handleOpenAddRule()}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(6,182,212,0.3)] uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Custom Rule</span>
              </button>
            </div>

            {/* Rules list */}
            <div className="p-3 divide-y divide-cyan-950/20 max-h-[460px] overflow-y-auto">
              {rules.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Workflow className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">No Custom Mapping Rules Defined</h4>
                    <p className="text-slate-400 text-[11px] font-sans mt-1 max-w-sm">
                      Click "Auto-Generate All" or select discovered paths on the left to extract nested JSON values.
                    </p>
                  </div>
                  <button
                    onClick={handleAutoGenerateRules}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                  >
                    Auto-Generate Rules
                  </button>
                </div>
              ) : (
                rules.map((rule) => {
                  // Test rule on sample token
                  let sampleOutput = '—';
                  if (rule.ruleType === 'key_value_attribute') {
                    sampleOutput = `Extracts ${sampleToken.attributes?.length || 0} attributes`;
                  } else {
                    const rawVal = extractRawPathValue(sampleToken, rule.sourcePath);
                    const evalRes = evaluateArrayValue(rawVal, rule.arrayHandling, {
                      targetColumn: rule.targetColumn,
                      targetFormat: rule.targetColumnFormat,
                      customSeparator: rule.customArraySeparator,
                      pluckField: rule.pluckField,
                      maxUnroll: rule.maxUnrollCount,
                      transform: rule.transform,
                      fallback: rule.fallbackValue,
                      prefix: rule.prefix,
                      suffix: rule.suffix
                    });
                    if (evalRes.isMultipleColumns && evalRes.multipleValues) {
                      sampleOutput = Object.entries(evalRes.multipleValues)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(', ');
                    } else {
                      sampleOutput = evalRes.singleValue !== undefined && evalRes.singleValue !== '' 
                        ? String(evalRes.singleValue) 
                        : (rule.fallbackValue || '—');
                    }
                  }

                  const formattedHeader = formatColumnHeader(rule.targetColumn, rule.targetColumnFormat);

                  return (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-xl transition flex flex-col gap-2 my-1 ${
                        rule.enabled 
                          ? 'bg-[#050508] border border-cyan-900/30 hover:border-cyan-500/40' 
                          : 'bg-[#050508]/40 border border-slate-800/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => handleToggleRule(rule.id)}
                            className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <div className="font-bold text-white text-xs truncate">
                            {rule.name}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setIsEditorOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                            title="Edit rule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateRule(rule)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                            title="Duplicate rule"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Rule details & mapping path */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#0a0a0f] p-2 rounded-lg border border-cyan-900/20 font-mono">
                        <div>
                          <span className="text-slate-500">Source: </span>
                          <span className="text-cyan-400 font-bold">{rule.sourcePath}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">CSV Header: </span>
                          <span className="text-emerald-400 font-bold">{formattedHeader}</span>
                        </div>
                      </div>

                      {/* Array strategy & live output preview */}
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                            Array: {rule.arrayHandling.replace('_', ' ')}
                          </span>
                          {rule.transform && rule.transform !== 'none' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                              Transform: {rule.transform}
                            </span>
                          )}
                        </div>

                        <div className="text-slate-300 truncate max-w-[200px]" title={sampleOutput}>
                          Token #{sampleTokenId} &rarr; <span className="text-cyan-300 font-bold">{sampleOutput}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Simulation Table Preview */}
      <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-md">
        <div className="p-4 border-b border-cyan-900/30 bg-[#050508] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Live Transformation Simulation (Tokens 1-{Math.min(3, parsedItems.length)})
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400">
            Real-time evaluated columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-[#050508] border-b border-cyan-900/30 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3">Token ID</th>
                <th className="py-2.5 px-3">Name</th>
                {rules.filter(r => r.enabled).slice(0, 6).map(r => (
                  <th key={r.id} className="py-2.5 px-3 text-cyan-300">
                    {formatColumnHeader(r.targetColumn, r.targetColumnFormat)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/20">
              {parsedItems.slice(0, 3).map((item) => (
                <tr key={item.id} className="hover:bg-cyan-950/15 transition">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">#{item.tokenId}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{item.raw.name || 'Unnamed'}</td>
                  {rules.filter(r => r.enabled).slice(0, 6).map(r => {
                    let cellVal = '—';
                    if (r.ruleType === 'key_value_attribute') {
                      cellVal = `${item.attributes.length} attrs`;
                    } else {
                      const rawVal = extractRawPathValue(item.raw, r.sourcePath);
                      const evalRes = evaluateArrayValue(rawVal, r.arrayHandling, {
                        targetColumn: r.targetColumn,
                        targetFormat: r.targetColumnFormat,
                        customSeparator: r.customArraySeparator,
                        pluckField: r.pluckField,
                        maxUnroll: r.maxUnrollCount,
                        transform: r.transform,
                        fallback: r.fallbackValue,
                        prefix: r.prefix,
                        suffix: r.suffix
                      });
                      if (evalRes.isMultipleColumns && evalRes.multipleValues) {
                        cellVal = Object.values(evalRes.multipleValues).join(', ');
                      } else {
                        cellVal = evalRes.singleValue !== undefined && evalRes.singleValue !== '' 
                          ? String(evalRes.singleValue) 
                          : (r.fallbackValue || '—');
                      }
                    }

                    return (
                      <td key={r.id} className="py-2.5 px-3 text-slate-300">
                        {cellVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Editor Modal */}
      {isEditorOpen && editingRule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col font-mono animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-cyan-900/40 bg-[#050508] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Workflow className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {editingRule.id.startsWith('rule_auto') ? 'Configure Auto-Rule' : 'Mapping Rule Editor'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {/* Rule Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-cyan-400">
                  Rule Label / Description
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g. Primary Elemental Damage"
                  className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>

              {/* Source JSON Path */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-cyan-400">
                  Source JSON Path
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingRule.sourcePath}
                    onChange={(e) => setEditingRule({ ...editingRule, sourcePath: e.target.value })}
                    placeholder="e.g. stats.elemental.primary or equipment.durability.current"
                    className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const p = e.target.value;
                        const col = p.split('.').pop() || p;
                        setEditingRule({
                          ...editingRule,
                          sourcePath: p,
                          targetColumn: editingRule.targetColumn || col
                        });
                      }
                    }}
                    className="bg-[#050508] border border-cyan-900/40 rounded-lg px-2 text-slate-400 text-xs focus:outline-none"
                  >
                    <option value="">Choose Discovered Path...</option>
                    {discoveredPaths.map(dp => (
                      <option key={dp.path} value={dp.path}>{dp.path} ({dp.type})</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">
                  Supports dot paths (<code className="text-cyan-400">stats.attack</code>), array indices (<code className="text-cyan-400">skills[0].name</code>), or array wildcards (<code className="text-cyan-400">creators[*].address</code>).
                </p>
              </div>

              {/* Target CSV Column & OpenSea Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-emerald-400">
                    Target Column Name
                  </label>
                  <input
                    type="text"
                    value={editingRule.targetColumn}
                    onChange={(e) => setEditingRule({ ...editingRule, targetColumn: e.target.value })}
                    placeholder="e.g. Element, Attack, Durability"
                    className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-emerald-400">
                    OpenSea Header Format
                  </label>
                  <select
                    value={editingRule.targetColumnFormat}
                    onChange={(e) => setEditingRule({ ...editingRule, targetColumnFormat: e.target.value as TargetColumnFormat })}
                    className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  >
                    <option value="property_bracket">property[Trait Name] (String trait)</option>
                    <option value="number_bracket">number[Trait Name] (Numeric level)</option>
                    <option value="boost_percentage_bracket">boost_percentage[Trait Name] (+% Boost)</option>
                    <option value="boost_number_bracket">boost_number[Trait Name] (+Number Boost)</option>
                    <option value="date_bracket">date[Trait Name] (Unix timestamp)</option>
                    <option value="attribute_bracket">attribute[Trait Name] (Generic)</option>
                    <option value="direct">Direct Header (No wrapper brackets)</option>
                  </select>
                </div>
              </div>

              {/* Array Handling Strategy */}
              <div className="border border-cyan-900/30 rounded-xl p-3.5 bg-[#050508] flex flex-col gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5" />
                    Array Handling Strategy (For nested arrays/lists)
                  </label>
                  <select
                    value={editingRule.arrayHandling}
                    onChange={(e) => setEditingRule({ ...editingRule, arrayHandling: e.target.value as ArrayHandlingMode })}
                    className="w-full bg-[#0a0a0f] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  >
                    <option value="join_comma">Join with Comma ( "Fire, Ice, Lightning" )</option>
                    <option value="join_pipe">Join with Pipe ( "Fire | Ice | Lightning" )</option>
                    <option value="join_semicolon">Join with Semicolon ( "Fire; Ice; Lightning" )</option>
                    <option value="join_custom">Join with Custom Delimiter</option>
                    <option value="unroll_columns">Unroll into Separate Columns ( Column_1, Column_2, ... )</option>
                    <option value="first_item">Extract First Element Only ([0])</option>
                    <option value="last_item">Extract Last Element Only ([last])</option>
                    <option value="count">Count Array Items (Array Length)</option>
                    <option value="pluck_property">Pluck Property from Array of Objects</option>
                    <option value="json_stringify">JSON Stringify Raw Array</option>
                  </select>
                </div>

                {editingRule.arrayHandling === 'join_custom' && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Custom Delimiter</label>
                    <input
                      type="text"
                      value={editingRule.customArraySeparator || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, customArraySeparator: e.target.value })}
                      placeholder="e.g. / or  - "
                      className="w-full bg-[#0a0a0f] border border-cyan-900/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                )}

                {editingRule.arrayHandling === 'unroll_columns' && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Max Unrolled Columns</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editingRule.maxUnrollCount || 3}
                      onChange={(e) => setEditingRule({ ...editingRule, maxUnrollCount: parseInt(e.target.value, 10) || 3 })}
                      className="w-full bg-[#0a0a0f] border border-cyan-900/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                )}

                {editingRule.arrayHandling === 'pluck_property' && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Property to Pluck from Objects</label>
                    <input
                      type="text"
                      value={editingRule.pluckField || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, pluckField: e.target.value })}
                      placeholder="e.g. name, address, or id"
                      className="w-full bg-[#0a0a0f] border border-cyan-900/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Transforms & Defaults */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-amber-400">
                    Value Transformation
                  </label>
                  <select
                    value={editingRule.transform || 'none'}
                    onChange={(e) => setEditingRule({ ...editingRule, transform: e.target.value as ValueTransformType })}
                    className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  >
                    <option value="none">None (Raw Value)</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize Words</option>
                    <option value="number_int">Convert to Integer</option>
                    <option value="number_float">Convert to Float</option>
                    <option value="boolean">Boolean (true/false)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-slate-400">
                    Fallback If Missing
                  </label>
                  <input
                    type="text"
                    value={editingRule.fallbackValue || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, fallbackValue: e.target.value })}
                    placeholder="e.g. None or 0"
                    className="w-full bg-[#050508] border border-cyan-900/40 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-cyan-900/40 bg-[#050508] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRule(editingRule)}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
              >
                Save Mapping Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
