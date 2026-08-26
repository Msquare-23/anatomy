import React from 'react';
import { MuscleRegion } from '../types/anatomy';
import { ANATOMICAL_REGIONS } from '../data/regions';
import { ChevronRight, Sparkles } from 'lucide-react';

interface RegionNavProps {
  selectedRegion: MuscleRegion | 'ALL';
  onSelectRegion: (region: MuscleRegion | 'ALL') => void;
}

export const RegionNav: React.FC<RegionNavProps> = ({
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <div className="w-full flex flex-col gap-1 overflow-x-auto pb-1 scrollbar-thin">
      <div className="flex lg:flex-col gap-1.5 min-w-max lg:min-w-0">
        <button
          id="region-nav-all"
          onClick={() => onSelectRegion('ALL')}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            selectedRegion === 'ALL'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Anatomical Regions</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 hidden lg:block opacity-60" />
        </button>

        {ANATOMICAL_REGIONS.map((region) => {
          const isActive = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              id={`region-nav-${region.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectRegion(region.id)}
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md font-semibold'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{region.name}</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-rose-700/80 text-rose-100' : 'bg-slate-700/60 text-slate-400'
                }`}
              >
                {region.muscleCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
