import React from 'react';
import { Layers } from 'lucide-react';
import { CourierType } from '../types';
import { CourierLogo } from './CourierLogo';

export type ActiveNavTab =
  | 'label-printing'
  | 'dtdc-generator'
  | 'bluedart-generator'
  | 'delhivery-generator';

interface HomeNavigationTabsProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  selectedCourier: CourierType;
}

export const HomeNavigationTabs: React.FC<HomeNavigationTabsProps> = React.memo(({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav
      className="bg-[#0b1329] border-b border-slate-800/90 px-3 md:px-6 py-3 select-none no-print shadow-sm"
      aria-label="Home Navigation"
    >
      <div className="max-w-[1920px] mx-auto">
        {/* Prominent, large 4 main navigation tabs with full-sized filled icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* TAB 1: Label Printing */}
          <button
            type="button"
            onClick={() => onSelectTab('label-printing')}
            className={`group relative flex items-center gap-3.5 p-3 md:p-3.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'label-printing'
                ? 'bg-slate-800 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            {/* Filled, prominent icon box */}
            <div className={`w-12 h-12 md:w-13 md:h-13 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              activeTab === 'label-printing'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              <Layers className="w-6 h-6 md:w-7 md:h-7 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-white truncate">
                  1. Label Printing
                </span>
                {activeTab === 'label-printing' && (
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                A4 4-Up Grid • Multi-Page Split
              </p>
            </div>
          </button>

          {/* TAB 2: DTDC Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('dtdc-generator')}
            className={`group relative flex items-center gap-3.5 p-3 md:p-3.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'dtdc-generator'
                ? 'bg-slate-800 text-white border-red-500 shadow-md ring-2 ring-red-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            {/* Filled, prominent logo badge */}
            <div className="bg-white w-24 md:w-28 h-12 md:h-13 px-2 py-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="DTDC" className="h-7 md:h-8 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-white truncate">
                  2. DTDC Invoice
                </span>
                {activeTab === 'dtdc-generator' && (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                Consignment Note • 7D/7X AWB
              </p>
            </div>
          </button>

          {/* TAB 3: Blue Dart Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('bluedart-generator')}
            className={`group relative flex items-center gap-3.5 p-3 md:p-3.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'bluedart-generator'
                ? 'bg-slate-800 text-white border-blue-400 shadow-md ring-2 ring-blue-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            {/* Filled, prominent logo badge */}
            <div className="bg-white w-24 md:w-28 h-12 md:h-13 px-2 py-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="BLUEDART" className="h-7 md:h-8 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-white truncate">
                  3. Blue Dart Invoice
                </span>
                {activeTab === 'bluedart-generator' && (
                  <span className="bg-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                Domestic Waybill • 82 AWB
              </p>
            </div>
          </button>

          {/* TAB 4: Delhivery Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('delhivery-generator')}
            className={`group relative flex items-center gap-3.5 p-3 md:p-3.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'delhivery-generator'
                ? 'bg-slate-800 text-white border-red-500 shadow-md ring-2 ring-red-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            {/* Filled, prominent logo badge */}
            <div className="bg-white w-24 md:w-28 h-12 md:h-13 px-2 py-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="DELHIVERY" className="h-7 md:h-8 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-white truncate">
                  4. Delhivery Invoice
                </span>
                {activeTab === 'delhivery-generator' && (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                Parcel Waybill • 14 AWB
              </p>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
});
