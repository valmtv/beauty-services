'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Salon } from '../lib/api';
import { MapBounds } from './MapViewInner';

// Loading skeleton for the map
const MapSkeleton = () => (
  <div className="w-full h-full min-h-[400px] md:min-h-0 relative shimmer-loader rounded-2xl border border-border-main bg-background-card flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
      <p className="text-xs text-text-second font-semibold tracking-wide">
        Loading interactive map...
      </p>
    </div>
  </div>
);

// Dynamic import to bypass Server Side Rendering for Leaflet Map
const DynamicMapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface MapViewProps {
  salons: Salon[];
  focusedSalon: Salon | null;
  onSelectSalon: (salon: Salon) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  theme?: 'light' | 'dark';
}

export default function MapView({
  salons,
  focusedSalon,
  onSelectSalon,
  onBoundsChange,
  theme,
}: MapViewProps) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-0">
      <DynamicMapViewInner
        salons={salons}
        focusedSalon={focusedSalon}
        onSelectSalon={onSelectSalon}
        onBoundsChange={onBoundsChange}
        theme={theme}
      />
    </div>
  );
}
