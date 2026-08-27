import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Image as ImageIcon,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';
import { ParsedNFTItem, TraitDefinition } from '../types';
import { resolveDisplayImageUrl } from '../utils/converter';

interface NFTCardGalleryProps {
  items: ParsedNFTItem[];
  traitsMap: Map<string, TraitDefinition>;
  onSelectToken: (item: ParsedNFTItem) => void;
}

export const NFTCardGallery: React.FC<NFTCardGalleryProps> = ({
  items,
  traitsMap,
  onSelectToken
}) => {
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrorMap(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const raw = item.raw;
        const imgUrl = raw.image || raw.image_url;
        const displayUrl = resolveDisplayImageUrl(imgUrl);
        const hasImgError = imageErrorMap[item.id] || !displayUrl;
        const bgColor = raw.background_color ? `#${String(raw.background_color).replace(/^#/, '')}` : '#0f172a';

        const hasError = item.issues.some(i => i.severity === 'error');
        const hasWarning = item.issues.some(i => i.severity === 'warning');

        return (
          <div
            key={item.id}
            onClick={() => onSelectToken(item)}
            className="group bg-[#0a0a0f] border border-cyan-900/30 hover:border-cyan-400/80 rounded-xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-200 cursor-pointer flex flex-col font-mono"
          >
            {/* Image Artwork Frame */}
            <div 
              className="relative aspect-square w-full flex items-center justify-center overflow-hidden border-b border-cyan-900/30"
              style={{ backgroundColor: bgColor }}
            >
              {!hasImgError && displayUrl ? (
                <img
                  src={displayUrl}
                  alt={raw.name || `NFT #${item.tokenId}`}
                  onError={() => handleImageError(item.id)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-lg bg-[#050508] border border-cyan-900/40 flex items-center justify-center mb-2 text-cyan-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {imgUrl ? (imgUrl.length > 24 ? `${imgUrl.slice(0, 24)}...` : imgUrl) : 'No image URI'}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2.5 right-2.5">
                {hasError ? (
                  <span className="p-1.5 rounded-md bg-red-950/90 text-red-400 border border-red-800 shadow-md backdrop-blur-sm inline-flex items-center">
                    <XCircle className="w-3.5 h-3.5" />
                  </span>
                ) : hasWarning ? (
                  <span className="p-1.5 rounded-md bg-amber-950/90 text-amber-400 border border-amber-800 shadow-md backdrop-blur-sm inline-flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1.5 rounded-md bg-emerald-950/90 text-emerald-400 border border-emerald-800 shadow-md backdrop-blur-sm inline-flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Token ID pill */}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/85 border border-cyan-900/50 text-cyan-300 font-mono text-[10px] font-bold backdrop-blur-sm">
                #{item.tokenId}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition truncate mb-1">
                  {raw.name || `Token #${item.tokenId}`}
                </h4>
                {raw.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed font-sans">
                    {raw.description}
                  </p>
                )}
              </div>

              {/* Traits preview container */}
              {item.attributes.length > 0 && (
                <div className="pt-2 border-t border-cyan-900/20">
                  <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                    <span>Traits ({item.attributes.length})</span>
                    <span className="text-[10px] text-cyan-400 hover:underline">Inspect</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {item.attributes.slice(0, 4).map((attr, idx) => {
                      const isBoost = attr.display_type === 'boost_percentage' || attr.display_type === 'boost_number';
                      const isDate = attr.display_type === 'date';

                      return (
                        <div
                          key={idx}
                          className="bg-[#050508] border border-cyan-900/30 rounded-lg p-1.5 text-left"
                        >
                          <div className="text-[9px] text-slate-500 uppercase truncate">
                            {attr.trait_type || 'Trait'}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-200 truncate font-mono">
                            {isDate && typeof attr.value === 'number'
                              ? new Date(attr.value * 1000).toLocaleDateString()
                              : String(attr.value)}
                          </div>
                          {isBoost && attr.max_value && (
                            <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
                              <div
                                className="bg-cyan-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, (Number(attr.value) / Number(attr.max_value)) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.attributes.length > 4 && (
                    <div className="mt-1.5 text-center text-[10px] text-slate-500 font-mono">
                      +{item.attributes.length - 4} more traits
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
