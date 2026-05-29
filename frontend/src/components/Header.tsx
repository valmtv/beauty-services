'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  return (
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
  );
}
