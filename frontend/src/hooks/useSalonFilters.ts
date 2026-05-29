'use client';

import { useState } from 'react';
import { Salon } from '../lib/api';
import { MapBounds } from '../components/MapViewInner';

interface UseSalonFiltersProps {
  salons: Salon[];
}

export function useSalonFilters({ salons }: UseSalonFiltersProps) {
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyWithRatings, setOnlyWithRatings] = useState<boolean>(true);

  // Visible Map Bounds Sync
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isSearchAsMoveEnabled, setIsSearchAsMoveEnabled] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // 1. Compute filtered salons list locally
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

    // C. Filter by Map Viewport Bounds
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
  const totalPages = Math.ceil(visibleSalonsCount / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginatedSalons = filteredSalons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return {
    selectedPriceLevels,
    setSelectedPriceLevels,
    minRating,
    setMinRating,
    onlyWithRatings,
    setOnlyWithRatings,
    mapBounds,
    setMapBounds,
    isSearchAsMoveEnabled,
    setIsSearchAsMoveEnabled,
    page,
    setPage,
    pageSize,
    setPageSize,
    filteredSalons,
    paginatedSalons,
    visibleSalonsCount,
    totalPages,
    currentPage,
  };
}
