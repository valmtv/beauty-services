'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { SlidersHorizontal, Map, Sun, Moon } from 'lucide-react';
import { getSalons, getDistricts, updateSalon, Salon, SalonUpdateInput } from '../lib/api';
import Filters from '../components/Filters';
import MapView from '../components/MapView';
import SalonCard from '../components/SalonCard';
import { MapBounds } from '../components/MapViewInner';

// Shimmer skeletons during listing loads
const ListSkeleton = () => (
  <div className="flex flex-col gap-3.5 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="shimmer-loader h-[106px] w-full rounded-2xl border border-border-main bg-background-card/50"
      ></div>
    ))}
  </div>
);

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Light/Dark Theme Engine initializer
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [salons, setSalons] = useState<Salon[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Core Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyWithRatings, setOnlyWithRatings] = useState<boolean>(true);

  // Visible Map Bounds Sync
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isSearchAsMoveEnabled, setIsSearchAsMoveEnabled] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Sync state between Map and List
  const [focusedSalon, setFocusedSalon] = useState<Salon | null>(null);
  const [expandedSalonId, setExpandedSalonId] = useState<number | null>(null);

  // View state for mobile screens (Toggle list vs map)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  const listContainerRef = useRef<HTMLDivElement>(null);

  // 1. Debounce Search Input to optimize API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset pagination on query filter modifications
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // 2. Fetch distinct districts list on initial load
  useEffect(() => {
    getDistricts()
      .then(setDistricts)
      .catch((err) => {
        console.error('Failed to load districts list:', err);
        toast.error('Could not connect to beauty backend server.');
      });
  }, []);

  // 3. Load beauty Salons from API matching primary text criteria
  useEffect(() => {
    let active = true;

    const fetch = async () => {
      await Promise.resolve(); // Defer to prevent cascading sync effects
      if (!active) return;
      setIsLoading(true);
      try {
        const response = await getSalons({
          search: debouncedSearch.trim() || undefined,
          district: selectedDistrict || undefined,
          page: 1,
          limit: 200, // Fetch up to 200 matching to support map bounds sync locally
        });
        if (active) {
          setSalons(response.data);
          setPage(1); // Reset local list pagination on base loads
        }
      } catch (err) {
        console.error('Failed to load beauty salons:', err);
        if (active) {
          toast.error('Failed to retrieve beauty salons. Check server connection.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, [debouncedSearch, selectedDistrict]);

  // 4. Compute filtered salons list locally based on price, rating, and map boundaries bounds
  const filteredSalons = salons.filter((salon) => {
    // A. Filter by Price Level
    if (selectedPriceLevels.length > 0) {
      if (!salon.priceLevel || !selectedPriceLevels.includes(salon.priceLevel)) {
        return false;
      }
    }

    // B. Filter by Min Rating
    if (onlyWithRatings) {
      if (!salon.rating || parseFloat(salon.rating) === 0) {
        return false;
      }
    }
    if (minRating > 0) {
      if (!salon.rating || parseFloat(salon.rating) < minRating) {
        return false;
      }
    }

    // C. Filter by Map Viewport Bounds (Booking/Airbnb style)
    if (mapBounds && isSearchAsMoveEnabled) {
      const lat = parseFloat(salon.lat);
      const lng = parseFloat(salon.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const inBounds =
          lat >= mapBounds.southWest.lat &&
          lat <= mapBounds.northEast.lat &&
          lng >= mapBounds.southWest.lng &&
          lng <= mapBounds.northEast.lng;
        if (!inBounds) return false;
      }
    }

    return true;
  });

  // Calculate visibility stats and local paginations
  const visibleSalonsCount = filteredSalons.length;
  const localTotalPages = Math.ceil(visibleSalonsCount / pageSize) || 1;
  const currentPage = Math.min(page, localTotalPages);

  const paginatedSalons = filteredSalons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Handle in-card salon updates
  const handleSaveSalon = async (id: number, data: SalonUpdateInput) => {
    try {
      const updated = await updateSalon(id, data);

      // Update local state smoothly
      setSalons((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (focusedSalon?.id === id) {
        setFocusedSalon(updated);
      }

      toast.success(`${updated.name} updated successfully!`, {
        description: 'Changes persisted in the Warsaw marketplace database.',
        duration: 3500,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to persist salon changes.';
      console.error(`Failed to patch salon ID ${id}:`, err);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Bidirectional link: Select salon in card list -> focus map pin
  const handleCardClick = (salon: Salon) => {
    if (expandedSalonId === salon.id) {
      setExpandedSalonId(null);
      setFocusedSalon(null);
    } else {
      setExpandedSalonId(salon.id);
      setFocusedSalon(salon);
    }
  };

  // Bidirectional link: Click pin marker on map -> select and scroll card list
  const handleMapSelectSalon = (salon: Salon) => {
    setFocusedSalon(salon);
    setExpandedSalonId(salon.id);

    // Smooth scroll list item into viewport (desktop only)
    setTimeout(() => {
      const cardElement = document.getElementById(`salon-card-${salon.id}`);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 120);

    // Switch view toggle on mobile layouts
    if (activeTab === 'map') {
      setActiveTab('list');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDistrict('');
    setSelectedPriceLevels([]);
    setMinRating(0);
    setOnlyWithRatings(true);
    setPage(1);
    setFocusedSalon(null);
    setExpandedSalonId(null);
    toast.info('Explorer search parameters reset.');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-app text-text-main font-sans select-none">
      {/* Header Navigation */}
      <header className="shrink-0 glass-panel border-b border-border-main py-3 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-text-main leading-none">
              Warsaw Beauty Salon Explorer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold select-none">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl glass-panel hover:bg-background-card-hover text-text-second hover:text-accent-indigo transition-all duration-200 cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 animate-fadeIn" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-indigo-600 animate-fadeIn" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left Side: Filter, Card list, Pagination */}
        <section
          className={`w-full md:w-[460px] lg:w-[500px] flex flex-col shrink-0 overflow-hidden border-r border-border-main bg-background-app ${
            activeTab === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Scrollable controls panel */}
          <div className="p-4 shrink-0 flex flex-col gap-3">
            <Filters
              search={search}
              setSearch={setSearch}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedPriceLevels={selectedPriceLevels}
              setSelectedPriceLevels={setSelectedPriceLevels}
              minRating={minRating}
              setMinRating={setMinRating}
              onlyWithRatings={onlyWithRatings}
              setOnlyWithRatings={setOnlyWithRatings}
              districts={districts}
              totalSalons={salons.length}
              visibleSalons={visibleSalonsCount}
              onReset={handleResetFilters}
            />

            {/* Airbnb/Booking-style map synchronization toggle */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center justify-between border border-border-main text-xs shadow-sm">
              <span className="font-semibold text-text-second">Map Boundaries Sync</span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSearchAsMoveEnabled}
                  onChange={(e) => {
                    setIsSearchAsMoveEnabled(e.target.checked);
                    setPage(1); // Reset page on bounds toggles
                  }}
                  className="w-4 h-4 text-indigo-600 bg-background-app border-border-main rounded focus:ring-indigo-500 focus:ring-1 cursor-pointer transition-all duration-150"
                />
                <span className="font-bold text-text-main">Search as I move map</span>
              </label>
            </div>
          </div>

          {/* Cards Scroll list panel */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3.5"
          >
            {isLoading ? (
              <ListSkeleton />
            ) : paginatedSalons.length > 0 ? (
              paginatedSalons.map((salon) => (
                <div
                  key={salon.id}
                  id={`salon-card-${salon.id}`}
                  className="transition-all duration-300"
                >
                  <SalonCard
                    key={`${salon.id}-${salon.updatedAt}`}
                    salon={salon}
                    isExpanded={expandedSalonId === salon.id}
                    isFocused={focusedSalon?.id === salon.id}
                    onClick={() => handleCardClick(salon)}
                    onSave={handleSaveSalon}
                    districts={districts.length > 0 ? districts : [salon.district]}
                  />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs">
                <SlidersHorizontal className="w-9 h-9 text-text-muted mb-3" />
                <h4 className="font-semibold text-text-second text-sm">No beauty salons visible</h4>
                <p className="text-text-muted mt-1 max-w-[240px]">
                  {isSearchAsMoveEnabled
                    ? 'Pan or zoom map back to visible locations, or uncheck "Search as I move map".'
                    : 'Try refining search terms or district options.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-xs font-bold text-accent-indigo hover:underline cursor-pointer"
                >
                  Reset active filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination & Page Size controls */}
          {!isLoading && visibleSalonsCount > 0 && (
            <div className="shrink-0 glass-panel border-t border-border-main p-4 flex items-center justify-between gap-4 select-none">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-text-muted">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1); // Reset page on limit changes
                  }}
                  className="bg-background-app text-[11px] font-bold border border-border-main rounded-lg px-2.5 py-1 focus:outline-none text-text-main cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {localTotalPages > 1 ? (
                <div className="flex items-center gap-3.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-semibold text-text-second hover:text-text-main px-3 py-1.5 rounded-lg border border-border-main bg-background-app hover:bg-background-card-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors"
                  >
                    Prev
                  </button>

                  <span className="text-[11px] font-semibold text-text-muted select-none">
                    Page <span className="text-text-main font-bold">{currentPage}</span> of{' '}
                    <span className="text-text-main font-bold">{localTotalPages}</span>
                  </span>

                  <button
                    disabled={currentPage === localTotalPages}
                    onClick={() => setPage((p) => Math.min(localTotalPages, p + 1))}
                    className="text-xs font-semibold text-text-second hover:text-text-main px-3 py-1.5 rounded-lg border border-border-main bg-background-app hover:bg-background-card-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-text-muted select-none">
                  All salons shown
                </span>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Leaflet Interactive Map */}
        <section
          className={`flex-1 h-full relative ${activeTab === 'map' ? 'flex' : 'hidden md:flex'}`}
        >
          <MapView
            salons={filteredSalons}
            focusedSalon={focusedSalon}
            onSelectSalon={handleMapSelectSalon}
            onBoundsChange={setMapBounds}
            theme={theme}
          />
        </section>

        {/* Dynamic Mobile View navigation tabs (fixed footer) */}
        <div className="md:hidden shrink-0 h-14 bg-background-card border-t border-border-main grid grid-cols-2 z-20 select-none">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'list' ? 'text-accent-indigo' : 'text-text-muted hover:text-text-second'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Salons
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'map' ? 'text-accent-indigo' : 'text-text-muted hover:text-text-second'
            }`}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
        </div>
      </main>
    </div>
  );
}
