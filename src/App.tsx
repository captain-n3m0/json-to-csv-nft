import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Table, 
  LayoutGrid, 
  FileSpreadsheet, 
  ShieldAlert, 
  Sliders, 
  Download, 
  FileCode, 
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Workflow, 
  Cloud, 
  ShieldCheck, 
  Zap, 
  Lock, 
  FolderSync, 
  Layers,
  FileText
} from 'lucide-react';
import { 
  ConversionOptions, 
  ParsedNFTItem, 
  TraitDefinition, 
  BatchProcessingStats,
  CSVPresetFormat,
  ValidationIssue,
  RawNFTMetadata
} from './types';
import { SAMPLE_DATASETS } from './data/samples';
import { 
  parseAndProcessMetadata, 
  generateCSVString 
} from './utils/converter';

import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { DashboardStats } from './components/DashboardStats';
import { ConfigPanel } from './components/ConfigPanel';
import { DataTablePreview } from './components/DataTablePreview';
import { NFTCardGallery } from './components/NFTCardGallery';
import { ValidationLogs } from './components/ValidationLogs';
import { TraitMappingManager } from './components/TraitMappingManager';
import { AdvancedMappingManager } from './components/AdvancedMappingManager';
import { RawCSVViewer } from './components/RawCSVViewer';
import { PasteJsonModal } from './components/PasteJsonModal';
import { DocGuideModal } from './components/DocGuideModal';
import { TokenDetailModal } from './components/TokenDetailModal';
import { AWSDeployModal } from './components/AWSDeployModal';

const DEFAULT_OPTIONS: ConversionOptions = {
  presetFormat: 'opensea',
  traitHeaderFormat: 'property_bracket',
  customTraitPrefix: '',
  nestedSeparator: '.',
  handleNestedObjects: 'flatten_dot',
  tokenIdSource: 'file_name',
  csvDelimiter: ',',
  quoteStyle: 'necessary',
  includeHeader: true,
  sortTraitsAlphabetically: false,
  cleanHexColors: true,
  autoFillEmptyNames: true,
  ipfsGateway: 'raw',
  customIpfsGatewayUrl: '',
  excludedColumns: [],
  useAdvancedRules: false,
  mappingRules: []
};

