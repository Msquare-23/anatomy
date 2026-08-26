import React, { useRef, useState } from 'react';
import { Layers, Upload, FileCode, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ModelPreparationNoticeProps {
  onLoadCustomModel?: (file: File) => void;
  onRetryLoad?: () => void;
  isLoading?: boolean;
  loadProgress?: number;
}

export const ModelPreparationNotice: React.FC<ModelPreparationNoticeProps> = ({
  onLoadCustomModel,
  onRetryLoad,
  isLoading = false,
  loadProgress = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        onLoadCustomModel?.(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        onLoadCustomModel?.(file);
      }
    }
  };

  return (
    <div
      id="model-preparation-container"
      className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 overflow-y-auto"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fadeIn">
        {/* Animated Badge / Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
          {isLoading ? (
            <RefreshCw className="w-8 h-8 animate-spin text-rose-400" />
          ) : (
            <Layers className="w-8 h-8 text-rose-500" />
          )}
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            3D muscular model is being prepared
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The application is configured to load the real Z-Anatomy muscular system 3D asset from{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-rose-300 text-xs border border-slate-700">
              public/models/muscular.glb
            </code>
            .
          </p>
        </div>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Loading 3D asset...</span>
              <span>{loadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(loadProgress, 5)}%` }}
              />
            </div>
          </div>
        )}

        {/* Instructions Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <FileCode className="w-4 h-4 text-rose-400" />
            <span>Asset Integration Instructions</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-normal pl-1">
            <li>
              Place your anatomical GLB file at{' '}
              <strong className="text-slate-200">public/models/muscular.glb</strong>.
            </li>
            <li>DRACO compression and uncompressed GLB files are automatically supported.</li>
            <li>All individual mesh names are mapped to the anatomy database at runtime.</li>
          </ol>
        </div>

        {/* Actions: Direct Local Upload or Retry */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            id="btn-upload-local-glb"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg hover:shadow-rose-600/30 transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Load GLB from Computer</span>
          </button>

          {onRetryLoad && (
            <button
              id="btn-retry-load-model"
              onClick={onRetryLoad}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Load</span>
            </button>
          )}
        </div>

        {dragOver && (
          <div className="p-3 rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-300 text-xs font-medium animate-pulse">
            Drop your muscular.glb file here to view immediately
          </div>
        )}
      </div>
    </div>
  );
};
