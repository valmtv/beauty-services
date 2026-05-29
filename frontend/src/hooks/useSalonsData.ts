'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getSalons, getDistricts, Salon } from '../lib/api';

interface UseSalonsDataProps {
  onFilterChange?: () => void;
}

export function useSalonsData({ onFilterChange }: UseSalonsDataProps = {}) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // 1. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      onFilterChange?.();
    }, 350);

    return () => clearTimeout(handler);
  }, [search, onFilterChange]);

  // 2. Fetch distinct districts list on initial load
  useEffect(() => {
    getDistricts()
      .then(setDistricts)
      .catch((err) => {
        console.error('Failed to load districts list:', err);
        toast.error('Could not connect to beauty backend server.');
      });
  }, []);

  // 3. Load beauty salons matching primary text criteria
  useEffect(() => {
    let active = true;

    const fetchSalons = async () => {
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
          onFilterChange?.();
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

    fetchSalons();
    return () => {
      active = false;
    };
  }, [debouncedSearch, selectedDistrict, onFilterChange]);

  return {
    salons,
    setSalons,
    districts,
    isLoading,
    search,
    setSearch,
    selectedDistrict,
    setSelectedDistrict,
  };
}
