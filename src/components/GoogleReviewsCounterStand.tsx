import React, { useEffect, useState } from 'react';
import { X, Printer, Star, MapPin, Phone } from 'lucide-react';
import { GoogleReviewsConfig } from '../types';
import {
  getStoredGoogleReviewsConfig,
  formatGoogle5StarReviewUrl,
  generateQrCodeDataUrl,
} from '../utils/googleReviews';

/**
 * ============================================================================
 * GOOGLE REVIEWS COUNTER STANDEE COMPONENT
 * ============================================================================
 * Purpose:
 *   Generates a high-contrast, physical acrylic desk standee / counter flyer
 *   for Maa Sharda Enterprises.
 *
 * Core Features:
 *   1. 1-Tap Google 5-Star Reviews: Embeds Google Review deep links with `?review=1`
 *      so mobile cameras open the star rating prompt immediately without searching.
 *   2. Dual Profile Support: Supports both the Main Logistics Hub and secondary branches.
 *   3. 100% Client-Side QR Generation: Uses `qrcode` canvas to render vector-sharp QRs
 *      offline without any third-party analytics or external network latency.
 *   4. Print Media Isolation: Injects strict CSS print rules so that `window.print()`
 *      renders ONLY this counter stand flyer on standard A4 / A5 paper, with zero
 *      bleed from the rest of the application software UI.
 *
 * Official Contact Credentials (from Verified Shop Pamphlet):
 *   - Address: Near Rest House, Satna-Panna Road, NH39, Nagod 485446 (MP)
 *   - Phone / WhatsApp Booking: +91 89820 91190
 *   - Authorized Partners: Trackon • Shree Maruti • Delhivery • DTDC • Blue Dart
 * ============================================================================
 */

interface GoogleReviewsCounterStandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleReviewsCounterStand: React.FC<GoogleReviewsCounterStandProps> = ({
  isOpen,
  onClose,
}) => {
  // Local reactive copy of Google Reviews configuration from localStorage
  const [config, setConfig] = useState<GoogleReviewsConfig>(getStoredGoogleReviewsConfig);

  // High-resolution data URLs for Profile 1 and Profile 2 QR codes
  const [qrBiz1, setQrBiz1] = useState<string>('');
  const [qrBiz2, setQrBiz2] = useState<string>('');

  /**
   * Effect: On modal open, load stored review URLs and dynamically generate QRs
   */
  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredGoogleReviewsConfig();
      setConfig(cfg);

      // Generate sharp 260x260px QR codes with high error correction
      if (cfg.business1.reviewUrl) {
        generateQrCodeDataUrl(formatGoogle5StarReviewUrl(cfg.business1.reviewUrl), 260).then(
          setQrBiz1
        );
      }
      if (cfg.business2.reviewUrl) {
        generateQrCodeDataUrl(formatGoogle5StarReviewUrl(cfg.business2.reviewUrl), 260).then(
          setQrBiz2
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Trigger standard browser physical print dialog
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none">
      {/* 
        ========================================================================
        PRINT ISOLATION STYLES
        Ensures that only the `#counter-standee-printable` element is printed.
        All surrounding modals, toolbars, and background elements are stripped out.
        ========================================================================
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #counter-standee-printable,
            #counter-standee-printable * {
              visibility: visible !important;
            }
            #counter-standee-printable {
              position: fixed !important;
              top: 5mm !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              width: 92% !important;
              max-width: 620px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              z-index: 99999999 !important;
              box-shadow: none !important;
              border: 3.5px solid #d97706 !important;
            }
          }
        `,
      }} />

      {/* Outer Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Management Header (Hidden during physical print) */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Desk QR Counter Standee (5★ Reviews)</h2>
              <p className="text-[11px] text-slate-300">
                Print ready acrylic desk flyer for shop counter - customers scan QR with smartphone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95"
              title="Print desk flyer (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Standee (Ctrl+P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Standee Sheet Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div
            id="counter-standee-printable"
            className="bg-white w-full max-w-[620px] p-6 sm:p-8 rounded-2xl border-4 border-amber-500 shadow-xl text-center space-y-4 print:border-4 print:border-amber-600 print:shadow-none print:w-full print:p-6"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          >
            {/* Header: Official Circular Emblem & Company Title */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 p-1 bg-white shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src="/assets/aistudio/logo_87b71685.jpg"
                  alt="Maa Sharda Enterprises"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight uppercase">
                  Maa Sharda Enterprises
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-amber-700 tracking-wide mt-0.5">
                  Authorized Multi-Courier & Logistics Service Center
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10.5px] font-bold text-slate-700 mt-1">
                  <span>TRACKON • SHREE MARUTI • DELHIVERY • DTDC • BLUE DART</span>
                </div>
              </div>
            </div>

            {/* Prominent 5-Star Call to Action Banner */}
            <div className="bg-linear-to-r from-amber-50 via-yellow-100 to-amber-50 border-y-2 border-amber-400 py-3 px-4">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Rate Us 5-Stars On Google Maps!
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                Aapka ek review hamari local service ko aur behtar banane me madad karta hai.
              </p>
            </div>

            {/* Profile QR Codes Grid (Side-by-side or stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Business Profile 1 */}
              {config.business1.enabled && (
                <div className="border-2 border-slate-300 rounded-xl p-3.5 bg-slate-50 flex flex-col items-center justify-between space-y-2.5">
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full font-mono">
                      PROFILE #1
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                      {config.business1.name}
                    </h3>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      {config.business1.tagline}
                    </p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
                    {qrBiz1 ? (
                      <img src={qrBiz1} alt="QR Profile 1" className="w-36 h-36 mx-auto" />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Scan to Rate 5-Stars</span>
                  </div>
                </div>
              )}

              {/* Business Profile 2 */}
              {config.business2.enabled && (
                <div className="border-2 border-slate-300 rounded-xl p-3.5 bg-slate-50 flex flex-col items-center justify-between space-y-2.5">
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono">
                      PROFILE #2
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                      {config.business2.name}
                    </h3>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      {config.business2.tagline}
                    </p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
                    {qrBiz2 ? (
                      <img src={qrBiz2} alt="QR Profile 2" className="w-36 h-36 mx-auto" />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Scan to Rate 5-Stars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simple 3-Step Guidance for Walk-in Customers */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-around text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">1</span>
                <span>Open Camera 📸</span>
              </span>
              <span>➔</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">2</span>
                <span>Point at QR</span>
              </span>
              <span>➔</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">3</span>
                <span>Tap 5-Stars ⭐</span>
              </span>
            </div>

            {/* Official Contact Footer (Nagod Rest House & 89820 91190) */}
            <div className="pt-2.5 border-t border-slate-200 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Near Rest House, Satna-Panna Road, NH39, Nagod 485446 (MP)</span>
              </span>
              <span className="flex items-center gap-1.5 font-black text-slate-950 font-mono text-xs">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+91 89820 91190</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
