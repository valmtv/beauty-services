'use client';

import React, { useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Salon } from '../lib/api';

export interface MapBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

interface MapViewInnerProps {
  salons: Salon[];
  focusedSalon: Salon | null;
  onSelectSalon: (salon: Salon) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  theme?: 'light' | 'dark';
}

// Custom HTML/SVG DivIcon creator
const createCustomIcon = (isFocused: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        ${
          isFocused
            ? `<div class="absolute w-8 h-8 bg-indigo-505/30 rounded-full animate-ping"></div>
             <div class="absolute w-5 h-5 bg-indigo-500 border border-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 select-none cursor-pointer pulse-marker">
               <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`
            : `<div class="absolute w-4 h-4 bg-emerald-500 border border-emerald-300 hover:bg-indigo-500 hover:border-indigo-300 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20 select-none cursor-pointer transition-all duration-200">
               <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>`
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map controller to handle dynamic panning, zooming, and container size recalculations
function MapController({
  focusedSalon,
  salonsCount,
}: {
  focusedSalon: Salon | null;
  salonsCount: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusedSalon) {
      const lat = parseFloat(focusedSalon.lat);
      const lng = parseFloat(focusedSalon.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 15, {
          animate: true,
          duration: 1.2,
        });
      }
    }
  }, [focusedSalon, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, salonsCount]);

  return null;
}

// Component to listen to map viewport panning/zooming and report bounding box coordinates
function BoundsListener({ onBoundsChange }: { onBoundsChange: (bounds: MapBounds) => void }) {
  const map = useMap();

  const handleBoundsChange = useCallback(() => {
    const leafletBounds = map.getBounds();
    const northEast = leafletBounds.getNorthEast();
    const southWest = leafletBounds.getSouthWest();

    onBoundsChange({
      northEast: { lat: northEast.lat, lng: northEast.lng },
      southWest: { lat: southWest.lat, lng: southWest.lng },
    });
  }, [map, onBoundsChange]);

  useEffect(() => {
    // Initial fetch once map mounts
    handleBoundsChange();

    map.on('moveend', handleBoundsChange);
    map.on('zoomend', handleBoundsChange);

    return () => {
      map.off('moveend', handleBoundsChange);
      map.off('zoomend', handleBoundsChange);
    };
  }, [map, handleBoundsChange]);

  return null;
}

export default function MapViewInner({
  salons,
  focusedSalon,
  onSelectSalon,
  onBoundsChange,
  theme,
}: MapViewInnerProps) {
  // Center of Warsaw bounds
  const defaultCenter: [number, number] = [52.2297, 21.0122];
  const defaultZoom = 12;

  // Sync Map Tiles with active UI light/dark theme dynamically
  const tileUrl =
    theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-0 relative overflow-hidden rounded-2xl border border-border-main shadow-inner">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-10"
        zoomControl={true}
        attributionControl={false}
      >
        {/* sleeker CartoDB TileLayer mapped to theme */}
        <TileLayer url={tileUrl} subdomains="abcd" maxZoom={20} />

        <MapController focusedSalon={focusedSalon} salonsCount={salons.length} />
        <BoundsListener onBoundsChange={onBoundsChange} />

        {salons.map((salon) => {
          const lat = parseFloat(salon.lat);
          const lng = parseFloat(salon.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isFocused = focusedSalon?.id === salon.id;

          return (
            <Marker
              key={salon.id}
              position={[lat, lng]}
              icon={createCustomIcon(isFocused)}
              eventHandlers={{
                click: () => onSelectSalon(salon),
              }}
            >
              <Popup closeButton={false}>
                <div className="p-1 max-w-[180px] leading-tight select-none">
                  <h4 className="font-semibold text-xs text-text-main">{salon.name}</h4>
                  <p className="text-[10px] text-text-second mt-1">📍 {salon.district}</p>
                  {salon.rating && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-semibold">
                      ★ {parseFloat(salon.rating).toFixed(1)}
                      <span className="text-text-muted text-[9px]">({salon.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
