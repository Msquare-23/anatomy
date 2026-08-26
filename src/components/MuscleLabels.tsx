import React from 'react';
import { MuscleData } from '../types/anatomy';

export interface LabelProjectionItem {
  muscle: MuscleData;
  x: number;
  y: number;
  visible: boolean;
  isSelected: boolean;
}

interface MuscleLabelsProps {
  labels: LabelProjectionItem[];
  onSelectMuscle: (muscle: MuscleData) => void;
}

export const MuscleLabels: React.FC<MuscleLabelsProps> = ({ labels, onSelectMuscle }) => {
  if (labels.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {labels.map((lbl) => (
        <button
          key={lbl.muscle.id}
          id={`3d-label-${lbl.muscle.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectMuscle(lbl.muscle);
          }}
          className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 ${
            lbl.isSelected
              ? 'scale-110 ring-2 ring-rose-500 bg-rose-950/90 text-rose-100 border-rose-400'
              : 'hover:scale-105 bg-slate-900/85 hover:bg-slate-800/95 text-slate-200 border-slate-700/80 hover:border-rose-400'
          } px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight shadow-xl border backdrop-blur-md flex items-center gap-1.5`}
          style={{ left: `${lbl.x}px`, top: `${lbl.y}px` }}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              lbl.isSelected ? 'bg-rose-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="whitespace-nowrap">{lbl.muscle.name}</span>
        </button>
      ))}
    </div>
  );
};
