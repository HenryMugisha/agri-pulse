/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, DollarSign, Laptop, Settings, Sprout, Stethoscope } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'livestock' | 'crops' | 'finances';
  setActiveTab: (tab: 'overview' | 'livestock' | 'crops' | 'finances') => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-emerald-900 transition-colors">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
                  AgriPulse
                </span>
                <span className="block text-[11px] text-stone-500 font-medium -mt-1 tracking-wider uppercase">
                  Farm Management System
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('livestock')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'livestock'
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              Livestock Health
            </button>

            <button
              onClick={() => setActiveTab('crops')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'crops'
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-700" />
              Crop Rotation
            </button>

            <button
              onClick={() => setActiveTab('finances')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'finances'
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-stone-700" />
              Seasonal Reports
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-md hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Settings & Local Hosting</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
