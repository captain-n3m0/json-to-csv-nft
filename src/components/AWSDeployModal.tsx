import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Terminal, 
  Check, 
  Copy, 
  ShieldCheck, 
  Server, 
  Layers, 
  Globe, 
  Zap, 
  Code2,
  FolderSync,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AWSDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AWSDeployModal: React.FC<AWSDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 's3_cloudfront' | 'amplify' | 'docker' | 'architecture'>('vercel');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const vercelJsonSnippet = `{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const vercelCliCommands = `# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Deploy project
vercel

# 3. Deploy directly to Production
vercel --prod`;

  const s3CliCommands = `# 1. Build optimized static distribution
npm run build

# 2. (Optional) Create AWS S3 Bucket
aws s3 mb s3://nft-metadata-csv-converter --region us-east-1

# 3. Sync built dist/ folder to S3 bucket
aws s3 sync dist/ s3://nft-metadata-csv-converter --delete

# 4. Invalidate CloudFront CDN cache for immediate propagation
aws cloudfront create-invalidation --distribution-id YOUR_CF_DIST_ID --paths "/*"`;

  const dockerfileSnippet = `# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with high-performance Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const nginxConfigSnippet = `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#0a0a0f] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-900/40 flex items-center justify-between bg-[#050508]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">
                  Cloud Deployment &amp; Hosting Guide
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  VERCEL • AWS • NETLIFY READY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Ready for instant static hosting with zero server maintenance and client-side privacy.
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#050508] border-b border-cyan-900/30 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-cyan-400 text-cyan-300 bg-[#0a0a0f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vercel (404 Solution)</span>
          </button>

          <button
            onClick={() => setActiveTab('s3_cloudfront')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 's3_cloudfront'
                ? 'border-cyan-400 text-cyan-300 bg-[#0a0a0f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>AWS S3 + CloudFront</span>
          </button>

          <button
            onClick={() => setActiveTab('amplify')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'amplify'
                ? 'border-cyan-400 text-cyan-300 bg-[#0a0a0f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>AWS Amplify</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'docker'
                ? 'border-cyan-400 text-cyan-300 bg-[#0a0a0f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Docker &amp; Containers</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-300 bg-[#0a0a0f]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Architecture &amp; Privacy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Tab: Vercel */}
          {activeTab === 'vercel' && (
            <div className="space-y-4 font-sans">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-mono text-emerald-400">
                    404 Not Found Solution Applied (vercel.json Added)
                  </h4>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Vercel threw a <strong>404 Not Found</strong> because Vite projects output static files into the <code className="text-cyan-300 font-mono">dist</code> folder and need Single Page Application (SPA) rewrite rules to route all URLs to <code className="text-cyan-300 font-mono">/index.html</code>.
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    We have created <code className="text-emerald-300 font-mono">vercel.json</code> and <code className="text-emerald-300 font-mono">public/_redirects</code> in the project root to solve this automatically on your next deploy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white font-mono text-xs text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4" />
                      vercel.json (Included in Project)
                    </h5>
                    <pre className="p-3 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 text-[11px] text-cyan-300 font-mono overflow-x-auto leading-relaxed">
                      {vercelJsonSnippet}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy('vercel_json', vercelJsonSnippet)}
                    className="mt-3 w-full py-1.5 rounded bg-[#0a0a0f] hover:bg-slate-800 border border-cyan-900/40 text-slate-300 hover:text-white transition flex items-center justify-center gap-1 text-xs font-mono"
                  >
                    {copiedId === 'vercel_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'vercel_json' ? 'Copied' : 'Copy vercel.json'}</span>
                  </button>
                </div>

                <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white font-mono text-xs text-purple-400 mb-2 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" />
                      Vercel Dashboard Settings
                    </h5>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="p-2 rounded bg-[#0a0a0f] border border-cyan-900/30 flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[11px]">Framework Preset:</span>
                        <span className="font-bold font-mono text-cyan-300 text-[11px]">Vite</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0a0f] border border-cyan-900/30 flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[11px]">Build Command:</span>
                        <span className="font-bold font-mono text-emerald-300 text-[11px]">npm run build</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0a0f] border border-cyan-900/30 flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[11px]">Output Directory:</span>
                        <span className="font-bold font-mono text-amber-300 text-[11px]">dist</span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0a0f] border border-cyan-900/30 flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[11px]">Install Command:</span>
                        <span className="font-bold font-mono text-slate-200 text-[11px]">npm install</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy('vercel_cli', vercelCliCommands)}
                    className="mt-3 w-full py-1.5 rounded bg-[#0a0a0f] hover:bg-slate-800 border border-cyan-900/40 text-slate-300 hover:text-white transition flex items-center justify-center gap-1 text-xs font-mono"
                  >
                    {copiedId === 'vercel_cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'vercel_cli' ? 'Copied' : 'Copy CLI Commands'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
                <h5 className="font-bold text-white font-mono text-xs text-slate-200 mb-2">
                  How to Redeploy on Vercel:
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>In your Vercel Dashboard, go to your project &rarr; <strong>Settings</strong> &rarr; <strong>General</strong>.</li>
                  <li>Ensure <strong>Framework Preset</strong> is set to <strong>Vite</strong> and <strong>Output Directory</strong> is <strong>dist</strong> (or leave on default with our <code className="text-cyan-300 font-mono">vercel.json</code>).</li>
                  <li>Click <strong>Deployments</strong> &rarr; Select your latest commit &rarr; Click <strong>Redeploy</strong> (or push a new commit).</li>
                  <li>Your deployment will succeed immediately without 404 errors!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 1: S3 + CloudFront */}
          {activeTab === 's3_cloudfront' && (
            <div className="space-y-4">
              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2 text-cyan-400">
                  <Globe className="w-4 h-4" />
                  Why S3 + CloudFront is the Best Option for AWS
                </h4>
                <p className="text-slate-400 font-sans text-xs">
                  Because this application is 100% client-side, compiling it produces static HTML, JavaScript, and CSS bundles in <code className="text-cyan-300 font-mono">dist/</code>. Serving this via CloudFront provides global edge caching, instant page load, free HTTPS SSL, and $0 backend maintenance costs.
                </p>
              </div>

              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" />
                    AWS CLI Build &amp; Deployment Script
                  </div>
                  <button
                    onClick={() => handleCopy('s3_cli', s3CliCommands)}
                    className="px-2.5 py-1 rounded bg-[#0a0a0f] hover:bg-slate-800 border border-cyan-900/40 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 's3_cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 's3_cli' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 overflow-x-auto text-[11px] text-cyan-300 font-mono leading-relaxed">
                  {s3CliCommands}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                <div className="bg-[#050508] p-3.5 rounded-xl border border-cyan-900/30">
                  <h5 className="font-bold text-white mb-1 font-mono text-[11px] text-emerald-400">
                    CloudFront Distribution Setup
                  </h5>
                  <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                    <li>Origin: Your S3 bucket with OAC (Origin Access Control)</li>
                    <li>Viewer Protocol Policy: <strong>Redirect HTTP to HTTPS</strong></li>
                    <li>Allowed HTTP Methods: <strong>GET, HEAD</strong></li>
                    <li>Cache Policy: <strong>CachingOptimized</strong></li>
                  </ul>
                </div>

                <div className="bg-[#050508] p-3.5 rounded-xl border border-cyan-900/30">
                  <h5 className="font-bold text-white mb-1 font-mono text-[11px] text-purple-400">
                    SPA Routing Fallback (Single Page App)
                  </h5>
                  <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                    <li>CloudFront Custom Error Response:</li>
                    <li>HTTP Error Code: <strong>403 &amp; 404</strong></li>
                    <li>Customize Response: <strong>Yes</strong></li>
                    <li>Response Page Path: <strong>/index.html</strong> (HTTP 200)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AWS Amplify */}
          {activeTab === 'amplify' && (
            <div className="space-y-4">
              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 font-sans">
                <h4 className="font-bold text-white text-sm mb-1 text-cyan-400 font-mono">
                  AWS Amplify Hosting (Continuous Deployment via Git)
                </h4>
                <p className="text-slate-400 text-xs">
                  AWS Amplify provides fully managed hosting with automatic builds on every Git commit, branch previews, custom domains, and free SSL certificates.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex items-start gap-3 bg-[#050508] p-3.5 rounded-xl border border-cyan-900/30">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-white font-mono text-xs">Connect Repository in AWS Console:</strong>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Navigate to AWS Amplify &rarr; Click <strong>"Host web app"</strong> &rarr; Select GitHub, GitLab, or AWS CodeCommit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#050508] p-3.5 rounded-xl border border-cyan-900/30">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-white font-mono text-xs">Configure Build Settings:</strong>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Amplify automatically detects Vite. Ensure the output directory is set to <code className="text-cyan-300 font-mono">dist</code>:
                    </p>
                    <pre className="mt-2 p-2.5 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 text-[11px] font-mono text-emerald-300">
{`frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'`}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#050508] p-3.5 rounded-xl border border-cyan-900/30">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-white font-mono text-xs">Save &amp; Deploy:</strong>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Click <strong>"Save and deploy"</strong>. Your application will be live across AWS's global edge network in under 2 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Docker & Container */}
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                    <Code2 className="w-3.5 h-3.5" />
                    Multi-Stage Production Dockerfile (Nginx)
                  </div>
                  <button
                    onClick={() => handleCopy('dockerfile', dockerfileSnippet)}
                    className="px-2.5 py-1 rounded bg-[#0a0a0f] hover:bg-slate-800 border border-cyan-900/40 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'dockerfile' ? 'Copied' : 'Copy Dockerfile'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 overflow-x-auto text-[11px] text-cyan-300 font-mono leading-relaxed">
                  {dockerfileSnippet}
                </pre>
              </div>

              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                    <Server className="w-3.5 h-3.5" />
                    nginx.conf (SPA Fallback + Gzip Caching)
                  </div>
                  <button
                    onClick={() => handleCopy('nginx', nginxConfigSnippet)}
                    className="px-2.5 py-1 rounded bg-[#0a0a0f] hover:bg-slate-800 border border-cyan-900/40 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'nginx' ? 'Copied' : 'Copy nginx.conf'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0a0f] rounded-lg border border-cyan-900/40 overflow-x-auto text-[11px] text-emerald-300 font-mono leading-relaxed">
                  {nginxConfigSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: Architecture & Privacy */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white font-mono text-xs">Zero Server Data Leakage</h5>
                  <p className="text-slate-400 text-[11px]">
                    100% of JSON parsing, ZIP decompression, and CSV compilation occurs inside the browser's JavaScript engine. Unreleased artwork and private rarity traits never touch external backend servers.
                  </p>
                </div>

                <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 w-fit">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white font-mono text-xs">Sub-Second Processing</h5>
                  <p className="text-slate-400 text-[11px]">
                    No network round-trips for batch uploads. Processes 10,000+ token collections and multi-megabyte files in seconds directly utilizing client CPU &amp; RAM.
                  </p>
                </div>

                <div className="bg-[#050508] p-4 rounded-xl border border-cyan-900/30 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 w-fit">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white font-mono text-xs">Zero Operating Cost</h5>
                  <p className="text-slate-400 text-[11px]">
                    Requires no active database (Postgres, MongoDB, Redis) or backend compute instances (EC2, ECS). Hosting is virtually free on AWS S3, CloudFront, or Vercel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#050508] border-t border-cyan-900/40 flex items-center justify-between font-mono">
          <div className="text-xs text-slate-400">
            Build command: <code className="text-cyan-300 font-bold bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-cyan-900/40">npm run build</code> &rarr; Output directory: <code className="text-emerald-300 font-bold bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-cyan-900/40">dist/</code>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

