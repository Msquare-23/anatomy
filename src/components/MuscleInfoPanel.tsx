import React from 'react';
import { MuscleData } from '../types/anatomy';
import {
  X,
  Target,
  Eye,
  EyeOff,
  Zap,
  Heart,
  BookOpen,
  Anchor,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  MapPin,
} from 'lucide-react';

interface MuscleInfoPanelProps {
  muscle: MuscleData | null;
  onClose: () => void;
  isIsolated: boolean;
  onToggleIsolate: () => void;
  onNextMuscle?: () => void;
  onPrevMuscle?: () => void;
  onFocusMuscle?: () => void;
}

export const MuscleInfoPanel: React.FC<MuscleInfoPanelProps> = ({
  muscle,
  onClose,
  isIsolated,
  onToggleIsolate,
  onNextMuscle,
  onPrevMuscle,
  onFocusMuscle,
}) => {
  if (!muscle) return null;

  return (
    <div
      id="muscle-info-panel"
      className="w-full lg:w-96 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 z-30 max-h-[85vh] lg:max-h-full"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {muscle.region}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {muscle.layer}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug break-words">
              {muscle.name}
            </h2>
            {muscle.latinName && (
              <p className="text-xs text-sky-400 italic mt-0.5 font-serif">
                {muscle.latinName}
              </p>
            )}
          </div>
          <button
            id="close-muscle-info-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/60">
          <button
            id="panel-btn-isolate"
            onClick={onToggleIsolate}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm ${
              isIsolated
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isIsolated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isIsolated ? 'Show All' : 'Isolate Muscle'}</span>
          </button>

          {onFocusMuscle && (
            <button
              id="panel-btn-focus"
              onClick={onFocusMuscle}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Focus 3D Camera"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Center</span>
            </button>
          )}

          {onPrevMuscle && onNextMuscle && (
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5">
              <button
                id="panel-prev-muscle"
                onClick={onPrevMuscle}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-700 transition"
                title="Previous Muscle"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                id="panel-next-muscle"
                onClick={onNextMuscle}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-700 transition"
                title="Next Muscle"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Structured Medical Data Body */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-300 divide-y divide-slate-800/80">
        {/* Description / Summary */}
        {muscle.description && (
          <div className="pb-3 text-slate-300 leading-relaxed">
            {muscle.description}
          </div>
        )}

        {/* Origin */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            <Anchor className="w-3.5 h-3.5" />
            <span>Origin (Proximal Attachment)</span>
          </div>
          <div className="pl-5 text-slate-200">
            {Array.isArray(muscle.origin) ? (
              <ul className="list-disc space-y-1">
                {muscle.origin.map((orig, i) => (
                  <li key={i}>{orig}</li>
                ))}
              </ul>
            ) : (
              <p>{muscle.origin}</p>
            )}
          </div>
        </div>

        {/* Insertion */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            <Target className="w-3.5 h-3.5" />
            <span>Insertion (Distal Attachment)</span>
          </div>
          <div className="pl-5 text-slate-200">
            {Array.isArray(muscle.insertion) ? (
              <ul className="list-disc space-y-1">
                {muscle.insertion.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            ) : (
              <p>{muscle.insertion}</p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>Actions & Biomechanics</span>
          </div>
          <div className="pl-5 text-slate-200">
            {Array.isArray(muscle.action) ? (
              <ul className="list-disc space-y-1">
                {muscle.action.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            ) : (
              <p>{muscle.action}</p>
            )}
          </div>
        </div>

        {/* Innervation */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Innervation</span>
          </div>
          <div className="pl-5 text-slate-200">
            {Array.isArray(muscle.innervation) ? (
              <ul className="list-disc space-y-1">
                {muscle.innervation.map((inn, i) => (
                  <li key={i}>{inn}</li>
                ))}
              </ul>
            ) : (
              <p>{muscle.innervation}</p>
            )}
          </div>
        </div>

        {/* Blood Supply */}
        {muscle.bloodSupply && (
          <div className="pt-3">
            <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              <Heart className="w-3.5 h-3.5" />
              <span>Blood Supply</span>
            </div>
            <div className="pl-5 text-slate-200">
              {Array.isArray(muscle.bloodSupply) ? (
                <ul className="list-disc space-y-1">
                  {muscle.bloodSupply.map((bs, i) => (
                    <li key={i}>{bs}</li>
                  ))}
                </ul>
              ) : (
                <p>{muscle.bloodSupply}</p>
              )}
            </div>
          </div>
        )}

        {/* Clinical Notes */}
        {muscle.notes && (
          <div className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Clinical & Anatomical Notes</span>
            </div>
            <p className="pl-5 text-slate-300 leading-relaxed italic bg-slate-950/30 p-2.5 rounded-xl border border-slate-800">
              {muscle.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
