import React, { useState, useRef, useEffect } from 'react';
import {
  CourierAddress,
  DualOcrResult,
} from '../../types/courierPrint';
import {
  toUpperClean,
  lookupPinCode,
  parseRawAddressText,
  INDIAN_STATES,
} from '../../utils/indianPostalData';
import { runCourierOcr } from '../../utils/tesseractOcr';
import {
  FileText,
  Upload,
  Camera,
  Edit3,
  ArrowLeftRight,
  ClipboardPaste,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Split,
  Eye,
} from 'lucide-react';

interface AddressInputTabsProps {
  to: CourierAddress;
  from: CourierAddress;
  onChangeTo: (to: CourierAddress) => void;
  onChangeFrom: (from: CourierAddress) => void;
  onSwapAddresses: () => void;
  onOpenAddressBook: () => void;
  onOpenDualVerification: (res: DualOcrResult) => void;
}

export const AddressInputTabs: React.FC<AddressInputTabsProps> = ({
  to,
  from,
  onChangeTo,
  onChangeFrom,
  onSwapAddresses,
  onOpenAddressBook,
  onOpenDualVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'PASTE' | 'UPLOAD' | 'OCR'>('MANUAL');
  const [targetType, setTargetType] = useState<'TO' | 'FROM'>('TO');

  // Paste Text state
  const [pastedText, setPastedText] = useState('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [forceDualSplit, setForceDualSplit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Handle direct text parse
  const handleParseText = () => {
    if (!pastedText.trim()) return;
    const parsed = parseRawAddressText(pastedText);
    if (targetType === 'TO') {
      onChangeTo({ ...parsed, id: to.id || 'to-addr' });
      setPasteNotice(`✅ Receiver (TO) updated from unformatted text!`);
    } else {
      onChangeFrom({ ...parsed, id: from.id || 'from-addr' });
      setPasteNotice(`✅ Sender (FROM) updated from unformatted text!`);
    }
    setTimeout(() => setPasteNotice(null), 3000);
  };

  // Process an image through Tesseract OCR
  const processImageFile = async (file: File) => {
    setIsScanning(true);
    setOcrProgress(10);
    setOcrStatusText('Loading image...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const res = await runCourierOcr(dataUrl, forceDualSplit, (pct: number, status: string) => {
            setOcrProgress(pct);
            setOcrStatusText(status);
          });

          if (res.isSplitDual || (res.sender?.name && res.receiver?.name)) {
            // Open Dual Verification modal
            onOpenDualVerification(res);
          } else {
            // Single address extracted
            if (targetType === 'TO') {
              onChangeTo({
                ...to,
                ...(res.receiver as CourierAddress),
                id: to.id,
              });
            } else {
              onChangeFrom({
                ...from,
                ...(res.receiver as CourierAddress),
                id: from.id,
              });
            }
          }
        } catch (err: any) {
          console.error('OCR recognition error:', err);
          alert('OCR failed: ' + (err.message || 'Could not recognize address text'));
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Global Clipboard paste listener for Ctrl+V images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [forceDualSplit, targetType]);

  const handlePinChange = (val: string, isTo: boolean) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    if (isTo) {
      const lookup = lookupPinCode(clean);
      onChangeTo({
        ...to,
        pinCode: clean,
        state: lookup && !to.state ? lookup.state : to.state,
        city: lookup && !to.city ? lookup.sampleCity : to.city,
      });
    } else {
      const lookup = lookupPinCode(clean);
      onChangeFrom({
        ...from,
        pinCode: clean,
        state: lookup && !from.state ? lookup.state : from.state,
        city: lookup && !from.city ? lookup.sampleCity : from.city,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Address Inputs
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono">
            Auto-Caps On
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenAddressBook}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            title="Saved Address Book"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Address Book</span>
          </button>

          <button
            type="button"
            onClick={onSwapAddresses}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            title="Swap TO and FROM details"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap TO ⇄ FROM</span>
          </button>
        </div>
      </div>

      {/* Input Method Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('MANUAL')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'MANUAL'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Manual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PASTE')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'PASTE'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Paste Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('UPLOAD')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'UPLOAD'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OCR')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'OCR'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>OCR Slip</span>
        </button>
      </div>

      {/* Target Selector (when pasting or uploading) */}
      {activeTab !== 'MANUAL' && (
        <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Extract directly into:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTargetType('TO')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                targetType === 'TO'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              TO (Receiver)
            </button>
            <button
              type="button"
              onClick={() => setTargetType('FROM')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                targetType === 'FROM'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              FROM (Sender)
            </button>
          </div>
        </div>
      )}

      {/* ================= METHOD 1: MANUAL ENTRY ================= */}
      {activeTab === 'MANUAL' && (
        <div className="space-y-4">
          {/* TO (RECEIVER) FORM - PROMINENT */}
          <div className="border border-blue-200 dark:border-blue-900/60 rounded-lg p-3 bg-blue-50/20 dark:bg-blue-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <span>TO (RECEIVER ADDRESS)</span>
                <span className="text-[10px] font-normal text-slate-500">• Top Wide Box</span>
              </span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">
                MANDATORY UPPERCASE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  RECIPIENT FULL NAME *
                </label>
                <input
                  type="text"
                  value={to.name}
                  onChange={(e) => onChangeTo({ ...to, name: toUpperClean(e.target.value) })}
                  placeholder="E.G. RAJESH KUMAR SHARMA"
                  className="w-full uppercase text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  COMPANY / SHOP / FIRM
                </label>
                <input
                  type="text"
                  value={to.company || ''}
                  onChange={(e) => onChangeTo({ ...to, company: toUpperClean(e.target.value) })}
                  placeholder="OPTIONAL COMPANY NAME"
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                FLAT / SHOP / HOUSE NO., STREET *
              </label>
              <input
                type="text"
                value={to.addressLine1}
                onChange={(e) => onChangeTo({ ...to, addressLine1: toUpperClean(e.target.value) })}
                placeholder="FLAT 302, SAI KRIPA APTS, 7TH CROSS"
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  AREA / COLONY / SECTOR
                </label>
                <input
                  type="text"
                  value={to.addressLine2 || ''}
                  onChange={(e) => onChangeTo({ ...to, addressLine2: toUpperClean(e.target.value) })}
                  placeholder="INDIRANAGAR 1ST STAGE"
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  LANDMARK
                </label>
                <input
                  type="text"
                  value={to.landmark || ''}
                  onChange={(e) => onChangeTo({ ...to, landmark: toUpperClean(e.target.value) })}
                  placeholder="NEAR CMH HOSPITAL"
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* City, State, PIN Code inline structure */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  CITY / DISTRICT *
                </label>
                <input
                  type="text"
                  value={to.city}
                  onChange={(e) => onChangeTo({ ...to, city: toUpperClean(e.target.value) })}
                  placeholder="BENGALURU"
                  className="w-full uppercase text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  PIN CODE *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={to.pinCode}
                  onChange={(e) => handlePinChange(e.target.value, true)}
                  placeholder="560037"
                  className="w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  STATE *
                </label>
                <input
                  type="text"
                  list="states-list"
                  value={to.state}
                  onChange={(e) => onChangeTo({ ...to, state: toUpperClean(e.target.value) })}
                  placeholder="KARNATAKA"
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                MOBILE NUMBER *
              </label>
              <input
                type="text"
                maxLength={10}
                value={to.mobile || ''}
                onChange={(e) => onChangeTo({ ...to, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder="9845098765"
                className="w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* FROM (SENDER) FORM - COMPACT */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider text-slate-800 dark:text-slate-200">
                FROM (SENDER ADDRESS) • Bottom-Right Box
              </span>
              <button
                type="button"
                onClick={onOpenAddressBook}
                className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Pick Saved Sender
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  SENDER NAME *
                </label>
                <input
                  type="text"
                  value={from.name}
                  onChange={(e) => onChangeFrom({ ...from, name: toUpperClean(e.target.value) })}
                  placeholder="MAA SHARDA ENTERPRISES"
                  className="w-full uppercase text-xs font-semibold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  SENDER PHONE
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={from.mobile || ''}
                  onChange={(e) => onChangeFrom({ ...from, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="9827012345"
                  className="w-full font-mono text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                SENDER ADDRESS LINE
              </label>
              <input
                type="text"
                value={from.addressLine1}
                onChange={(e) => onChangeFrom({ ...from, addressLine1: toUpperClean(e.target.value) })}
                placeholder="SHOP 4, SIMARIYA CHOWK, MAIN ROAD"
                className="w-full uppercase text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  CITY
                </label>
                <input
                  type="text"
                  value={from.city}
                  onChange={(e) => onChangeFrom({ ...from, city: toUpperClean(e.target.value) })}
                  placeholder="SATNA"
                  className="w-full uppercase text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  PIN CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={from.pinCode}
                  onChange={(e) => handlePinChange(e.target.value, false)}
                  placeholder="485001"
                  className="w-full font-mono text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  STATE
                </label>
                <input
                  type="text"
                  list="states-list"
                  value={from.state}
                  onChange={(e) => onChangeFrom({ ...from, state: toUpperClean(e.target.value) })}
                  placeholder="MADHYA PRADESH"
                  className="w-full uppercase text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= METHOD 2: PASTE UNFORMATTED TEXT ================= */}
      {activeTab === 'PASTE' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Paste unformatted text from WhatsApp, email, or courier booking slips. Our smart parser will extract
            Name, Address, City, State, 6-digit PIN, and Phone numbers automatically.
          </div>

          <textarea
            rows={6}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Paste raw text here, e.g.:\nRajesh Kumar Sharma\nSharma Trading Corp\nFlat 302, Sai Kripa Apts\nIndiranagar 1st stage, Near CMH Hospital\nBengaluru, Karnataka 560037\nPhone: 9845098765`}
            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
          />

          {pasteNotice && (
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded border border-emerald-200 dark:border-emerald-800">
              {pasteNotice}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPastedText('')}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleParseText}
              disabled={!pastedText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse & Apply to {targetType}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= METHOD 3: UPLOAD FILE (IMAGE / PDF) ================= */}
      {activeTab === 'UPLOAD' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to browse or drop address slip image / PDF
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Supports PNG, JPG, WEBP, and PDF documents
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImageFile(file);
            }}
          />

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Tip: You can also press <strong>Ctrl+V</strong> anywhere to paste screenshots!</span>
          </div>
        </div>
      )}

      {/* ================= METHOD 4: SCAN WITH OCR & DUAL SLIP ================= */}
      {activeTab === 'OCR' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            100% offline browser-based Tesseract OCR engine. Works without internet, no data sent to external servers.
          </div>

          {/* Dual Split toggle */}
          <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                  Dual-Address (Sender + Receiver) Slip Split
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Splits horizontal courier slips in half for side-by-side verification
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={forceDualSplit}
                onChange={(e) => setForceDualSplit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Scan Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera Scan</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Image</span>
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImageFile(file);
            }}
          />

          {/* OCR Scanning Progress Banner */}
          {isScanning && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <span>{ocrStatusText || 'Running offline OCR...'}</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-200"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Clipboard Paste (Ctrl+V):</strong> Capture any address snippet with Snipping Tool (Win+Shift+S) and press <strong>Ctrl+V</strong> right here!
            </span>
          </div>
        </div>
      )}

      {/* Datalist for Indian States */}
      <datalist id="states-list">
        {INDIAN_STATES.map((st: string) => (
          <option key={st} value={st} />
        ))}
      </datalist>
    </div>
  );
};
