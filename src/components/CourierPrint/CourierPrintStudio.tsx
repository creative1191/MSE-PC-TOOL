import React, { useState, useEffect } from 'react';
import {
  CourierAddress,
  CourierPrintSettings,
  DualOcrResult,
  EnvelopePresetType,
  EnvelopePresetConfig,
  PostalBadgeType,
} from '../../types/courierPrint';
import {
  DEFAULT_RECEIVER,
  DEFAULT_SENDER,
  ENVELOPE_PRESETS,
  toUpperClean,
} from '../../utils/indianPostalData';
import { exportEnvelopeToPdf } from '../../utils/envelopePdfExport';
import { EnvelopePreview } from './EnvelopePreview';
import { AddressInputTabs } from './AddressInputTabs';
import { AddressVerificationCard } from './AddressVerificationCard';
import { AddressBookModal } from './AddressBookModal';
import { PrintHistoryModal, addPrintHistoryLog } from './PrintHistoryModal';
import { BulkModeModal } from './BulkModeModal';
import { PrintMount } from './PrintMount';
import { ServiceCardModal } from '../ServiceCardModal';
import { ReceiptDispatchModal } from '../ReceiptDispatchModal';
import { DTDCBillData } from '../../types';
import { INITIAL_BILL_DATA } from '../../data/defaults';
import {
  Printer,
  FileDown,
  Layers,
  History,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings2,
  RotateCw,
  Barcode,
  Stamp,
  Sliders,
  Type,
  CheckCircle2,
  Sparkles,
  Share2,
  Star,
  Leaf,
} from 'lucide-react';

