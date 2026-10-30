import React, { useState, useEffect } from 'react';
import {
  Share2,
  Send,
  Copy,
  Check,
  X,
  ExternalLink,
  Star,
  QrCode,
  ShieldAlert,
  Building,
  FileText,
  MapPin,
  Sparkles,
  Phone,
  Settings,
  HelpCircle,
  Eye,
  Printer,
} from 'lucide-react';
import { DTDCBillData, GoogleReviewsConfig } from '../types';
import {
  getStoredGoogleReviewsConfig,
  formatGoogle5StarReviewUrl,
  generateReceiptDispatchMessage,
  generateQrCodeDataUrl,
  getCourierTrackingUrl,
} from '../utils/googleReviews';
import { GoogleReviewsCounterStand } from './GoogleReviewsCounterStand';

interface ReceiptDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: DTDCBillData;
  onOpenSettings?: () => void;
  onOpenServiceCard?: () => void;
}

export const ReceiptDispatchModal: React.FC<ReceiptDispatchModalProps> = ({
  isOpen,
  onClose,
  billData,
  onOpenSettings,
  onOpenServiceCard,
}) => {
  const [config, setConfig] = useState<GoogleReviewsConfig>(getStoredGoogleReviewsConfig);
  const [targetType, setTargetType] = useState<'sender' | 'receiver'>('sender');

  const senderMobile = (billData.consignorPhone || '').replace(/\D/g, '').slice(-10);
  const receiverMobile = (billData.consigneePhone || '').replace(/\D/g, '').slice(-10);

  const [activeMobile, setActiveMobile] = useState<string>(senderMobile || receiverMobile || '');
  const [activeName, setActiveName] = useState<string>(
    billData.consignorName || billData.consigneeName || 'Customer'
  );

  const [qrCodeBiz1, setQrCodeBiz1] = useState<string>('');
  const [qrCodeBiz2, setQrCodeBiz2] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [showQrModal, setShowQrModal] = useState<'biz1' | 'biz2' | null>(null);
  const [showCounterStand, setShowCounterStand] = useState(false);

  // Check if pamphlet exists in localStorage
  const hasCustomPamphlet = Boolean(
    localStorage.getItem('courierprint_custom_pamphlet_image_v1')
  );

  // Sync recipient when target changes
  useEffect(() => {
    if (targetType === 'sender') {
      setActiveMobile(senderMobile);
      setActiveName(billData.consignorName || 'Customer');
    } else {
      setActiveMobile(receiverMobile);
      setActiveName(billData.consigneeName || 'Recipient');
    }
  }, [targetType, billData.consignorName, billData.consigneeName, senderMobile, receiverMobile]);

  // Load fresh config on open
  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredGoogleReviewsConfig();
      setConfig(cfg);

      // Generate QR codes
      if (cfg.business1.reviewUrl) {
        generateQrCodeDataUrl(formatGoogle5StarReviewUrl(cfg.business1.reviewUrl), 200).then(
          setQrCodeBiz1
        );
      }
      if (cfg.business2.reviewUrl) {
        generateQrCodeDataUrl(formatGoogle5StarReviewUrl(cfg.business2.reviewUrl), 200).then(
          setQrCodeBiz2
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullMessage = generateReceiptDispatchMessage({
    billData,
    config,
    target: targetType,
    recipientName: activeName,
    recipientMobile: activeMobile,
    hasCustomPamphlet,
  });

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  const handleCopySms = async () => {
    const courier = billData.courier || 'DTDC';
    const awb = billData.awb || 'N/A';
    const tracking = getCourierTrackingUrl(courier, awb);
    const revUrl = formatGoogle5StarReviewUrl(config.business1.reviewUrl);
    const sms = `Dear Customer, courier (${courier}) booked with Maa Sharda Ent. AWB: ${awb} to ${billData.dest || ''}. Track: ${tracking} Rate 5-Star: ${revUrl}`;
    try {
      await navigator.clipboard.writeText(sms);
      setCopiedSms(true);
      setTimeout(() => setCopiedSms(false), 2500);
    } catch {}
  };

  const handleSendWhatsApp = () => {
    const cleanNumber = activeMobile.replace(/\D/g, '').slice(-10);
    const encoded = encodeURIComponent(fullMessage);
    const url =
      cleanNumber.length === 10
        ? `https://wa.me/91${cleanNumber}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
    
    // Iframe-safe link trigger
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#0c2340] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Receipt Dispatch & 5-Star Google Reviews
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  100% Free WhatsApp
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Send booking confirmation, service card & 1-tap 5-star review links to customer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCounterStand(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Print Tabletop Desk QR Standee for Shop Counter"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desk QR Standee</span>
              <span className="sm:hidden">QR Stand</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800">
          {/* 1. Recipient Selection Row */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Send To:</span>
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTargetType('sender')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    targetType === 'sender'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Sender (Consignor)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('receiver')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    targetType === 'receiver'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Receiver (Consignee)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[260px] justify-end">
              <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                <span className="text-xs text-slate-500 font-medium">Name:</span>
                <input
                  type="text"
                  value={activeName}
                  onChange={(e) => setActiveName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full text-xs font-semibold px-2 py-1 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-600">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={activeMobile}
                  onChange={(e) => setActiveMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit Mobile"
                  className="w-full text-xs font-mono font-bold px-2 py-1 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Google Maps Policy & 1-Tap Solution Notice */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Google Maps Review Security & 1-Tap Solution</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-800">
              <strong>Google Policy Note:</strong> Google strictly does <em>not</em> allow any third-party app to silently or automatically post reviews without user action (doing so violates Google Terms and can cause Google Business Profiles to be permanently banned).
            </p>
            <p className="text-[11.5px] leading-relaxed text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <strong>✨ The 1-Tap Solution:</strong> Hamare banaye direct 5-star link par customer jaise hi click karta hai, Google Maps me seedha 5-star rating select hokar review box khul jata hai. Customer ko sirf ek bar <strong>"Post"</strong> dabana hota hai (sirf 2 second ka kaam)!
            </p>
          </div>

          {/* 3. The 2 Google Business Profiles Configured */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Your 2 Google Business Profiles:</span>
              </span>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure Place IDs / Links</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Business 1 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-[210px]">
                        {config.business1.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[210px]">
                        {config.business1.tagline}
                      </p>
                    </div>
                  </div>

                  {qrCodeBiz1 && (
                    <button
                      type="button"
                      onClick={() => setShowQrModal('biz1')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>5-Star 1-Tap Ready</span>
                  </span>
                  <a
                    href={formatGoogle5StarReviewUrl(config.business1.reviewUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <span>Test Review Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Business 2 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-[210px]">
                        {config.business2.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[210px]">
                        {config.business2.tagline}
                      </p>
                    </div>
                  </div>

                  {qrCodeBiz2 && (
                    <button
                      type="button"
                      onClick={() => setShowQrModal('biz2')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>5-Star 1-Tap Ready</span>
                  </span>
                  <a
                    href={formatGoogle5StarReviewUrl(config.business2.reviewUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <span>Test Review Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Live Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>WhatsApp Message Preview (Bundles Receipt + Pamphlet + 2 Review Links):</span>
              </span>
              {onOpenServiceCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenServiceCard();
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View / Edit Visiting Card & Pamphlet</span>
                </button>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap select-text border border-slate-700 shadow-inner">
              {fullMessage}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied Full Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy WhatsApp Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopySms}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedSms ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied SMS!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Short SMS</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send on WhatsApp (1-Click)</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Pop-up Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-3 animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-900">
              Scan to Give 5-Star Review
            </h3>
            <p className="text-xs text-slate-500">
              {showQrModal === 'biz1' ? config.business1.name : config.business2.name}
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-xl inline-block shadow-inner">
              <img
                src={showQrModal === 'biz1' ? qrCodeBiz1 : qrCodeBiz2}
                alt="5-Star Review QR"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Point phone camera to open 5-star review page directly
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(null)}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Close QR
            </button>
          </div>
        </div>
      )}

      {/* Standee Desk Display Print Modal */}
      {showCounterStand && (
        <GoogleReviewsCounterStand
          isOpen={showCounterStand}
          onClose={() => setShowCounterStand(false)}
        />
      )}
    </div>
  );
};
