'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Globe,
  Edit3,
  X,
  Navigation,
  DollarSign,
  Plus,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Salon, SalonUpdateInput } from '../lib/api';

interface SalonCardProps {
  salon: Salon;
  isExpanded: boolean;
  isFocused: boolean;
  onClick: () => void;
  onSave: (id: number, data: SalonUpdateInput) => Promise<void>;
  districts: string[];
}

// Simple URL structure regex
const WEBSITE_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
// Phone format selector (allows digits, spaces, plus, parentheses, and dashes)
const PHONE_REGEX = /^[\d\s\-\+\(\)]*$/;

export default function SalonCard({
  salon,
  isExpanded,
  isFocused,
  onClick,
  onSave,
  districts,
}: SalonCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editName, setEditName] = useState(salon.name);
  const [editDistrict, setEditDistrict] = useState(salon.district);
  const [editPhone, setEditPhone] = useState(salon.phone || '');
  const [editWebsite, setEditWebsite] = useState(salon.website || '');
  const [editPriceLevel, setEditPriceLevel] = useState(salon.priceLevel || 2);
  const [editServices, setEditServices] = useState<string[]>(salon.services || []);
  const [newServiceText, setNewServiceText] = useState('');

  // Real-time Validation Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [websiteError, setWebsiteError] = useState('');

  // Validate fields in real-time
  useEffect(() => {
    if (!editName.trim()) {
      setNameError('Salon name is required.');
    } else {
      setNameError('');
    }

    if (editPhone && !PHONE_REGEX.test(editPhone)) {
      setPhoneError('Please enter a valid phone format.');
    } else {
      setPhoneError('');
    }

    if (editWebsite && !WEBSITE_REGEX.test(editWebsite)) {
      setWebsiteError('Please enter a valid website domain / URL (e.g. booksy.com).');
    } else {
      setWebsiteError('');
    }
  }, [editName, editPhone, editWebsite]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    // Reset inputs
    setEditName(salon.name);
    setEditDistrict(salon.district);
    setEditPhone(salon.phone || '');
    setEditWebsite(salon.website || '');
    setEditPriceLevel(salon.priceLevel || 2);
    setEditServices(salon.services || []);
    setNameError('');
    setPhoneError('');
    setWebsiteError('');
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nameError || phoneError || websiteError) return;

    setIsSaving(true);
    try {
      // Clean up inputs prior to transmission
      let websiteFormatted = editWebsite.trim();
      if (websiteFormatted && !websiteFormatted.startsWith('http')) {
        websiteFormatted = `https://${websiteFormatted}`;
      }

      await onSave(salon.id, {
        name: editName.trim(),
        district: editDistrict,
        phone: editPhone.trim() || undefined,
        website: websiteFormatted || undefined,
        priceLevel: editPriceLevel,
        services: editServices,
      });
      setIsEditing(false);
    } catch {
      // Errors bubbled up to parent toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    const trimmed = newServiceText.trim();
    if (trimmed && !editServices.includes(trimmed)) {
      setEditServices([...editServices, trimmed]);
      setNewServiceText('');
    }
  };

  const handleRemoveService = (service: string) => {
    setEditServices(editServices.filter((s) => s !== service));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddService();
    }
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

  const hasValidationError = !!(nameError || phoneError || websiteError);

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
        isFocused ? 'ring-1 ring-indigo-500 border-indigo-500/40 bg-background-card-hover' : ''
      }`}
    >
      {/* CARD CONTENT */}
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
        /* INLINE EDIT MODE FORM */
        <div className="flex flex-col gap-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-2.5 border-b border-border-main">
            <span className="text-xs font-bold text-accent-indigo flex items-center gap-1.5 select-none">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Salon Details
            </span>
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 text-xs">
            {/* Business Name */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Name *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isSaving}
                className={`w-full bg-background-app py-2 px-3 rounded-lg border focus:outline-none text-text-main text-xs transition-colors ${
                  nameError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20'
                }`}
                placeholder="Business name"
              />
              {nameError && (
                <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-semibold select-none">
                  <AlertCircle className="w-3 h-3" />
                  {nameError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* District Select */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                  District *
                </label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-background-app py-2 px-2.5 rounded-lg border border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20 focus:outline-none text-text-main text-xs cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Level Selector */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                  Price Level *
                </label>
                <select
                  value={editPriceLevel}
                  onChange={(e) => setEditPriceLevel(Number(e.target.value))}
                  disabled={isSaving}
                  className="w-full bg-background-app py-2 px-2.5 rounded-lg border border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20 focus:outline-none text-text-main text-xs cursor-pointer"
                >
                  <option value={1}>$ (under 80 zł)</option>
                  <option value={2}>$$ (80–200 zł)</option>
                  <option value={3}>$$$ (200–400 zł)</option>
                  <option value={4}>$$$$ (400+ zł)</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Phone
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                disabled={isSaving}
                className={`w-full bg-background-app py-2 px-3 rounded-lg border focus:outline-none text-text-main text-xs transition-colors ${
                  phoneError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20'
                }`}
                placeholder="Phone number"
              />
              {phoneError && (
                <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-semibold select-none">
                  <AlertCircle className="w-3 h-3" />
                  {phoneError}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Website / Socials URL
              </label>
              <input
                type="text"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                disabled={isSaving}
                className={`w-full bg-background-app py-2 px-3 rounded-lg border focus:outline-none text-text-main text-xs transition-colors ${
                  websiteError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border-main focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/20'
                }`}
                placeholder="e.g. booksy.com/my-salon"
              />
              {websiteError && (
                <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-semibold select-none">
                  <AlertCircle className="w-3 h-3" />
                  {websiteError}
                </p>
              )}
            </div>

            {/* Service Widget */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Services
              </label>

              {/* Chips container */}
              {editServices.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1 max-h-[120px] overflow-y-auto p-1.5 bg-background-app rounded-lg border border-border-main">
                  {editServices.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-[10px] bg-background-card text-text-second border border-border-main pl-2 pr-1.5 py-0.5 rounded-md font-medium"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service)}
                        disabled={isSaving}
                        className="text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add item input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Manicure, Massage"
                  value={newServiceText}
                  onChange={(e) => setNewServiceText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isSaving}
                  className="flex-1 bg-background-app py-2 px-3 rounded-lg border border-border-main focus:border-accent-indigo/60 focus:outline-none text-text-main text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={isSaving || !newServiceText.trim()}
                  className="bg-accent-indigo/10 border border-accent-indigo/25 text-accent-indigo hover:bg-accent-indigo hover:text-white hover:border-transparent transition-all duration-200 px-3.5 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border-main select-none">
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              className="px-3.5 py-2 text-xs font-semibold text-text-second hover:text-text-main bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-border-main rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving || hasValidationError}
              className="px-4 py-2 text-xs font-semibold text-white bg-accent-indigo hover:bg-indigo-600 border border-transparent rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
