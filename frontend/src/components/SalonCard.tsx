'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Globe, Edit3, Navigation, DollarSign } from 'lucide-react';
import { Salon, SalonUpdateInput } from '../lib/api';
import SalonEditForm from './SalonEditForm';

interface SalonCardProps {
  salon: Salon;
  isExpanded: boolean;
  isFocused: boolean;
  onClick: () => void;
  onSave: (id: number, data: SalonUpdateInput) => Promise<void>;
  districts: string[];
}

export default function SalonCard({
  salon,
  isExpanded,
  isFocused,
  onClick,
  onSave,
  districts,
}: SalonCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveSuccess = async (id: number, data: SalonUpdateInput) => {
    await onSave(id, data);
    setIsEditing(false);
  };

  const getPriceSymbol = (level: number | null) => {
    if (!level) return 'N/A';
    return '$'.repeat(level);
  };

  const getPriceRangeLabel = (level: number | null) => {
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
        return 'Price unavailable';
    }
  };

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
        isFocused ? 'ring-1 ring-indigo-500 border-indigo-500/40 bg-background-card-hover' : ''
      }`}
    >
      {!isEditing ? (
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/25 px-2.5 py-0.5 rounded-full mb-1">
                📍 {salon.district}
              </span>
              <h3 className="font-semibold text-text-main text-base leading-snug group-hover:text-accent-indigo transition-colors duration-200">
                {salon.name}
              </h3>
            </div>

            {/* Rating Display */}
            {salon.rating && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs px-2 py-0.5 rounded-lg font-semibold shrink-0 select-none">
                ★ {parseFloat(salon.rating).toFixed(1)}
                <span className="text-[10px] text-text-muted font-normal">
                  ({salon.reviewCount || 0})
                </span>
              </div>
            )}
          </div>

          {/* Subtitle / Key Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-second select-none">
            <span className="flex items-center gap-1 text-text-second">
              <DollarSign className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
              <span className="text-text-main font-semibold text-accent-emerald">
                {getPriceSymbol(salon.priceLevel)}
              </span>
              <span className="text-text-muted text-[10px]">
                ({getPriceRangeLabel(salon.priceLevel)})
              </span>
            </span>
          </div>

          {/* EXPANDED CONTENT VIEW */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border-main flex flex-col gap-4 animate-fadeIn">
              {/* Detailed specs */}
              <div className="flex flex-col gap-2.5 text-xs text-text-second leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                  <span>{salon.address}</span>
                </div>

                {salon.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-text-muted shrink-0" />
                    <a
                      href={`tel:${salon.phone}`}
                      className="hover:text-accent-indigo transition-colors"
                    >
                      {salon.phone}
                    </a>
                  </div>
                )}

                {salon.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-text-muted shrink-0" />
                    <a
                      href={
                        salon.website.startsWith('http')
                          ? salon.website
                          : `https://${salon.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent-indigo transition-all duration-200 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Visit Website / Socials
                    </a>
                  </div>
                )}
              </div>

              {/* Service Badges */}
              {salon.services && salon.services.length > 0 && (
                <div className="flex flex-col gap-1.5 select-none">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Services Offered:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {salon.services.map((service, index) => (
                      <span
                        key={index}
                        className="text-[10px] bg-background-app text-text-second border border-border-main px-2.5 py-0.5 rounded-lg font-medium hover:bg-background-card hover:text-text-main transition-all duration-200"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2.5 mt-2 select-none">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 text-xs bg-background-app text-text-main hover:bg-background-card hover:border-text-muted transition-all duration-200 py-2 px-3.5 rounded-xl border border-border-main font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit details
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-accent-indigo text-white hover:bg-indigo-600 transition-colors py-2 px-3.5 rounded-xl font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <SalonEditForm
          salon={salon}
          onCancel={handleCancelClick}
          onSave={handleSaveSuccess}
          districts={districts}
        />
      )}
    </div>
  );
}
