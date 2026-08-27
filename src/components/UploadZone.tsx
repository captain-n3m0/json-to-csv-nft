import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCode, 
  FolderArchive, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  FolderOpen
} from 'lucide-react';
import JSZip from 'jszip';
import { SAMPLE_DATASETS } from '../data/samples';

interface UploadZoneProps {
  onFilesLoaded: (files: Array<{ fileName: string; content: string }>) => void;
  onLoadSample: (sampleId: string) => void;
  onOpenPasteModal: () => void;
  totalTokens: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesLoaded,
  onLoadSample,
  onOpenPasteModal,
  totalTokens
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract JSONs from JSZip archive
  const handleZipFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingMsg(`Extracting ZIP archive: ${file.name}...`);
    try {
      const zip = new JSZip();
      const unzipped = await zip.loadAsync(file);
      const jsonFiles: Array<{ fileName: string; content: string }> = [];

      const entries = Object.keys(unzipped.files).filter(
        name => !unzipped.files[name].dir && name.toLowerCase().endsWith('.json') && !name.includes('__MACOSX')
      );

      setProcessingMsg(`Reading ${entries.length} JSON files from archive...`);

      for (const entryName of entries) {
        const fileData = unzipped.files[entryName];
        const content = await fileData.async('string');
        const cleanFileName = entryName.split('/').pop() || entryName;
        jsonFiles.push({ fileName: cleanFileName, content });
      }

      if (jsonFiles.length === 0) {
        alert('No .json files found inside the uploaded ZIP archive.');
      } else {
        onFilesLoaded(jsonFiles);
      }
    } catch (err: any) {
      alert(`Failed to extract ZIP: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // Process standard files array
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check if zip
    const zipFile = fileArray.find(f => f.name.toLowerCase().endsWith('.zip'));
    if (zipFile) {
      await handleZipFile(zipFile);
      return;
    }

    setIsProcessing(true);
    setProcessingMsg(`Reading ${fileArray.length} file(s)...`);

    const jsonFiles: Array<{ fileName: string; content: string }> = [];

    for (let i = 0; i < fileArray.length; i++) {
      const f = fileArray[i];
      if (f.name.toLowerCase().endsWith('.json') || f.type === 'application/json' || f.name.endsWith('.txt')) {
        try {
          const content = await f.text();
          jsonFiles.push({ fileName: f.name, content });
        } catch (e) {
          console.error(`Error reading ${f.name}`, e);
        }
      }
    }

    if (jsonFiles.length > 0) {
      onFilesLoaded(jsonFiles);
    } else {
      alert('Please upload .json files, _metadata.json, or a .zip archive containing NFT metadata.');
    }

    setIsProcessing(false);
    setProcessingMsg('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[0.998] ring-4 ring-cyan-500/20'
            : 'border-cyan-900/30 hover:border-cyan-500/40 bg-[#0a0a0f]'
        } p-6 sm:p-7`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Main Icon with Glow */}
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] mb-3.5 text-cyan-400">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-7 h-7 stroke-[1.75]" />
            )}
          </div>

          {/* Heading & description */}
          <h2 className="text-base sm:text-lg font-bold text-white mb-1 font-display tracking-wider uppercase">
            {isProcessing ? processingMsg : 'Ingest NFT Metadata JSONs or ZIP Archive'}
          </h2>
          <p className="text-xs text-slate-400 mb-5 max-w-lg leading-relaxed">
            Batch process HashLips <code className="text-cyan-300 font-mono text-[11px] bg-slate-900 border border-cyan-900/40 px-1.5 py-0.5 rounded">_metadata.json</code>,
            individual <code className="text-cyan-300 font-mono text-[11px] bg-slate-900 border border-cyan-900/40 px-1.5 py-0.5 rounded">0.json ... 10000.json</code>,
            or compressed archives for OpenSea bulk listing.
          </p>

          {/* Upload Button Groups */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5 font-mono text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition active:scale-95 disabled:opacity-50"
              id="btn-upload-json-files"
            >
              <FileCode className="w-4 h-4" />
              <span>Select JSON Files</span>
            </button>

            <button
              onClick={() => zipInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
              id="btn-upload-zip-archive"
            >
              <FolderArchive className="w-4 h-4 text-cyan-400" />
              <span>Upload ZIP Archive</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
              id="btn-upload-folder"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Select Folder</span>
            </button>

            <button
              onClick={onOpenPasteModal}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition active:scale-95 disabled:opacity-50"
              id="btn-paste-json-direct"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Paste Text</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="w-full pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Preset NFT Datasets:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample.id)}
                  className="px-2.5 py-1 rounded-md bg-[#050508] hover:bg-slate-900 border border-cyan-900/30 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition text-[11px] font-mono"
                >
                  {sample.badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
