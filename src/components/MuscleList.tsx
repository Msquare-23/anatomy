import React, { useState, useMemo } from 'react';
import { MuscleData, MuscleRegion, AnatomyLayer } from '../types/anatomy';
import { Search, ChevronRight, Filter, Layers, MapPin } from 'lucide-react';

interface MuscleListProps {
  muscles: MuscleData[];
  selectedRegion: MuscleRegion | 'ALL';
  selectedMuscle: MuscleData | null;
  onSelectMuscle: (muscle: MuscleData) => void;
}

export const MuscleList: React.FC<MuscleListProps> = ({
  muscles,
  selectedRegion,
  selectedMuscle,
  onSelectMuscle,
}) => {
  const [filterLayer, setFilterLayer] = useState<AnatomyLayer | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMuscles = useMemo(() => {
    return muscles.filter((m) => {
      const matchRegion = selectedRegion === 'ALL' || m.region === selectedRegion;
      const matchLayer = filterLayer === 'ALL' || m.layer === filterLayer;
      const matchSearch =
        searchTerm.trim() === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.latinName && m.latinName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchRegion && matchLayer && matchSearch;
    });
  }, [muscles, selectedRegion, filterLayer, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search & Layer Filters */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-slate-100">
              {selectedRegion === 'ALL' ? 'All Muscles' : `${selectedRegion} Muscles`}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {filteredMuscles.length} found
          </span>
        </div>

        {/* Search input inside list */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter list..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 text-xs text-slate-200 placeholder-slate-400 border border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Layer filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          <button
            onClick={() => setFilterLayer('ALL')}
            className={`px-2 py-1 rounded-md transition font-medium whitespace-nowrap ${
              filterLayer === 'ALL'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setFilterLayer('Superficial muscles')}
            className={`px-2 py-1 rounded-md transition font-medium whitespace-nowrap ${
              filterLayer === 'Superficial muscles'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Superficial
          </button>
          <button
            onClick={() => setFilterLayer('Intermediate muscles')}
            className={`px-2 py-1 rounded-md transition font-medium whitespace-nowrap ${
              filterLayer === 'Intermediate muscles'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setFilterLayer('Deep muscles')}
            className={`px-2 py-1 rounded-md transition font-medium whitespace-nowrap ${
              filterLayer === 'Deep muscles'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Deep
          </button>
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
        {filteredMuscles.length > 0 ? (
          filteredMuscles.map((muscle) => {
            const isSelected = selectedMuscle?.id === muscle.id;
            return (
              <button
                key={muscle.id}
                id={`muscle-list-item-${muscle.id}`}
                onClick={() => onSelectMuscle(muscle)}
                className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs truncate">
                      {muscle.name}
                    </span>
                  </div>
                  {muscle.latinName && (
                    <p
                      className={`text-[11px] italic truncate font-serif ${
                        isSelected ? 'text-rose-100' : 'text-slate-400'
                      }`}
                    >
                      {muscle.latinName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-rose-700/80 text-rose-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {muscle.region}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No muscles matching selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
