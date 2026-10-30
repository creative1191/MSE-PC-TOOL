import React, { useState, useEffect } from 'react';
import {
  Mail,
  FileSpreadsheet,
  Grid2x2,
  Layers,
  BookOpen,
  History,
  Settings,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Calendar,
  Building2,
  FileText,
  Clock,
  ScanLine,
  Zap,
  SlidersHorizontal,
  Share2,
  MessageSquare,
  Star,
} from 'lucide-react';
import { DEFAULT_SENDER } from '../utils/indianPostalData';

export type AppActiveTab =
  | 'home'
  | 'courier-print'
  | 'trackon-generator'
  | 'shreemaruti-generator'
  | 'delhivery-generator'
  | 'dtdc-generator'
  | 'bluedart-generator'
  | 'label-printing'
  | 'address-book'
  | 'print-history'
  | 'bulk-mode'
  | 'settings'
  | 'service-card'
  | 'receipt-dispatch';

interface HomeTilesHubProps {
  onSelectTab: (tab: AppActiveTab) => void;
  onOpenSettings: () => void;
}

export const HomeTilesHub: React.FC<HomeTilesHubProps> = ({
  onSelectTab,
  onOpenSettings,
}) => {
  // Live session statistics from localStorage
  const [addressCount, setAddressCount] = useState<number>(3);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [activeSender, setActiveSender] = useState<string>(DEFAULT_SENDER.name);

  useEffect(() => {
    try {
      const addrList = JSON.parse(localStorage.getItem('courierprint_address_book_v1') || '[]');
      if (addrList.length > 0) setAddressCount(addrList.length);

      const histList = JSON.parse(localStorage.getItem('courierprint_print_history_v1') || '[]');
      setHistoryCount(histList.length);

      const savedSender = JSON.parse(localStorage.getItem('courierprint_active_from_v1') || 'null');
      if (savedSender?.name) setActiveSender(savedSender.name);
    } catch {}
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5 py-2 px-1 select-none animate-fadeIn">
      {/* 1. PROFESSIONAL EXECUTIVE STATUS BAR (Windows 11 Fluent Command Center) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Active Branch & Dispatch Desk Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-md shadow-amber-500/15 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/assets/aistudio/logo_87b71685.jpg"
              alt="Maa Sharda Enterprises"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Maa Sharda Enterprises
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 font-medium">
                • Logistics Operations Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready for Dispatch</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[200px] sm:max-w-none">{activeSender}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{todayFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Operational Live Metrics & Quick Action Launcher */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab('receipt-dispatch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-blue-300 transition-colors cursor-pointer shadow-2xs"
            title="Dispatch Receipt, Pamphlet & 1-Tap 5-Star Google Reviews to customer on WhatsApp"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="hidden sm:inline">Receipt & 5★ Review</span>
            <span className="sm:hidden">5★ Review</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('service-card')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer shadow-2xs"
            title="Send Shop Pamphlet & Visiting Card on WhatsApp (100% Free)"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp Pamphlet</span>
            <span className="sm:hidden">Share</span>
          </button>

          <div className="hidden sm:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onSelectTab('address-book')}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{addressCount} Addresses</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => onSelectTab('print-history')}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>{historyCount} Dispatches</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="System & Printer Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PRIMARY OPERATIONAL WORKSPACES (THE 4 CORE BUSINESS TOOLS) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Primary Dispatch Operations
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Click any tile to launch workspace directly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TOOL 1: ENVELOPE STUDIO (COURIERPRINT) */}
          <div
            onClick={() => onSelectTab('courier-print')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <Mail className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono tracking-wider uppercase">
                  TRUE 1:1 SCALE
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Envelope & 3-Slip Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Print true physical scale addresses on <strong>DL, C6, C5, C4 envelopes</strong> or <strong>A4 3-Slip side-by-side sheets</strong> on normal paper with Paper Save mode.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Launch Envelope Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TOOL 2: QUICK INVOICE GENERATOR (DTDC / BLUE DART / DELHIVERY) */}
          <div
            onClick={() => onSelectTab('dtdc-generator')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono tracking-wider uppercase">
                  5 COURIER PARTNERS
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  MSE Bill Generator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Official <strong>3-copy courier bills & A4 paper save address slips</strong> for Trackon, Shree Maruti, Delhivery, DTDC & Blue Dart with Code 128 barcodes, cut lines, and OCR scan.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Launch MSE Bill Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TOOL 3: A4 4-UP SHIPPING LABELS */}
          <div
            onClick={() => onSelectTab('label-printing')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <Grid2x2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono tracking-wider uppercase">
                  A4 2X2 GRID
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  4-Up Shipping Labels
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Fit up to <strong>4 shipping labels per standard A4 sheet</strong>. Zero dummy waste slots, multi-page PDF splitting, crop tools, and 90° rotation controls.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Open 4-Up Arranger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TOOL 4: BULK BATCH DISPATCH */}
          <div
            onClick={() => onSelectTab('bulk-mode')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <Layers className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono tracking-wider uppercase">
                  BATCH PARSING
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Bulk Batch Dispatch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Paste multiple recipient addresses from <strong>WhatsApp or CSV</strong>. Batch-parse addresses into envelopes and download a multi-page batch Vector PDF.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span>Start Bulk Dispatch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MASTER DATA, CUSTOMER OUTREACH & SYSTEM UTILITIES (4 TILES GRID) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Master Registers & Customer Outreach
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            WhatsApp pamphlet sharing, address book, dispatch logs, and preferences
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TILE 1: DIGITAL SERVICE CARD & PAMPHLET (WHATSAPP READY) */}
          <div
            onClick={() => onSelectTab('service-card')}
            className="group relative bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <Share2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono tracking-wider uppercase">
                  100% FREE WA
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Service Card & Pamphlet</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload your own <strong>shop pamphlet or flyer</strong>, auto-generate digital visiting cards, and share directly to customers on WhatsApp in 1-click (Zero monthly fees).
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Send Card via WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TILE 2: SAVED ADDRESS BOOK */}
          <div
            onClick={() => onSelectTab('address-book')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono tracking-wider uppercase">
                  {addressCount} CONTACTS
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Saved Address Book
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Store frequent senders, customers, and vendor dispatch profiles. Instant search, category filters, default branch sender, and CSV backup.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Manage Contacts & Senders</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TILE 3: PRINT HISTORY & DISPATCH REGISTER */}
          <div
            onClick={() => onSelectTab('print-history')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <History className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono tracking-wider uppercase">
                  DISPATCH AUDIT
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Print History & Audit Logs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Log of past dispatches with timestamps, recipient details, tracking AWB numbers, and 1-click duplicate reprinting for lost envelopes.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>View Dispatch Logs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* TILE 4: CONFIGURATION & SETTINGS */}
          <div
            onClick={onOpenSettings}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-500 dark:hover:border-slate-400 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 group-hover:bg-slate-800 group-hover:text-white dark:group-hover:bg-slate-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
                  <Settings className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono tracking-wider uppercase">
                  PREFERENCES
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  Print & Agency Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Configure custom agency/branch logos, default safe printer margins, postal stamps (Speed Post, Fragile, COD), and typography scaling.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Configure System Preferences</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. ENTERPRISE COMPLIANCE & ARCHITECTURE FOOTER */}
      <div className="bg-slate-100/90 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Enterprise Architecture:</strong> 100% Client-Side Privacy • Zero External Data Leakage • True 1:1 Physical Scale Print • Code 128 Barcodes
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">Ctrl+P</kbd> Print</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">Ctrl+V</kbd> OCR Paste</span>
        </div>
      </div>
    </div>
  );
};
