import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DTDCBillData, PresetLabel, OCRMatchResult, CourierType } from './types';
import { INITIAL_BILL_DATA } from './data/defaults';
import { COURIER_CONFIGS, COURIER_PRESETS, generateAwbNumber } from './data/courierConfigs';
import { WindowsTitlebar } from './components/WindowsTitlebar';
import { HomeTilesHub, AppActiveTab } from './components/HomeTilesHub';
import { CourierPrintStudio } from './components/CourierPrint/CourierPrintStudio';
import { QuickPresetsBar } from './components/QuickPresetsBar';
import { ConsignorForm } from './components/ConsignorForm';
import { CourierChargesCard } from './components/CourierChargesCard';
import { ConsigneeForm } from './components/ConsigneeForm';
import { ShipmentSpecsForm } from './components/ShipmentSpecsForm';
import { BookingBranchCard } from './components/BookingBranchCard';
import { BillExportBar } from './components/BillExportBar';
import { PrintSheet } from './components/PrintSheet';
import { SnipToolHandler } from './components/SnipToolHandler';
import { LockedSettingsModal } from './components/LockedSettingsModal';
import { LabelPrintingManager } from './components/LabelPrinting/LabelPrintingManager';
import { AddressBookModal } from './components/CourierPrint/AddressBookModal';
import { PrintHistoryModal } from './components/CourierPrint/PrintHistoryModal';
import { BulkModeModal } from './components/CourierPrint/BulkModeModal';
import { ServiceCardModal } from './components/ServiceCardModal';
import { ReceiptDispatchModal } from './components/ReceiptDispatchModal';
import { DEFAULT_SENDER } from './utils/indianPostalData';
import { downloadBillAsPdf, downloadBillAsPng, downloadBillAsHtml } from './utils/exportHelpers';
import { getStoredGoogleReviewsConfig } from './utils/googleReviews';
import { ArrowLeft, Home, Mail, FileSpreadsheet, Grid2x2 } from 'lucide-react';

export type MainAppView =
  | 'home'
  | 'courier-print'
  | 'generator'
  | 'label-printing';

