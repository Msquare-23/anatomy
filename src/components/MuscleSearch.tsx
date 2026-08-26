import React, { useState, useRef, useEffect } from 'react';
import { MuscleData } from '../types/anatomy';
import { Search, X, ChevronRight, Activity, MapPin } from 'lucide-react';

interface MuscleSearchProps {
  muscles: MuscleData[];
  onSelectMuscle: (muscle: MuscleData) => void;
  selectedMuscle: MuscleData | null;
}

export const MuscleSearch: React.FC<MuscleSearchProps> = ({
  muscles,
  onSelectMuscle,
  selectedMuscle,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter muscles matching search query across name, latinName, region, action, and object aliases
  const filtered = query.trim()
    ? muscles.filter((m) => {
        const q = query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.latinName && m.latinName.toLowerCase().includes(q)) ||
          m.region.toLowerCase().includes(q) ||
          m.layer.toLowerCase().includes(q) ||
          m.objectNames.some((alias) => alias.toLowerCase().includes(q)) ||
          (Array.isArray(m.action)
            ? m.action.some((a) => a.toLowerCase().includes(q))
            : m.action.toLowerCase().includes(q))
        );
      })
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (muscle: MuscleData) => {
    onSelectMuscle(muscle);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          id="muscle-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search muscle (e.g. Biceps brachii, Deltoid, Pectoralis)..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-800/90 text-slate-100 placeholder-slate-400 text-xs sm:text-sm border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-inner backdrop-blur-md"
        />
        {query && (
          <button
            id="clear-search-btn"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-0.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-xl z-50 py-1.5 divide-y divide-slate-800/60"
        >
          {filtered.length > 0 ? (
            filtered.map((muscle, idx) => {
              const isSelected = selectedMuscle?.id === muscle.id;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={muscle.id}
                  id={`search-item-${muscle.id}`}
                  onClick={() => handleSelect(muscle)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition group ${
                    isActive
                      ? 'bg-rose-600/20 text-rose-200'
                      : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-rose-300 transition">
                        {muscle.name}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Selected
                        </span>
                      )}
                    </div>
                    {muscle.latinName && (
                      <span className="text-[11px] text-slate-400 italic">
                        {muscle.latinName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-rose-400" />
                      {muscle.region}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              <Activity className="w-5 h-5 mx-auto mb-2 text-slate-500" />
              No anatomical structures found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SearchBar = MuscleSearch;
