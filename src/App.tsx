import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DTDCBillData, PresetLabel, OCRMatchResult, CourierType } from './types';
import { INITIAL_BILL_DATA } from './data/defaults';
import { COURIER_CONFIGS, COURIER_PRESETS, generateAwbNumber } from './data/courierConfigs';
import { WindowsTitlebar } from './components/WindowsTitlebar';
import { HomeNavigationTabs, ActiveNavTab } from './components/HomeNavigationTabs';
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
import { downloadBillAsPdf, downloadBillAsPng, downloadBillAsHtml } from './utils/exportHelpers';
import { cleanAddressString } from './utils/ocrParser';

export default function App() {
  const [selectedCourier, setSelectedCourier] = useState<CourierType>('DTDC');
  const [billData, setBillData] = useState<DTDCBillData>(() => ({
    ...INITIAL_BILL_DATA,
    courier: 'DTDC',
  }));
  const [activeTab, setActiveTab] = useState<'generator' | 'label-printing'>('generator');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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

  // Compute active navigation tab for the 4-tab Home Navigation
  const activeNavTab: ActiveNavTab = useMemo(() => {
    if (activeTab === 'label-printing') return 'label-printing';
    if (selectedCourier === 'BLUEDART') return 'bluedart-generator';
    if (selectedCourier === 'DELHIVERY') return 'delhivery-generator';
    return 'dtdc-generator';
  }, [activeTab, selectedCourier]);

  // Direct print handler: triggers native print dialog directly on Page 1 without phantom blank page
  const handleDirectPrint = useCallback(() => {
    window.print();
  }, []);

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

  // Switch courier tab handler
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
        product: isDefaultProductOfAny ? config.defaultProducts[0] : prev.product,
        awb: generateAwbNumber(courier),
      };
    });

    const presets = COURIER_PRESETS[courier];
    if (presets && presets.length > 0) {
      setActivePresetId(presets[0].id);
    }
  }, []);

  // Navigation tab switcher for the 4 main tabs
  const handleSelectNavTab = useCallback((tab: ActiveNavTab) => {
    if (tab === 'label-printing') {
      setActiveTab('label-printing');
    } else if (tab === 'dtdc-generator') {
      setActiveTab('generator');
      handleSwitchCourier('DTDC');
    } else if (tab === 'bluedart-generator') {
      setActiveTab('generator');
      handleSwitchCourier('BLUEDART');
    } else if (tab === 'delhivery-generator') {
      setActiveTab('generator');
      handleSwitchCourier('DELHIVERY');
    }
  }, [handleSwitchCourier]);

  // Field change helper
  const updateField = useCallback((field: keyof DTDCBillData, value: any) => {
    setBillData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Generate new AWB for current courier
  const handleGenerateNewAwb = useCallback(() => {
    const newAwb = generateAwbNumber(selectedCourier);
    updateField('awb', newAwb);
  }, [selectedCourier, updateField]);

  // OCR extraction callback: Maps ALL available recipient details to input fields
  const handleOcrExtracted = useCallback((extracted: OCRMatchResult, detectedAwb?: string) => {
    // If OCR detected a different courier, sync active courier tab
    if (extracted.detectedCourier && extracted.detectedCourier !== selectedCourier) {
      handleSwitchCourier(extracted.detectedCourier);
    }

    setBillData((prev) => {
      const targetConsigneeName = extracted.consigneeName || prev.consigneeName;
      const cleanConsigneeAddr = cleanAddressString(
        extracted.consigneeAddress !== undefined ? extracted.consigneeAddress : prev.consigneeAddress,
        targetConsigneeName
      );

      return {
        ...prev,
        courier: extracted.detectedCourier || prev.courier || selectedCourier,
        awb: extracted.awb || detectedAwb || prev.awb,
        origin: extracted.origin || prev.origin,
        dest: extracted.dest || prev.dest,
        product: extracted.product || prev.product,
        type: extracted.type || prev.type,
        mode: extracted.mode || prev.mode,
        date: extracted.date || prev.date,
        // STRICT RECIPIENT / DESTINATION MAPPING
        consigneeName: targetConsigneeName,
        consigneeAddress: cleanConsigneeAddr,
        consigneePhone: extracted.consigneePhone || prev.consigneePhone,
        customerRefNo: extracted.customerRefNo || prev.customerRefNo,
        consigneeGstin: extracted.consigneeGstin || prev.consigneeGstin,
        // CONSIGNOR DETAILS
        consignorName: extracted.consignorName || prev.consignorName,
        consignorAddress: extracted.consignorAddress || prev.consignorAddress,
        consignorPhone: extracted.consignorPhone || prev.consignorPhone,
        consignorGstin: extracted.consignorGstin || prev.consignorGstin,
        // SHIPMENT SPECS
        contentSpec: extracted.contentSpec || prev.contentSpec || (extracted.type === 'DOCUMENT' ? 'DOCUMENTS' : 'ELECTRIC ITEMS'),
        declaredValue: extracted.declaredValue || prev.declaredValue,
        pieces: extracted.pieces || prev.pieces,
        actualWeight: extracted.actualWeight || prev.actualWeight,
        chargedWeight: extracted.chargedWeight || prev.chargedWeight,
        dim: extracted.dim || prev.dim,
        courierCharges: extracted.courierCharges !== undefined ? extracted.courierCharges : prev.courierCharges,
      };
    });
  }, [selectedCourier, handleSwitchCourier]);

  // Clear old data button logic
  const handleClearOldData = useCallback(() => {
    setBillData((prev) => ({
      ...prev,
      courier: selectedCourier,
      awb: generateAwbNumber(selectedCourier),
      customerRefNo: '',
      consigneeName: '',
      consigneeAddress: '',
      consigneePhone: '',
      consigneeGstin: '',
      consigneeEmail: '',
      origin: 'SATNA',
      dest: '',
      contentSpec: 'ELECTRIC ITEMS',
      paperworkEnclosed: '',
      declaredValue: 'Not Applicable',
      actualWeight: '',
      chargedWeight: '',
      dim: '10 cm X 10 cm X 10 cm',
      ewaybillNumber: '',
      remark: '',
    }));
  }, [selectedCourier]);

  // Preset selector
  const applyPreset = useCallback((preset: PresetLabel) => {
    setActivePresetId(preset.id);
    setBillData((prev) => ({
      ...prev,
      courier: selectedCourier,
      ...preset.data,
    }));
  }, [selectedCourier]);

  // Apply frequent consignor
  const applyFrequentConsignor = useCallback((consignor: { name: string; address: string; phone: string }) => {
    setBillData((prev) => ({
      ...prev,
      consignorName: consignor.name,
      consignorAddress: consignor.address,
      consignorPhone: consignor.phone,
    }));
  }, []);

  // Export handlers
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
    } catch {
      setExportNotice('Error generating PDF');
    } finally {
      setIsExporting(false);
    }
  }, [billData]);

  const handleExportHtml = useCallback(() => {
    downloadBillAsHtml(billData);
    setExportNotice('✅ HTML File Downloaded!');
    setTimeout(() => setExportNotice(null), 3000);
  }, [billData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
      {/* 1. Clean Rebranded Desktop Titlebar */}
      <WindowsTitlebar
        onPrint={handleDirectPrint}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* 2. REQUIREMENT 3: Centered 4-Tab Home Navigation */}
      <HomeNavigationTabs
        activeTab={activeNavTab}
        onSelectTab={handleSelectNavTab}
        selectedCourier={selectedCourier}
      />

      {/* 3. Main Workspace Container with Smooth Fade Transitions */}
      <main className="flex-1 p-3 md:p-5 max-w-[1920px] w-full mx-auto transition-all duration-300">
        {activeTab === 'label-printing' && (
          <div className="animate-fadeIn">
            <LabelPrintingManager />
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="animate-fadeIn">
            {/* Quick Presets Bar */}
            <QuickPresetsBar
              currentConfig={currentConfig}
              currentPresets={currentPresets}
              activePresetId={activePresetId}
              onApplyPreset={applyPreset}
              layoutMode={billData.layoutMode}
              paperSaveMode={billData.paperSaveMode}
              onUpdateField={updateField}
            />

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
                />

                <CourierChargesCard
                  charges={billData.courierCharges}
                  onUpdateField={updateField}
                />

                <ConsigneeForm
                  billData={billData}
                  onUpdateField={updateField}
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
                <BillExportBar
                  currentConfig={currentConfig}
                  billData={billData}
                  isExporting={isExporting}
                  onDirectPrint={handleDirectPrint}
                  onExportPdf={handleExportPdf}
                  onExportPng={handleExportPng}
                  onExportHtml={handleExportHtml}
                  onUpdateField={updateField}
                />

                {exportNotice && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold flex items-center justify-between no-print shadow-2xs">
                    <span>{exportNotice}</span>
                    <span className="text-[10px] text-blue-600 font-mono">{currentConfig.shortName}</span>
                  </div>
                )}

                {/* PREVIEW CONTAINER: EXACT A4 CANVAS */}
                <div className="invoice-preview-wrapper bg-slate-200/70 p-2 md:p-4 rounded-xl border border-slate-300 shadow-inner overflow-x-auto flex justify-center">
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

      {/* 4. Locked Settings Modal */}
      <LockedSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        customLogoUrl={customLogoUrl}
        onLogoUpload={(url) => setCustomLogoUrl(url)}
      />
    </div>
  );
}
