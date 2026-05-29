import { useState } from 'react';
import { Search, MapPin, X, RotateCcw, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (value: string) => void;
  selectedPriceLevels: number[];
  setSelectedPriceLevels: (levels: number[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  onlyWithRatings: boolean;
  setOnlyWithRatings: (value: boolean) => void;
  districts: string[];
  totalSalons: number;
  visibleSalons: number;
  onReset: () => void;
}

export default function Filters({
  search,
  setSearch,
  selectedDistrict,
  setSelectedDistrict,
  selectedPriceLevels,
  setSelectedPriceLevels,
  minRating,
  setMinRating,
  onlyWithRatings,
  setOnlyWithRatings,
  districts,
  totalSalons,
  visibleSalons,
  onReset,
}: FiltersProps) {
  const activeCount =
    (search ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
    (selectedPriceLevels.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (!onlyWithRatings ? 1 : 0);

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const togglePriceLevel = (level: number) => {
    if (selectedPriceLevels.includes(level)) {
      setSelectedPriceLevels(selectedPriceLevels.filter((l) => l !== level));
    } else {
      setSelectedPriceLevels([...selectedPriceLevels, level]);
    }
  };

  const getPriceRangeLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'under 80 zł';
      case 2:
        return '80–200 zł';
      case 3:
        return '200–400 zł';
      case 4:
        return '400+ zł';
      default:
        return '';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3.5 shadow-md transition-all duration-300">
      {/* Header (collapsible) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer group select-none"
      >
        <div>
          <h2 className="text-sm md:text-base font-extrabold tracking-tight text-text-main flex items-center gap-2 group-hover:text-accent-indigo transition-colors">
            Explore Salons
            <span className="text-[10px] font-semibold text-text-muted bg-background-app px-2 py-0.5 rounded-full border border-border-main shrink-0">
              {visibleSalons === totalSalons ? `${totalSalons}` : `${visibleSalons}/${totalSalons}`}{' '}
              visible
            </span>
          </h2>
          <p className="text-[11px] text-text-second mt-0.5">
            Filter the best beauty spaces in Warsaw
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="flex items-center gap-1 text-[10px] text-accent-indigo hover:text-white transition-all duration-200 bg-accent-indigo/10 hover:bg-accent-indigo px-2 py-1 rounded-lg border border-accent-indigo/25 cursor-pointer font-bold"
              title="Reset all filters"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </button>
          )}
          <div className="w-7 h-7 rounded-lg border border-border-main bg-background-app hover:bg-background-card flex items-center justify-center text-text-second transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Conditionally rendered Filters fields */}
      {isExpanded && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          {/* Name / Service Search & District Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name / Service Search */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-accent-indigo transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="e.g. Nail, Haircut, Salon..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background-app text-xs pl-9 pr-8 py-2 rounded-xl border border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20 focus:outline-none placeholder-text-muted text-text-main transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* District Selector */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                District
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-accent-emerald transition-colors duration-200" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-background-app text-xs pl-9 pr-4 py-2 rounded-xl border border-border-main focus:border-accent-emerald/60 focus:ring-1 focus:ring-accent-emerald/20 focus:outline-none text-text-main appearance-none cursor-pointer transition-all duration-200"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                  <svg
                    className="fill-current h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Price Levels & Ratings Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Price Range Buttons */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Price Range
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const isActive = selectedPriceLevels.includes(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => togglePriceLevel(level)}
                      title={getPriceRangeLabel(level)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer text-center ${
                        isActive
                          ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald font-bold'
                          : 'bg-background-app border-border-main text-text-second hover:border-text-muted'
                      }`}
                    >
                      {'$'.repeat(level)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min Rating Filter */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Minimum Rating
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-amber-500 transition-colors duration-200" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full bg-background-app text-xs pl-9 pr-4 py-2 rounded-xl border border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20 focus:outline-none text-text-main appearance-none cursor-pointer transition-all duration-200"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4.0}>★ 4.0+ Stars</option>
                  <option value={4.5}>★ 4.5+ Stars</option>
                  <option value={4.8}>★ 4.8+ Stars</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                  <svg
                    className="fill-current h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings present checkbox */}
          <div className="flex items-center gap-2 select-none border-t border-border-main/20 pt-2.5 mt-0.5">
            <input
              type="checkbox"
              id="onlyWithRatings"
              checked={onlyWithRatings}
              onChange={(e) => setOnlyWithRatings(e.target.checked)}
              className="w-3.5 h-3.5 text-accent-indigo bg-background-app border-border-main rounded focus:ring-accent-indigo/20 focus:ring-1 cursor-pointer transition-all duration-150"
            />
            <label
              htmlFor="onlyWithRatings"
              className="text-[11px] font-semibold text-text-second hover:text-text-main cursor-pointer select-none"
            >
              Show only salons with ratings & reviews present
            </label>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border-main/30">
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
            Active:
          </span>
          {search && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 px-2 py-0.5 rounded-full font-medium">
              &quot;{search}&quot;
              <X
                className="w-2.5 h-2.5 cursor-pointer hover:text-text-main"
                onClick={() => setSearch('')}
              />
            </span>
          )}
          {selectedDistrict && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 px-2 py-0.5 rounded-full font-medium">
              📍 {selectedDistrict}
              <X
                className="w-2.5 h-2.5 cursor-pointer hover:text-text-main"
                onClick={() => setSelectedDistrict('')}
              />
            </span>
          )}
          {selectedPriceLevels.map((level) => (
            <span
              key={level}
              className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium"
            >
              💰 {'$'.repeat(level)}
              <X
                className="w-2.5 h-2.5 cursor-pointer hover:text-text-main"
                onClick={() => togglePriceLevel(level)}
              />
            </span>
          ))}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
              ★ {minRating}+
              <X
                className="w-2.5 h-2.5 cursor-pointer hover:text-text-main"
                onClick={() => setMinRating(0)}
              />
            </span>
          )}
          {!onlyWithRatings && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
              Unrated
              <X
                className="w-2.5 h-2.5 cursor-pointer hover:text-text-main"
                onClick={() => setOnlyWithRatings(true)}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