export default function App() {
  const [selectedCourier, setSelectedCourier] = useState<CourierType>('DTDC');
  const [billData, setBillData] = useState<DTDCBillData>(() => ({
    ...INITIAL_BILL_DATA,
    courier: 'DTDC',
  }));
  // Launch straight into Home Hub as primary central dashboard
  const [currentView, setCurrentView] = useState<MainAppView>('home');

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showServiceCardModal, setShowServiceCardModal] = useState(false);
  const [showReceiptDispatchModal, setShowReceiptDispatchModal] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('dtdc-dharmendra-220');

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // Memoized configuration and presets for instant rendering
  const currentConfig = useMemo(
    () => COURIER_CONFIGS[selectedCourier] || COURIER_CONFIGS.DTDC,
    [selectedCourier]
  );
  const currentPresets = useMemo(
    () => COURIER_PRESETS[selectedCourier] || COURIER_PRESETS.DTDC,
    [selectedCourier]
  );

  // Switch courier handler
  const handleSwitchCourier = useCallback((courier: CourierType) => {
    setSelectedCourier(courier);
    const config = COURIER_CONFIGS[courier];
    setBillData((prev) => {
      const isDefaultProductOfAny = Object.values(COURIER_CONFIGS).some((c) =>
        c.defaultProducts.includes(prev.product)
      );

      return {
        ...prev,
        courier,
        senderDepot: 'NAGOD',
        origin: 'NAGOD',
        product: isDefaultProductOfAny ? config.defaultProducts[0] : prev.product,
        awb: generateAwbNumber(courier),
      };
    });

    const presets = COURIER_PRESETS[courier];
    if (presets && presets.length > 0) {
      setActivePresetId(presets[0].id);
    }
  }, []);

  // Handle Tab Switch strictly from Home Tiles Hub (Zero side/top tab clutter)
  const handleSelectNavTab = useCallback(
    (tab: AppActiveTab) => {
      if (tab === 'home') {
        setCurrentView('home');
      } else if (tab === 'courier-print') {
        setCurrentView('courier-print');
      } else if (tab === 'label-printing') {
        setCurrentView('label-printing');
      } else if (tab === 'dtdc-generator') {
        setCurrentView('generator');
        handleSwitchCourier('DTDC');
      } else if (tab === 'bluedart-generator') {
        setCurrentView('generator');
        handleSwitchCourier('BLUEDART');
      } else if (tab === 'delhivery-generator') {
        setCurrentView('generator');
        handleSwitchCourier('DELHIVERY');
      } else if (tab === 'address-book') {
        setShowAddressBookModal(true);
      } else if (tab === 'print-history') {
        setShowHistoryModal(true);
      } else if (tab === 'bulk-mode') {
        setShowBulkModal(true);
      } else if (tab === 'settings') {
        setShowSettingsModal(true);
      } else if (tab === 'service-card') {
        setShowServiceCardModal(true);
      } else if (tab === 'receipt-dispatch') {
        setShowReceiptDispatchModal(true);
      }
    },
    [handleSwitchCourier]
  );

  // Field update handler for Bill Generator
  const updateField = useCallback((field: keyof DTDCBillData, value: any) => {
    setBillData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Quick Preset applier for Bill Generator (Locks Origin and Sender Depot to NAGOD)
  const applyPreset = useCallback((preset: PresetLabel) => {
    setActivePresetId(preset.id);
    setBillData((prev) => ({
      ...prev,
      awb: generateAwbNumber(prev.courier || 'DTDC'),
      consignorName: preset.data.consignorName || prev.consignorName,
      consignorAddress: preset.data.consignorAddress || prev.consignorAddress,
      consignorPhone: preset.data.consignorPhone || prev.consignorPhone,
      consignorGstin: preset.data.consignorGstin || '',
      origin: 'NAGOD',
      dest: preset.data.dest || prev.dest || 'MUMBAI',
      senderDepot: 'NAGOD',
      product: preset.data.product || prev.product,
      type: preset.data.type || prev.type,
      mode: preset.data.mode || prev.mode,
      pieces: preset.data.pieces || prev.pieces,
      actualWeight: preset.data.actualWeight || prev.actualWeight,
      chargedWeight: preset.data.chargedWeight || prev.chargedWeight,
      contentSpec: preset.data.contentSpec || prev.contentSpec,
      declaredValue: preset.data.declaredValue ?? prev.declaredValue,
      courierCharges: preset.data.courierCharges ?? prev.courierCharges,
    }));
  }, []);

  // Generate new AWB
  const handleGenerateNewAwb = useCallback(() => {
    const newAwb = generateAwbNumber(selectedCourier);
    updateField('awb', newAwb);
    setExportNotice(`Generated new AWB: ${newAwb}`);
    setTimeout(() => setExportNotice(null), 3000);
  }, [selectedCourier, updateField]);

  // Clear old data for fresh invoice
  const handleClearOldData = useCallback(() => {
    setBillData({
      ...INITIAL_BILL_DATA,
      courier: selectedCourier,
      awb: generateAwbNumber(selectedCourier),
      product: currentConfig.defaultProducts[0],
    });
    setExportNotice('Cleared all fields for fresh booking');
    setTimeout(() => setExportNotice(null), 3000);
  }, [selectedCourier, currentConfig]);

  // Apply frequent consignor profile
  const applyFrequentConsignor = useCallback((profile: any) => {
    setBillData((prev) => ({
      ...prev,
      consignorName: profile.name,
      consignorAddress: profile.address,
      consignorPhone: profile.phone,
      consignorGstin: profile.gstin || '',
      origin: profile.origin || prev.origin,
      senderDepot: profile.depot || prev.senderDepot,
    }));
  }, []);

  // OCR data extraction handler
  const handleOcrExtracted = useCallback((extracted: OCRMatchResult, rawAwb?: string) => {
    setBillData((prev) => {
      const updated: DTDCBillData = { ...prev };
      if (rawAwb) updated.awb = rawAwb;
      if (extracted.awb) updated.awb = extracted.awb;
      if (extracted.origin) updated.origin = extracted.origin;
      if (extracted.dest) updated.dest = extracted.dest;
      if (extracted.consignorName) updated.consignorName = extracted.consignorName;
      if (extracted.consignorAddress) updated.consignorAddress = extracted.consignorAddress;
      if (extracted.consignorPhone) updated.consignorPhone = extracted.consignorPhone;
      if (extracted.consignorGstin) updated.consignorGstin = extracted.consignorGstin;
      if (extracted.consigneeName) updated.consigneeName = extracted.consigneeName;
      if (extracted.consigneeAddress) updated.consigneeAddress = extracted.consigneeAddress;
      if (extracted.consigneePhone) updated.consigneePhone = extracted.consigneePhone;
      if (extracted.consigneeGstin) updated.consigneeGstin = extracted.consigneeGstin;
      if (extracted.customerRefNo) updated.customerRefNo = extracted.customerRefNo;
      if (extracted.date) updated.date = extracted.date;
      if (extracted.product) updated.product = extracted.product;
      if (extracted.type) updated.type = extracted.type;
      if (extracted.mode) updated.mode = extracted.mode;
      if (extracted.pieces) updated.pieces = extracted.pieces;
      if (extracted.actualWeight) updated.actualWeight = extracted.actualWeight;
      if (extracted.chargedWeight) updated.chargedWeight = extracted.chargedWeight;
      if (extracted.contentSpec) updated.contentSpec = extracted.contentSpec;
      if (extracted.declaredValue !== undefined) updated.declaredValue = extracted.declaredValue;
      if (extracted.courierCharges !== undefined) updated.courierCharges = extracted.courierCharges;
      return updated;
    });
  }, []);

  // Export handlers for Bill Generator
  const handleExportPng = useCallback(async (highRes = true) => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    setExportNotice(`Generating ${highRes ? '300 DPI High-Res' : 'Standard'} PNG...`);
    try {
      await downloadBillAsPng(printAreaRef.current, billData, highRes);
      setExportNotice('✅ PNG Downloaded Successfully!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch {
      setExportNotice('Error generating PNG');
    } finally {
      setIsExporting(false);
    }
  }, [billData]);

  const handleExportPdf = useCallback(async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    setExportNotice('Compiling print-ready PDF...');
    try {
      await downloadBillAsPdf(printAreaRef.current, billData);
      setExportNotice('✅ PDF Downloaded Successfully!');
      setTimeout(() => setExportNotice(null), 3000);

      // Auto-open receipt dispatch modal if enabled
      if (getStoredGoogleReviewsConfig().autoOpenAfterPrint) {
        setTimeout(() => setShowReceiptDispatchModal(true), 800);
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      setExportNotice('❌ PDF Generation Failed.');
      setTimeout(() => setExportNotice(null), 4000);
    } finally {
      setIsExporting(false);
    }
  }, [billData]);

  const handleExportHtml = useCallback(() => {
    downloadBillAsHtml(billData);
    setExportNotice('✅ HTML File Downloaded!');
    setTimeout(() => setExportNotice(null), 3000);
  }, [billData]);

  // Direct Print handler supporting all views with automatic fallback
  const handleDirectPrint = useCallback(() => {
    // If on Home Hub, seamlessly route into MSE Bill Generator first
    if (currentView === 'home') {
      setCurrentView('generator');
      setExportNotice('Switched to MSE Bill Generator. Launching print dialog...');
      setTimeout(() => {
        try {
          window.print();
        } catch {
          handleExportPdf();
        }
      }, 400);
      return;
    }

    setExportNotice('🖨️ Opening print dialog... (Use PDF button for 1-click printable file if preview blocks dialog)');
    try {
      window.print();
      setTimeout(() => {
        setExportNotice('🖨️ Print command sent to printer!');
        setTimeout(() => setExportNotice(null), 3500);
      }, 1000);

      // Auto-open receipt dispatch modal if enabled
      if (getStoredGoogleReviewsConfig().autoOpenAfterPrint) {
        setTimeout(() => setShowReceiptDispatchModal(true), 1200);
      }
    } catch (err: any) {
      console.warn('Direct print blocked by sandbox:', err);
      setExportNotice('⚠️ Browser blocked popup. Downloading print-ready PDF instead...');
      if (currentView === 'generator') {
        handleExportPdf();
      }
    }
  }, [currentView, handleExportPdf]);

  // Keyboard shortcut Ctrl+P for direct printing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDirectPrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectPrint]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* 1. Desktop Titlebar (Windows 11 Fluent) */}
      <WindowsTitlebar
        onPrint={handleDirectPrint}
        onOpenSettings={() => setShowSettingsModal(true)}
        onGoHome={() => setCurrentView('home')}
      />

      {/* 2. Main Workspace Container (Clean layout with NO top/side tab bars) */}
      <main className="flex-1 p-3 md:p-5 max-w-[1920px] w-full mx-auto transition-all duration-300">
        {/* VIEW A: HOME TILES HUB (Central launchpad for all modules) */}
        {currentView === 'home' && (
          <HomeTilesHub
            onSelectTab={handleSelectNavTab}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}

        {/* VIEW B: COURIERPRINT ENVELOPE STUDIO */}
        {currentView === 'courier-print' && (
          <div className="animate-fadeIn space-y-3">
            {/* Clean Back-to-Home Breadcrumb Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Home Hub</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-400">Home Hub</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Envelope & Dispatch Studio</span>
                </span>
              </div>
            </div>

            <CourierPrintStudio />
          </div>
        )}

        {/* VIEW C: A4 4-UP MULTI-LABEL SHIPPING MANAGER */}
        {currentView === 'label-printing' && (
          <div className="animate-fadeIn space-y-3">
            {/* Clean Back-to-Home Breadcrumb Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Home Hub</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-400">Home Hub</span>
                <span>/</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                  <Grid2x2 className="w-3.5 h-3.5" />
                  <span>A4 4-Up Shipping Labels (2x2 Grid)</span>
                </span>
              </div>
            </div>

            <LabelPrintingManager />
          </div>
        )}

        {/* VIEW D: MULTI-COURIER INVOICE & BILL GENERATOR (DTDC / BLUEDART / DELHIVERY) */}
        {currentView === 'generator' && (
          <div className="animate-fadeIn space-y-3">
            {/* Clean Back-to-Home Header + Courier Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Home Hub</span>
              </button>

              {/* In-view Courier Switcher Pills (Active Bill Couriers: DTDC, Blue Dart, Delhivery) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-850 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleSwitchCourier('DTDC')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedCourier === 'DTDC'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
                  }`}
                >
                  DTDC
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchCourier('BLUEDART')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedCourier === 'BLUEDART'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
                  }`}
                >
                  Blue Dart
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchCourier('DELHIVERY')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedCourier === 'DELHIVERY'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
                  }`}
                >
                  Delhivery
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-400">Home Hub</span>
                <span>/</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{currentConfig.fullName}</span>
                </span>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="no-print">
              <QuickPresetsBar
                currentConfig={currentConfig}
                currentPresets={currentPresets}
                activePresetId={activePresetId}
                onApplyPreset={applyPreset}
                layoutMode={billData.layoutMode}
                paperSaveMode={billData.paperSaveMode}
                onUpdateField={updateField}
                onClearAll={handleClearOldData}
              />
            </div>

            {/* Split Screen Layout: Form & Live A4 Print Sheet */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Input Form & Tools */}
              <div className="xl:col-span-5 space-y-3 no-print">
                <SnipToolHandler
                  onDataExtracted={handleOcrExtracted}
                  onClearOldData={handleClearOldData}
                  currentAwb={billData.awb}
                  currentCourier={selectedCourier}
                  onSelectCourier={handleSwitchCourier}
                />

                <ConsignorForm
                  billData={billData}
                  onUpdateField={updateField}
                  onApplyConsignor={applyFrequentConsignor}
                  onOpenAddressBook={() => setShowAddressBookModal(true)}
                />

                <CourierChargesCard
                  charges={billData.courierCharges}
                  onUpdateField={updateField}
                />

                <ConsigneeForm
                  billData={billData}
                  onUpdateField={updateField}
                  onOpenAddressBook={() => setShowAddressBookModal(true)}
                />

                <ShipmentSpecsForm
                  billData={billData}
                  currentConfig={currentConfig}
                  onUpdateField={updateField}
                  onGenerateNewAwb={handleGenerateNewAwb}
                />

                <BookingBranchCard
                  billData={billData}
                  onUpdateField={updateField}
                />
              </div>

              {/* RIGHT COLUMN: Real-Time Preview & Quick Export */}
              <div className="xl:col-span-7 space-y-3">
                <div className="no-print">
                  <BillExportBar
                    currentConfig={currentConfig}
                    billData={billData}
                    isExporting={isExporting}
                    onDirectPrint={handleDirectPrint}
                    onExportPdf={handleExportPdf}
                    onExportPng={handleExportPng}
                    onExportHtml={handleExportHtml}
                    onUpdateField={updateField}
                    onShareWhatsAppCard={() => setShowServiceCardModal(true)}
                    onDispatchReceipt={() => setShowReceiptDispatchModal(true)}
                  />
                </div>

                {exportNotice && (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-lg text-xs font-semibold flex items-center justify-between no-print shadow-2xs">
                    <span>{exportNotice}</span>
                    <span className="text-[10px] text-blue-600 font-mono">{currentConfig.shortName}</span>
                  </div>
                )}

                {/* PREVIEW CONTAINER: EXACT A4 CANVAS */}
                <div className="invoice-preview-wrapper bg-slate-200/70 dark:bg-slate-800/40 p-2 md:p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner overflow-x-auto flex justify-center">
                  <PrintSheet
                    data={billData}
                    customLogoUrl={customLogoUrl}
                    sheetRef={printAreaRef}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals directly triggered from Home Hub Cards */}
      {showAddressBookModal && (
        <AddressBookModal
          onSelectAddress={(addr, asType) => {
            if (asType === 'FROM') {
              applyFrequentConsignor({
                name: addr.name,
                address: [addr.addressLine1, addr.addressLine2, addr.landmark].filter(Boolean).join(', '),
                phone: addr.mobile,
                origin: addr.city,
                depot: addr.city,
              });
            } else {
              updateField('consigneeName', addr.name);
              updateField('consigneeAddress', [addr.addressLine1, addr.addressLine2, addr.landmark, `${addr.city}, ${addr.state} - ${addr.pinCode}`].filter(Boolean).join(', '));
              if (addr.mobile) updateField('consigneePhone', addr.mobile);
              updateField('dest', addr.city);
            }
            setShowAddressBookModal(false);
          }}
          onClose={() => setShowAddressBookModal(false)}
        />
      )}

      {showHistoryModal && (
        <PrintHistoryModal
          onReprint={(item) => {
            setCurrentView('courier-print');
            setShowHistoryModal(false);
          }}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showBulkModal && (
        <BulkModeModal
          from={DEFAULT_SENDER}
          settings={{
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
          }}
          onClose={() => setShowBulkModal(false)}
          onDirectBatchPrint={() => {
            window.print();
            setShowBulkModal(false);
          }}
        />
      )}

      {/* Locked Settings Modal */}
      <LockedSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        customLogoUrl={customLogoUrl}
        onLogoUpload={(url) => setCustomLogoUrl(url)}
      />

      {/* Digital Service Card & Custom Pamphlet WhatsApp Modal */}
      {showServiceCardModal && (
        <ServiceCardModal
          currentSender={DEFAULT_SENDER}
          currentRecipientMobile={billData.consigneePhone}
          currentRecipientName={billData.consigneeName}
          onClose={() => setShowServiceCardModal(false)}
        />
      )}

      {/* Automated Receipt & 5-Star Google Reviews Dispatch Modal */}
      {showReceiptDispatchModal && (
        <ReceiptDispatchModal
          isOpen={showReceiptDispatchModal}
          onClose={() => setShowReceiptDispatchModal(false)}
          billData={billData}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenServiceCard={() => setShowServiceCardModal(true)}
        />
      )}
    </div>
  );
}
