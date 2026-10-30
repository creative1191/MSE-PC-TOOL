import React from 'react';
import { Layers, Mail, Home, BookOpen, History, FileSpreadsheet } from 'lucide-react';
import { CourierType } from '../types';
import { CourierLogo } from './CourierLogo';

export type ActiveNavTab =
  | 'home'
  | 'courier-print'
  | 'label-printing'
  | 'dtdc-generator'
  | 'bluedart-generator'
  | 'delhivery-generator'
  | 'address-book'
  | 'print-history'
  | 'bulk-mode';

interface HomeNavigationTabsProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  selectedCourier: CourierType;
  onOpenAddressBook?: () => void;
  onOpenHistory?: () => void;
}

export const HomeNavigationTabs: React.FC<HomeNavigationTabsProps> = React.memo(({
  activeTab,
  onSelectTab,
  selectedCourier,
  onOpenAddressBook,
  onOpenHistory,
}) => {
  return (
    <nav
      className="bg-[#0b1329] border-b border-slate-800/90 px-3 md:px-6 py-2.5 select-none no-print shadow-sm"
      aria-label="Home Navigation"
    >
      <div className="max-w-[1920px] mx-auto space-y-2">
        {/* Main Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* TAB 0: HOME TILES HUB */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'home'
                ? 'bg-slate-800 text-white border-blue-400 shadow-md ring-2 ring-blue-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
            }`}>
              <Home className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white block truncate">
                Home Hub
              </span>
              <p className="text-[10px] text-slate-400 truncate">
                All Modules & Tiles
              </p>
            </div>
          </button>

          {/* TAB 1: COURIERPRINT ENVELOPE STUDIO */}
          <button
            type="button"
            onClick={() => onSelectTab('courier-print')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'courier-print'
                ? 'bg-slate-800 text-white border-blue-400 shadow-md ring-2 ring-blue-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              activeTab === 'courier-print'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-950/70 border border-blue-700/50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
            }`}>
              <Mail className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">
                  Envelope Studio
                </span>
                <span className="bg-blue-500 text-white text-[9px] font-extrabold px-1 rounded uppercase tracking-wider shrink-0">
                  TRUE 1:1
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                DL, C6, C5, C4, A4
              </p>
            </div>
          </button>

          {/* TAB 2: DTDC Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('dtdc-generator')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'dtdc-generator'
                ? 'bg-slate-800 text-white border-red-500 shadow-md ring-2 ring-red-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className="bg-white w-16 sm:w-20 h-9 sm:h-10 px-1 py-0.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="DTDC" className="h-5 sm:h-6 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white block truncate">
                DTDC Invoice
              </span>
              <p className="text-[10px] text-slate-400 truncate">
                3-Copy Vertical Bill
              </p>
            </div>
          </button>

          {/* TAB 3: Blue Dart Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('bluedart-generator')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'bluedart-generator'
                ? 'bg-slate-800 text-white border-blue-400 shadow-md ring-2 ring-blue-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className="bg-white w-16 sm:w-20 h-9 sm:h-10 px-1 py-0.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="BLUEDART" className="h-5 sm:h-6 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white block truncate">
                Blue Dart
              </span>
              <p className="text-[10px] text-slate-400 truncate">
                Waybill & Airway Bill
              </p>
            </div>
          </button>

          {/* TAB 4: Delhivery Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('delhivery-generator')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'delhivery-generator'
                ? 'bg-slate-800 text-white border-red-500 shadow-md ring-2 ring-red-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className="bg-white w-16 sm:w-20 h-9 sm:h-10 px-1 py-0.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CourierLogo courier="DELHIVERY" className="h-5 sm:h-6 w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white block truncate">
                Delhivery
              </span>
              <p className="text-[10px] text-slate-400 truncate">
                Express Parcel Bill
              </p>
            </div>
          </button>

          {/* TAB 5: Label Printing (A4 4-Up Grid) */}
          <button
            type="button"
            onClick={() => onSelectTab('label-printing')}
            className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
              activeTab === 'label-printing'
                ? 'bg-slate-800 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              activeTab === 'label-printing'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white block truncate">
                4-Up Labels
              </span>
              <p className="text-[10px] text-slate-400 truncate">
                A4 2x2 Grid Sheet
              </p>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
});
