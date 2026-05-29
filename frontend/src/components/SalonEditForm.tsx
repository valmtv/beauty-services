'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { Salon, SalonUpdateInput } from '../lib/api';

interface SalonEditFormProps {
  salon: Salon;
  onCancel: () => void;
  onSave: (id: number, data: SalonUpdateInput) => Promise<void>;
  districts: string[];
}

// Simple URL structure regex
const WEBSITE_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
// Phone format selector (allows digits, spaces, plus, parentheses, and dashes)
const PHONE_REGEX = /^[\d\s\-\+\(\)]*$/;

export default function SalonEditForm({ salon, onCancel, onSave, districts }: SalonEditFormProps) {
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

  const hasValidationError = !!(nameError || phoneError || websiteError);

  return (
    <div className="flex flex-col gap-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between pb-2.5 border-b border-border-main">
        <span className="text-xs font-bold text-accent-indigo flex items-center gap-1.5 select-none">
          <Edit3 className="w-3.5 h-3.5" />
          Edit Salon Details
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
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
  );
}