export const CourierPrintStudio: React.FC = () => {
  // Address States
  const [to, setTo] = useState<CourierAddress>(() => {
    try {
      const saved = localStorage.getItem('courierprint_active_to_v1');
      return saved ? JSON.parse(saved) : DEFAULT_RECEIVER;
    } catch {
      return DEFAULT_RECEIVER;
    }
  });

  const [from, setFrom] = useState<CourierAddress>(() => {
    try {
      const saved = localStorage.getItem('courierprint_active_from_v1');
      return saved ? JSON.parse(saved) : DEFAULT_SENDER;
    } catch {
      return DEFAULT_SENDER;
    }
  });

  // Settings State
  const [settings, setSettings] = useState<CourierPrintSettings>(() => {
    try {
      const saved = localStorage.getItem('courierprint_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear dummy Indian Post defaults if loaded from previous session
        if (parsed.postalBadge === 'SPEED_POST') {
          parsed.postalBadge = 'NONE';
        }
        if (parsed.barcodeValue === 'CP94820148IN') {
          parsed.showBarcode = false;
          parsed.barcodeValue = '';
        }
        return parsed;
      }
    } catch {}

    return {
      preset: 'DL',
      customWidthMm: 220,
      customHeightMm: 110,
      orientation: 'LANDSCAPE',
      fromPosition: 'BOTTOM_RIGHT',
      marginPreset: 'NORMAL',
      customMarginMm: 12,
      typography: 'SEGOE',
      fontScale: 1.0,
      boldNames: true,
      boxedContainers: false,
      showBarcode: false,
      barcodeValue: '',
      postalBadge: 'NONE',
      senderPrefix: 'FROM:',
      receiverPrefix: 'TO:',
      includePhoneIcon: true,
      theme: 'light',
      language: 'en',
    };
  });

  // Zoom control: 60% to 160%
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Modals
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [showServiceCard, setShowServiceCard] = useState(false);
  const [showReceiptDispatch, setShowReceiptDispatch] = useState(false);
  const [dualOcrResult, setDualOcrResult] = useState<DualOcrResult | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Batch print support
  const [batchRecipientsForPrint, setBatchRecipientsForPrint] = useState<CourierAddress[] | null>(null);

  // Auto-save active to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('courierprint_active_to_v1', JSON.stringify(to));
      localStorage.setItem('courierprint_active_from_v1', JSON.stringify(from));
      localStorage.setItem('courierprint_settings_v1', JSON.stringify(settings));
    } catch {}
  }, [to, from, settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Swap TO and FROM
  const handleSwapAddresses = () => {
    const tempTo = { ...to };
    setTo({ ...from, id: to.id || 'to' });
    setFrom({ ...tempTo, id: from.id || 'from' });
    showToast('🔄 Swapped TO (Receiver) and FROM (Sender)!');
  };

  // Direct Browser Print
  const handleDirectPrint = () => {
    showToast('🖨️ Opening true physical scale print dialog...');
    addPrintHistoryLog(to, from, settings);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Direct Batch Print from Bulk Mode
  const handleDirectBatchPrint = (recipients: CourierAddress[]) => {
    setBatchRecipientsForPrint(recipients);
    setShowBulkMode(false);
    showToast(`🖨️ Printing ${recipients.length} batch envelopes...`);
    setTimeout(() => {
      window.print();
      setBatchRecipientsForPrint(null);
    }, 300);
  };

  // Vector PDF Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    showToast('📄 Generating exact millimeter Vector PDF...');
    try {
      await exportEnvelopeToPdf(to, from, settings);
      addPrintHistoryLog(to, from, settings);
      showToast('✅ True-Scale Vector PDF downloaded!');
    } catch (e: any) {
      console.error(e);
      showToast('❌ PDF export failed: ' + (e.message || 'Error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div>
      {/* Dynamic PrintMount for 100% Physical Scale Print via window.print() */}
      <PrintMount
        to={to}
        from={from}
        settings={settings}
        batchRecipients={batchRecipientsForPrint}
      />

      {/* Screen-Only Studio UI (Strictly hidden during browser print) */}
      <div className="no-print studio-screen-ui space-y-4">
        {/* Top Studio Action Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-amber-400 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/assets/aistudio/logo_87b71685.jpg"
              alt="Maa Sharda Enterprises"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Maa Sharda Enterprises Envelope Studio</span>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
                True 1:1 Scale
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-precision envelope printing for DL, C6, C5, C4 & custom parcel labels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(settings.preset === 'A4_3_SLIPS' || settings.preset === 'A4_COURIER_SLIP') && (
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, paperSaveMode: !prev.paperSaveMode }))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                settings.paperSaveMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
              title="Paper Save Mode: When ON, only Top Copy 1 is printed and remaining 2/3 of A4 sheet is saved blank"
            >
              <Leaf className={`w-3.5 h-3.5 ${settings.paperSaveMode ? 'text-white' : 'text-emerald-600'}`} />
              <span>Paper Save: {settings.paperSaveMode ? 'ON (1 Copy)' : 'OFF (3 Copies)'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBulkMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Bulk Batch Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReceiptDispatch(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800 rounded-lg transition-colors cursor-pointer"
            title="Send Dispatch Receipt, AWB Tracking & 5-Star Google Reviews to customer on WhatsApp"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Receipt & 5★ Review</span>
          </button>

          <button
            type="button"
            onClick={() => setShowServiceCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
            title="Send Visiting Card, Pamphlet & 5-Star Review to Sender or Receiver on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp Card</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Print History</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Vector PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDirectPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold rounded-lg flex items-center justify-between shadow-2xs animate-fadeIn">
          <span>{toastMessage}</span>
          <span className="text-[10px] text-blue-600 font-mono">CourierPrint</span>
        </div>
      )}

      {/* Main Two-Pane Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Address Inputs & Envelope Layout Settings (5 Cols) */}
        <div className="xl:col-span-5 space-y-3">
          {/* 1. Address Inputs Tabs (Manual, Paste Text, Upload, Offline OCR) */}
          <AddressInputTabs
            to={to}
            from={from}
            onChangeTo={setTo}
            onChangeFrom={setFrom}
            onSwapAddresses={handleSwapAddresses}
            onOpenAddressBook={() => setShowAddressBook(true)}
            onOpenDualVerification={(res) => setDualOcrResult(res)}
          />

          {/* 2. Envelope Preset & Layout Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Envelope & Format Settings</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Physical Dimensions
              </span>
            </div>

            {/* Envelope Preset Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                ENVELOPE / PAPER PRESET *
              </label>
              <select
                value={settings.preset}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preset: e.target.value as EnvelopePresetType,
                  })
                }
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {(Object.values(ENVELOPE_PRESETS) as EnvelopePresetConfig[]).map((p: EnvelopePresetConfig) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dedicated A4 3-Slip Controls (Paper Save & 9mm/13mm/5mm Margins) */}
            {(settings.preset === 'A4_3_SLIPS' || settings.preset === 'A4_COURIER_SLIP') && (
              <div className="p-3 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-400 dark:border-emerald-700 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>A4 Paper Save Mode:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, paperSaveMode: !prev.paperSaveMode }))
                    }
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                      settings.paperSaveMode
                        ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {settings.paperSaveMode ? 'ON (1 Copy at Top)' : 'OFF (3 Full Copies)'}
                  </button>
                </div>
                <p className="text-[10.5px] text-emerald-800 dark:text-emerald-300 leading-tight">
                  {settings.paperSaveMode
                    ? '🌱 Sirf upar wali 1 dispatch slip print hogi, baaki 67% A4 paper bilkul blank bacha rahega.'
                    : '📋 Pure A4 sheet par 3 dispatch slips (Copy 1, Copy 2, Copy 3) cut-lines ke sath print hongi.'}
                </p>

                {/* Print Margins: Normal (9mm), Relaxed (13mm), Compact (5mm) */}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-950 dark:text-emerald-200">Print Margins:</span>
                  <div className="flex items-center gap-1">
                    {(['normal', 'relaxed', 'compact'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, printMargin: m }))}
                        className={`px-2 py-0.5 rounded text-[10.5px] cursor-pointer transition-colors ${
                          (settings.printMargin || 'normal') === m
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {m === 'normal' ? 'Normal (9mm)' : m === 'relaxed' ? 'Relaxed (13mm)' : 'Compact (5mm)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Dimensions if CUSTOM selected */}
            {settings.preset === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-bold mb-0.5">WIDTH (MM)</label>
                  <input
                    type="number"
                    value={settings.customWidthMm}
                    onChange={(e) =>
                      setSettings({ ...settings, customWidthMm: Number(e.target.value) || 220 })
                    }
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-0.5">HEIGHT (MM)</label>
                  <input
                    type="number"
                    value={settings.customHeightMm}
                    onChange={(e) =>
                      setSettings({ ...settings, customHeightMm: Number(e.target.value) || 110 })
                    }
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Envelope-Specific Controls (Hidden in A4 3-Slip mode to keep UI clean and uncluttered) */}
            {settings.preset !== 'A4_3_SLIPS' && (
              <>
                {/* Orientation & Margins */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      ORIENTATION
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, orientation: 'LANDSCAPE' })}
                        className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                          settings.orientation === 'LANDSCAPE'
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Landscape
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, orientation: 'PORTRAIT' })}
                        className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                          settings.orientation === 'PORTRAIT'
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Portrait
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      MARGINS
                    </label>
                    <select
                      value={settings.marginPreset}
                      onChange={(e) =>
                        setSettings({ ...settings, marginPreset: e.target.value as any })
                      }
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="COMPACT">Compact (8 mm)</option>
                      <option value="NORMAL">Normal (12 mm)</option>
                      <option value="WIDE">Wide (18 mm)</option>
                    </select>
                  </div>
                </div>

                {/* From Position */}
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    FROM POSITION
                  </label>
                  <select
                    value={settings.fromPosition}
                    onChange={(e) =>
                      setSettings({ ...settings, fromPosition: e.target.value as any })
                    }
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="BOTTOM_RIGHT">Bottom-Right (Standard)</option>
                    <option value="BOTTOM_LEFT">Bottom-Left</option>
                  </select>
                </div>

                {/* Postal Badge & Barcode */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      POSTAL BADGE
                    </label>
                    <select
                      value={settings.postalBadge}
                      onChange={(e) =>
                        setSettings({ ...settings, postalBadge: e.target.value as PostalBadgeType })
                      }
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="NONE">None</option>
                      <option value="SPEED_POST">Speed Post</option>
                      <option value="REGISTERED_POST">Registered Post</option>
                      <option value="BOOK_POST">Book Post</option>
                      <option value="FRAGILE">Fragile / Care</option>
                      <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                      <option value="AIRMAIL">By Air Mail</option>
                      <option value="EXPRESS_PARCEL">Express Parcel</option>
                      <option value="DOCUMENT">Documents Only</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400">
                        BARCODE / AWB
                      </label>
                      <label className="text-[10px] text-blue-600 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showBarcode}
                          onChange={(e) =>
                            setSettings({ ...settings, showBarcode: e.target.checked })
                          }
                          className="rounded accent-blue-600"
                        />
                        <span>Show</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!settings.showBarcode}
                      value={settings.barcodeValue}
                      onChange={(e) =>
                        setSettings({ ...settings, barcodeValue: toUpperClean(e.target.value) })
                      }
                      placeholder="AWB / Barcode"
                      className="w-full uppercase font-mono text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Font Scale Control (Available in all presets) */}
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  TEXT SIZE / FONT SCALE
                </label>
                <span className="text-[10.5px] font-mono font-bold text-blue-600">
                  {Math.round(settings.fontScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={settings.fontScale}
                onChange={(e) =>
                  setSettings({ ...settings, fontScale: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Extra Toggles */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.boxedContainers}
                  onChange={(e) =>
                    setSettings({ ...settings, boxedContainers: e.target.checked })
                  }
                  className="rounded accent-blue-600"
                />
                <span className="font-semibold">Boxed Containers (Borders)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.boldNames}
                  onChange={(e) =>
                    setSettings({ ...settings, boldNames: e.target.checked })
                  }
                  className="rounded accent-blue-600"
                />
                <span className="font-semibold">Bold Names</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Live Real-Time Print Preview (7 Cols) */}
        <div className="xl:col-span-7 space-y-3">
          {/* Zoom and Preview Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Preview Zoom:</span>
              <span className="font-mono text-blue-600 font-bold ml-1">{zoomPercent}%</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomPercent((prev) => Math.max(60, prev - 10))}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomPercent(100)}
                className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer font-mono"
                title="Reset to 100%"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => setZoomPercent((prev) => Math.min(160, prev + 10))}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => setShowServiceCard(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-md shadow-2xs transition-colors cursor-pointer"
                title="Send Service Card & Pamphlet on WhatsApp (100% Free)"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp Card</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Save Vector PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDirectPrint}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Envelope</span>
              </button>
            </div>
          </div>

          {/* Live Print Preview Canvas Stage */}
          <div className="bg-[#e2e7f0] dark:bg-slate-950/70 p-4 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center overflow-x-auto min-h-[440px]">
            <EnvelopePreview
              to={to}
              from={from}
              settings={settings}
              zoomPercent={zoomPercent}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddressBook && (
        <AddressBookModal
          onSelectAddress={(addr, asType) => {
            if (asType === 'TO') setTo({ ...addr, id: to.id });
            else setFrom({ ...addr, id: from.id });
            showToast(`✅ Selected ${addr.name} as ${asType}!`);
          }}
          onClose={() => setShowAddressBook(false)}
        />
      )}

      {showHistory && (
        <PrintHistoryModal
          onReprint={(item) => {
            setTo(item.envelopeData.to);
            setFrom(item.envelopeData.from);
            setSettings(item.envelopeData.settings);
            showToast(`✅ Loaded print job for ${item.recipientName}`);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showBulkMode && (
        <BulkModeModal
          from={from}
          settings={settings}
          onClose={() => setShowBulkMode(false)}
          onDirectBatchPrint={handleDirectBatchPrint}
        />
      )}

      {dualOcrResult && (
        <AddressVerificationCard
          ocrResult={dualOcrResult}
          onApplyBoth={(newSender, newReceiver) => {
            setFrom(newSender);
            setTo(newReceiver);
            setDualOcrResult(null);
            showToast('✅ Both Sender (FROM) and Receiver (TO) applied from Dual-OCR!');
          }}
          onClose={() => setDualOcrResult(null)}
        />
      )}

      {showServiceCard && (
        <ServiceCardModal
          currentSender={from}
          currentRecipientMobile={to.mobile}
          currentRecipientName={to.name}
          onClose={() => setShowServiceCard(false)}
        />
      )}

      {showReceiptDispatch && (
        <ReceiptDispatchModal
          isOpen={showReceiptDispatch}
          onClose={() => setShowReceiptDispatch(false)}
          billData={{
            ...INITIAL_BILL_DATA,
            courier: 'DTDC',
            awb: settings.barcodeValue || '',
            consignorName: from.name,
            consignorPhone: from.mobile || '',
            consignorAddress: [from.company, from.addressLine1, from.addressLine2, from.landmark, `${from.city}, ${from.state} - ${from.pinCode}`].filter(Boolean).join(', '),
            origin: from.city || 'SATNA',
            consigneeName: to.name,
            consigneePhone: to.mobile || '',
            consigneeAddress: [to.company, to.addressLine1, to.addressLine2, to.landmark, `${to.city}, ${to.state} - ${to.pinCode}`].filter(Boolean).join(', '),
            dest: to.city || 'DESTINATION',
          }}
          onOpenServiceCard={() => {
            setShowReceiptDispatch(false);
            setShowServiceCard(true);
          }}
        />
      )}
      </div>
    </div>
  );
};