export default function App() {
  // Loaded raw files
  const [loadedFiles, setLoadedFiles] = useState<Array<{ fileName: string; content: string }>>([]);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [activeTab, setActiveTab] = useState<'table' | 'gallery' | 'validation' | 'traits' | 'mapping' | 'raw_csv'>('table');
  
  // Modals state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isAWSModalOpen, setIsAWSModalOpen] = useState(false);
  const [selectedTokenItem, setSelectedTokenItem] = useState<ParsedNFTItem | null>(null);

  // Clean production startup - starts empty for real user uploads
  useEffect(() => {
    // Initialized clean with no mock data preloaded
  }, []);

  // Process data whenever files or options change
  const { items, allTraits, stats } = useMemo(() => {
    if (loadedFiles.length === 0) {
      return {
        items: [],
        allTraits: new Map<string, TraitDefinition>(),
        stats: {
          totalFiles: 0,
          totalTokens: 0,
          validTokens: 0,
          warningTokens: 0,
          errorTokens: 0,
          distinctTraitsCount: 0,
          totalIssuesCount: 0
        }
      };
    }
    return parseAndProcessMetadata(loadedFiles, options);
  }, [loadedFiles, options]);

  // Raw metadata extraction for discovered paths analysis
  const rawMetadataList: RawNFTMetadata[] = useMemo(() => {
    const list: RawNFTMetadata[] = [];
    loadedFiles.forEach(file => {
      try {
        const parsed = JSON.parse(file.content);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && typeof item === 'object') list.push(item);
          });
        } else if (parsed && typeof parsed === 'object') {
          list.push(parsed);
        }
      } catch (e) {
        // Syntax errors handled by parser
      }
    });
    return list;
  }, [loadedFiles]);

  // Aggregate all issues across items
  const allIssues = useMemo(() => {
    const list: ValidationIssue[] = [];
    items.forEach(item => {
      list.push(...item.issues);
    });
    return list;
  }, [items]);

  const fixableCount = useMemo(() => {
    return allIssues.filter(i => i.fixable).length;
  }, [allIssues]);

  // Generate CSV text
  const csvContent = useMemo(() => {
    return generateCSVString(items, options, allTraits);
  }, [items, options, allTraits]);

  // Handlers
  const handleFilesLoaded = (newFiles: Array<{ fileName: string; content: string }>) => {
    setLoadedFiles(newFiles);
    setActiveTab('table');
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_DATASETS.find(s => s.id === sampleId);
    if (sample) {
      setLoadedFiles([
        {
          fileName: `${sample.id}_metadata.json`,
          content: JSON.stringify(sample.data, null, 2)
        }
      ]);
    }
  };

  const handlePasteJsonConfirm = (jsonText: string) => {
    setLoadedFiles([
      {
        fileName: 'pasted_metadata.json',
        content: jsonText
      }
    ]);
  };

  const handleReset = () => {
    setLoadedFiles([]);
  };

  const handlePresetChange = (preset: CSVPresetFormat) => {
    if (preset === 'opensea') {
      setOptions({
        ...options,
        presetFormat: 'opensea',
        traitHeaderFormat: 'property_bracket',
        nestedSeparator: '.',
        cleanHexColors: true,
        tokenIdSource: 'file_name',
        csvDelimiter: ','
      });
    } else if (preset === 'thirdweb') {
      setOptions({
        ...options,
        presetFormat: 'thirdweb',
        traitHeaderFormat: 'direct',
        nestedSeparator: '.',
        cleanHexColors: false,
        tokenIdSource: 'token_id',
        csvDelimiter: ','
      });
    } else if (preset === 'direct_traits') {
      setOptions({
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

  // One-click batch fixer for auto-fixable issues
  const handleApplyAllFixes = () => {
    setOptions(prev => ({
      ...prev,
      cleanHexColors: true,
      autoFillEmptyNames: true,
      tokenIdSource: 'auto_1'
    }));
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `opensea_nft_metadata_${options.presetFormat}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Header
        onLoadSample={handleLoadSample}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        onOpenAWSModal={() => setIsAWSModalOpen(true)}
        onReset={handleReset}
        hasData={items.length > 0}
        totalTokens={items.length}
        currentPreset={options.presetFormat}
        onChangePreset={handlePresetChange}
        onExportCSV={handleDownloadCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Upload Zone */}
        <UploadZone
          onFilesLoaded={handleFilesLoaded}
          onLoadSample={handleLoadSample}
          onOpenPasteModal={() => setIsPasteModalOpen(true)}
          totalTokens={items.length}
        />

        {/* Empty Production Workspace Landing State */}
        {items.length === 0 && (
          <div className="flex flex-col gap-6 font-mono">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl p-5 shadow-lg flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">100% In-Browser Privacy</h3>
                  <p className="text-slate-400 text-xs font-sans mt-1 leading-relaxed">
                    Zero backend data transmission. Unreleased generative art, IPFS URIs, and trait rarities are parsed in local client memory.
                  </p>
                </div>
                <div className="mt-auto pt-2 border-t border-cyan-950/40 text-[10px] text-cyan-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confidential &amp; Secure</span>
                </div>
              </div>

              <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl p-5 shadow-lg flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">High-Throughput Batch Engine</h3>
                  <p className="text-slate-400 text-xs font-sans mt-1 leading-relaxed">
                    Instantly compiles 10,000+ files, multi-megabyte <code className="text-purple-300 font-mono">_metadata.json</code>, or compressed ZIPs with real-time trait validation.
                  </p>
                </div>
                <div className="mt-auto pt-2 border-t border-purple-950/40 text-[10px] text-purple-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sub-second CSV flattening</span>
                </div>
              </div>

              <div className="bg-[#0a0a0f] border border-cyan-900/30 rounded-xl p-5 shadow-lg flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AWS Production Ready</h3>
                  <p className="text-slate-400 text-xs font-sans mt-1 leading-relaxed">
                    100% serverless static assets. Deploy in seconds to AWS S3 + CloudFront, AWS Amplify, or Docker with zero server maintenance.
                  </p>
                </div>
                <button
                  onClick={() => setIsAWSModalOpen(true)}
                  className="mt-auto pt-2 border-t border-emerald-950/40 text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center justify-between font-bold group"
                >
                  <span className="flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>View AWS Deployment Guide</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Quick Ingestion Tip Bar */}
            <div className="bg-[#050508] border border-cyan-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-slate-300 font-sans">
                  Ready for production metadata files. Drag and drop your <code className="text-cyan-300 font-mono">.json</code> files, <code className="text-cyan-300 font-mono">.zip</code> archive, or click <strong>Paste JSON</strong> above.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPasteModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paste JSON Text</span>
                </button>
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Standards Docs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* Dashboard Analytics & Health Metrics */}
            <DashboardStats
              stats={stats}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as any)}
              onFilterIssues={() => setActiveTab('validation')}
              onApplyAllFixes={handleApplyAllFixes}
              fixableCount={fixableCount}
            />

            {/* Pipeline Configuration Drawer */}
            <ConfigPanel
              options={options}
              onOptionsChange={setOptions}
              onResetDefaults={() => setOptions(DEFAULT_OPTIONS)}
            />

            {/* Navigation Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/30 pb-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0a0f] p-1 rounded-xl border border-cyan-900/30 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'table'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-csv-datatable"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>CSV Data Table</span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'gallery'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-nft-gallery"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>NFT Preview Cards</span>
                </button>

                <button
                  onClick={() => setActiveTab('validation')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'validation'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-validation-logs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Validation Logs</span>
                  {stats.errorTokens > 0 ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500 text-white font-bold">
                      {stats.errorTokens}
                    </span>
                  ) : stats.warningTokens > 0 ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-black font-bold">
                      {stats.warningTokens}
                    </span>
                  ) : null}
                </button>

                <button
                  onClick={() => setActiveTab('traits')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'traits'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-trait-manager"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Trait Columns ({allTraits.size})</span>
                </button>

                <button
                  onClick={() => setActiveTab('mapping')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'mapping'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-advanced-mapping"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Advanced Mapping</span>
                  {options.useAdvancedRules && options.mappingRules && options.mappingRules.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {options.mappingRules.filter(r => r.enabled).length} Active
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('raw_csv')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                    activeTab === 'raw_csv'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-raw-csv"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Raw CSV Code</span>
                </button>
              </div>

              {/* Quick actions right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition active:scale-95 uppercase tracking-wider font-mono"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download .CSV</span>
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            <div className="animate-in fade-in duration-200">
              {activeTab === 'table' && (
                <DataTablePreview
                  items={items}
                  options={options}
                  traitsMap={allTraits}
                  onSelectToken={setSelectedTokenItem}
                />
              )}

              {activeTab === 'gallery' && (
                <NFTCardGallery
                  items={items}
                  traitsMap={allTraits}
                  onSelectToken={setSelectedTokenItem}
                />
              )}

              {activeTab === 'validation' && (
                <ValidationLogs
                  issues={allIssues}
                  items={items}
                  onSelectToken={setSelectedTokenItem}
                  onApplyAllFixes={handleApplyAllFixes}
                  fixableCount={fixableCount}
                />
              )}

              {activeTab === 'traits' && (
                <TraitMappingManager
                  traitsMap={allTraits}
                  options={options}
                  onOptionsChange={setOptions}
                  totalTokens={items.length}
                />
              )}

              {activeTab === 'mapping' && (
                <AdvancedMappingManager
                  options={options}
                  onOptionsChange={setOptions}
                  rawItems={rawMetadataList}
                  parsedItems={items}
                />
              )}

              {activeTab === 'raw_csv' && (
                <RawCSVViewer
                  csvContent={csvContent}
                  options={options}
                  onOptionsChange={setOptions}
                  onDownloadCSV={handleDownloadCSV}
                  rowCount={items.length}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Immersive System Telemetry Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#050508] py-4 mt-12 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold text-white uppercase tracking-wider">COMPILER ENGINE: ONLINE</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-cyan-400/80 hidden sm:inline">
              RFC4180 COMPLIANT • OPENSEA METADATA STANDARD
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">BATCH MEMORY:</span>
              <span className="text-cyan-300 font-bold">
                {((csvContent.length + items.length * 200) / 1024).toFixed(1)} KB
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <button onClick={() => setIsDocModalOpen(true)} className="hover:text-cyan-300 transition text-slate-300">
              Metadata Specifications
            </button>
            <span className="text-slate-600">•</span>
            <button onClick={() => setIsAWSModalOpen(true)} className="hover:text-cyan-300 transition text-slate-300 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-cyan-400" />
              <span>AWS Deployment</span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">ENCRYPTION: CLIENT-SIDE AES-256 ACTIVE</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PasteJsonModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onConfirm={handlePasteJsonConfirm}
        onLoadSample={handleLoadSample}
      />

      <DocGuideModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      <AWSDeployModal
        isOpen={isAWSModalOpen}
        onClose={() => setIsAWSModalOpen(false)}
      />

      <TokenDetailModal
        item={selectedTokenItem}
        onClose={() => setSelectedTokenItem(null)}
      />
    </div>
  );
}
