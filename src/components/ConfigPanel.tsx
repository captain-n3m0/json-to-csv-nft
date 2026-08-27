import React, { useState } from 'react';
import { 
  Settings2, 
  Layers, 
  Hash, 
  Split, 
  Palette, 
  Globe, 
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { ConversionOptions, CSVPresetFormat } from '../types';

interface ConfigPanelProps {
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  onResetDefaults: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  options,
  onOptionsChange,
  onResetDefaults
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  const handlePresetSelect = (preset: CSVPresetFormat) => {
    if (preset === 'opensea') {
      onOptionsChange({
        ...options,
        presetFormat: 'opensea',
        traitHeaderFormat: 'property_bracket',
        nestedSeparator: '.',
        cleanHexColors: true,
        tokenIdSource: 'file_name',
        csvDelimiter: ','
      });
    } else if (preset === 'thirdweb') {
      onOptionsChange({
        ...options,
        presetFormat: 'thirdweb',
        traitHeaderFormat: 'direct',
        nestedSeparator: '.',
        cleanHexColors: false,
        tokenIdSource: 'token_id',
        csvDelimiter: ','
      });
    } else if (preset === 'direct_traits') {
      onOptionsChange({
        ...options,
        presetFormat: 'direct_traits',
        traitHeaderFormat: 'direct',
        nestedSeparator: '_',
        cleanHexColors: false,
        tokenIdSource: 'auto_1',
        csvDelimiter: ','
      });
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-sm transition">
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 bg-[#0a0a0f] border-b border-cyan-900/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Conversion & Formatting Pipeline
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Preset: <span className="text-cyan-300 font-semibold uppercase">{options.presetFormat}</span> • Separator: <span className="font-mono text-cyan-400">"{options.nestedSeparator}"</span> • Token ID: <span className="text-slate-300">{options.tokenIdSource}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#050508] hover:bg-slate-900 text-slate-200 border border-cyan-900/40 hover:border-cyan-500/40 transition"
          >
            <span>{isOpen ? 'Collapse Pipeline' : 'Configure Pipeline'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Expanded controls */}
      {isOpen && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 bg-[#050508] animate-in fade-in duration-150 text-xs font-mono">
          {/* Column 1: Preset & Trait Header Style */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Target Marketplace
              </label>
              <select
                value={options.presetFormat}
                onChange={(e) => handlePresetSelect(e.target.value as CSVPresetFormat)}
                className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
              >
                <option value="opensea">OpenSea Standard (property[...], number[...])</option>
                <option value="thirdweb">Thirdweb / Manifold Studio Bulk CSV</option>
                <option value="direct_traits">Direct Trait Names (Background, Eyes, Hat)</option>
                <option value="custom">Custom Format</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                OpenSea format automatically generates <code className="text-cyan-400 font-mono">property[Trait]</code>, <code className="text-cyan-400 font-mono">boost_percentage[Stat]</code> headers.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-slate-400">
                Trait Column Header Style
              </label>
              <select
                value={options.traitHeaderFormat}
                onChange={(e) => updateOption('traitHeaderFormat', e.target.value as any)}
                className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
              >
                <option value="property_bracket">property[Trait Name]</option>
                <option value="attribute_bracket">attribute[Trait Name]</option>
                <option value="prefix_attr">attribute_TraitName</option>
                <option value="direct">Direct: Trait Name</option>
                <option value="custom_prefix">Custom Prefix...</option>
              </select>
              {options.traitHeaderFormat === 'custom_prefix' && (
                <input
                  type="text"
                  placeholder="e.g. trait_"
                  value={options.customTraitPrefix}
                  onChange={(e) => updateOption('customTraitPrefix', e.target.value)}
                  className="w-full mt-1.5 bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs"
                />
              )}
            </div>
          </div>

          {/* Column 2: Nested Attributes & Separator */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block font-bold mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                <Split className="w-3.5 h-3.5 text-cyan-400" />
                Nested Key Separator
              </label>
              <select
                value={options.nestedSeparator}
                onChange={(e) => updateOption('nestedSeparator', e.target.value as any)}
                className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
              >
                <option value=".">Dot notation (stats.attack.power)</option>
                <option value=" > ">Arrow notation (stats &gt; attack &gt; power)</option>
                <option value="_">Underscore (stats_attack_power)</option>
                <option value=" - ">Hyphen (stats - attack - power)</option>
                <option value="/">Slash (stats/attack/power)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Flattens nested objects into unique CSV column headers.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                Token ID Source
              </label>
              <select
                value={options.tokenIdSource}
                onChange={(e) => updateOption('tokenIdSource', e.target.value as any)}
                className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
              >
                <option value="file_name">Numeric Filename (0.json → 0, 1.json → 1)</option>
                <option value="edition">From 'edition' field</option>
                <option value="token_id">From 'token_id' or 'tokenId' field</option>
                <option value="auto_1">Auto-increment (1, 2, 3, ...)</option>
                <option value="auto_0">Auto-increment (0, 1, 2, ...)</option>
                <option value="keep_original">Preserve existing raw ID</option>
              </select>
            </div>
          </div>

          {/* Column 3: Sanitize & Auto-Fix Flags */}
          <div className="flex flex-col gap-2.5 font-sans">
            <label className="block text-slate-300 font-bold mb-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400 font-mono">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Sanitization Rules
            </label>

            <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={options.cleanHexColors}
                onChange={(e) => updateOption('cleanHexColors', e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-xs text-slate-200">Strip '#' from background_color</span>
                <span className="block text-[10px] text-slate-400">
                  OpenSea requires 6-char hex like <code className="text-amber-400 font-mono">FFFFFF</code>.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={options.autoFillEmptyNames}
                onChange={(e) => updateOption('autoFillEmptyNames', e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-xs text-slate-200">Auto-fill Missing Names</span>
                <span className="block text-[10px] text-slate-400">
                  Generates fallback name <code className="text-cyan-400 font-mono">NFT #ID</code>.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={options.sortTraitsAlphabetically}
                onChange={(e) => updateOption('sortTraitsAlphabetically', e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-xs text-slate-200">Sort Trait Columns A–Z</span>
                <span className="block text-[10px] text-slate-400">
                  Alphabetizes all attribute headers.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={options.useAdvancedRules}
                onChange={(e) => updateOption('useAdvancedRules', e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-xs text-cyan-300">Custom Mapping Pipeline</span>
                <span className="block text-[10px] text-slate-400">
                  Enable custom rules for nested JSON &amp; array flattening.
                </span>
              </div>
            </label>
          </div>

          {/* Column 4: CSV Dialect & IPFS Transform */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                IPFS URI Transform
              </label>
              <select
                value={options.ipfsGateway}
                onChange={(e) => updateOption('ipfsGateway', e.target.value as any)}
                className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
              >
                <option value="raw">Keep Raw ipfs:// (OpenSea Standard)</option>
                <option value="cloudflare">Cloudflare IPFS Gateway</option>
                <option value="ipfs_io">ipfs.io Gateway</option>
                <option value="pinata">Pinata Gateway</option>
                <option value="custom">Custom Gateway URL...</option>
              </select>
              {options.ipfsGateway === 'custom' && (
                <input
                  type="text"
                  placeholder="https://my-gateway.mypinata.cloud/ipfs"
                  value={options.customIpfsGatewayUrl}
                  onChange={(e) => updateOption('customIpfsGatewayUrl', e.target.value)}
                  className="w-full mt-1.5 bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px] uppercase tracking-wider text-slate-400">
                CSV Delimiter
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={options.csvDelimiter}
                  onChange={(e) => updateOption('csvDelimiter', e.target.value as any)}
                  className="w-full bg-[#0a0a0f] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-medium"
                >
                  <option value=",">Comma (Standard , )</option>
                  <option value=";">Semicolon ( ; )</option>
                  <option value="&#9;">Tab Delimited ( \t )</option>
                  <option value="|">Pipe Delimited ( | )</option>
                </select>
                <button
                  onClick={onResetDefaults}
                  className="p-2 rounded-lg bg-[#0a0a0f] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition shrink-0"
                  title="Reset to default OpenSea settings"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
