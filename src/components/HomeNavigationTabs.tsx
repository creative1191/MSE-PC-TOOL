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
      className="bg-[#0f172a] border-b border-slate-800/90 px-3 py-2.5 select-none no-print shadow-xs"
      aria-label="Home Navigation"
    >
      <div className="max-w-4xl mx-auto">
        {/* Exactly 4 main navigation tabs only, centered and cleanly designed */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {/* TAB 1: Label Printing */}
          <button
            type="button"
            onClick={() => onSelectTab('label-printing')}
            className={`group relative flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'label-printing'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Layers className={`w-4 h-4 transition-colors ${activeTab === 'label-printing' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
            <span className="tracking-tight truncate">Label Printing</span>
            {activeTab === 'label-printing' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-emerald-400 rounded-full" />
            )}
          </button>

          {/* TAB 2: DTDC Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('dtdc-generator')}
            className={`group relative flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'dtdc-generator'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <div className="bg-white h-4.5 w-12 px-1 rounded flex items-center justify-center shrink-0">
              <CourierLogo courier="DTDC" className="h-3 w-full" />
            </div>
            <span className="tracking-tight truncate">DTDC Invoice</span>
            {activeTab === 'dtdc-generator' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-red-500 rounded-full" />
            )}
          </button>

          {/* TAB 3: Blue Dart Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('bluedart-generator')}
            className={`group relative flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'bluedart-generator'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <div className="bg-white h-4.5 w-12 px-1 rounded flex items-center justify-center shrink-0">
              <CourierLogo courier="BLUEDART" className="h-3 w-full" />
            </div>
            <span className="tracking-tight truncate">Blue Dart Invoice</span>
            {activeTab === 'bluedart-generator' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500 rounded-full" />
            )}
          </button>

          {/* TAB 4: Delhivery Invoice Generator */}
          <button
            type="button"
            onClick={() => onSelectTab('delhivery-generator')}
            className={`group relative flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'delhivery-generator'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <div className="bg-white h-4.5 w-12 px-1 rounded flex items-center justify-center shrink-0">
              <CourierLogo courier="DELHIVERY" className="h-3 w-full" />
            </div>
            <span className="tracking-tight truncate">Delhivery Invoice</span>
            {activeTab === 'delhivery-generator' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
});
