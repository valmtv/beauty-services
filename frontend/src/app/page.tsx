'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { SlidersHorizontal, Map } from 'lucide-react';
import { updateSalon, Salon, SalonUpdateInput } from '../lib/api';

// Extracted Hooks
import { useTheme } from '../hooks/useTheme';
import { useSalonsData } from '../hooks/useSalonsData';
import { useSalonFilters } from '../hooks/useSalonFilters';

// Extracted Subcomponents
import Header from '../components/Header';
import Filters from '../components/Filters';
import MapView from '../components/MapView';
import SalonCard from '../components/SalonCard';
import ListSkeleton from '../components/ListSkeleton';
import Pagination from '../components/Pagination';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const {
    salons,
    setSalons,
    districts,
    isLoading,
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
  } = useSalonsData();

  const filters = useSalonFilters({ salons });
  const { setPage, isSearchAsMoveEnabled } = filters;

  // Sync state between Map and List
  const [focusedSalon, setFocusedSalon] = useState<Salon | null>(null);
  const [expandedSalonId, setExpandedSalonId] = useState<number | null>(null);

  // View state for mobile screens (Toggle list vs map)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  const listContainerRef = useRef<HTMLDivElement>(null);

  // Reset pagination page on search criteria modifications
  useEffect(() => {
    setPage(1);
  }, [search, selectedDistrict, isSearchAsMoveEnabled, setPage]);

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
    filters.setSelectedPriceLevels([]);
    filters.setMinRating(0);
    filters.setOnlyWithRatings(true);
    filters.setPage(1);
    setFocusedSalon(null);
    setExpandedSalonId(null);
    toast.info('Explorer search parameters reset.');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-app text-text-main font-sans select-none">
      <Header theme={theme} toggleTheme={toggleTheme} />

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
              selectedPriceLevels={filters.selectedPriceLevels}
              setSelectedPriceLevels={filters.setSelectedPriceLevels}
              minRating={filters.minRating}
              setMinRating={filters.setMinRating}
              onlyWithRatings={filters.onlyWithRatings}
              setOnlyWithRatings={filters.setOnlyWithRatings}
              districts={districts}
              totalSalons={salons.length}
              visibleSalons={filters.visibleSalonsCount}
              onReset={handleResetFilters}
            />

            {/* Airbnb/Booking-style map synchronization toggle */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center justify-between border border-border-main text-xs shadow-sm">
              <span className="font-semibold text-text-second">Map Boundaries Sync</span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.isSearchAsMoveEnabled}
                  onChange={(e) => {
                    filters.setIsSearchAsMoveEnabled(e.target.checked);
                    filters.setPage(1);
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
            ) : filters.paginatedSalons.length > 0 ? (
              filters.paginatedSalons.map((salon) => (
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
                  {filters.isSearchAsMoveEnabled
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
          {!isLoading && filters.visibleSalonsCount > 0 && (
            <Pagination
              setPage={filters.setPage}
              pageSize={filters.pageSize}
              setPageSize={filters.setPageSize}
              totalPages={filters.totalPages}
              currentPage={filters.currentPage}
            />
          )}
        </section>

        {/* Right Side: Leaflet Interactive Map */}
        <section
          className={`flex-1 h-full relative ${activeTab === 'map' ? 'flex' : 'hidden md:flex'}`}
        >
          <MapView
            salons={filters.filteredSalons}
            focusedSalon={focusedSalon}
            onSelectSalon={handleMapSelectSalon}
            onBoundsChange={filters.setMapBounds}
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
