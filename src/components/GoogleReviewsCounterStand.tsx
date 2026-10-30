import React, { useEffect, useState } from 'react';
import { X, Printer, Star, QrCode, Building2, MapPin, Phone, Sparkles } from 'lucide-react';
import { GoogleReviewsConfig } from '../types';
import {
  getStoredGoogleReviewsConfig,
  formatGoogle5StarReviewUrl,
  generateQrCodeDataUrl,
} from '../utils/googleReviews';

interface GoogleReviewsCounterStandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleReviewsCounterStand: React.FC<GoogleReviewsCounterStandProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<GoogleReviewsConfig>(getStoredGoogleReviewsConfig);
  const [qrBiz1, setQrBiz1] = useState<string>('');
  const [qrBiz2, setQrBiz2] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredGoogleReviewsConfig();
      setConfig(cfg);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Counter Display Standee (Google 5★ Reviews)</h2>
              <p className="text-[11px] text-slate-300">
                Desk stand flyer for shop counter - customers scan QR with smartphone camera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Standee (Ctrl+P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Standee Sheet (A4 or Half Page) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div
            id="counter-standee-printable"
            className="bg-white w-full max-w-[620px] p-6 sm:p-8 rounded-2xl border-4 border-amber-500 shadow-xl text-center space-y-5 print:border-4 print:border-amber-600 print:shadow-none print:w-full print:p-6"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          >
            {/* Header with Circular Logo */}
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

            {/* Main 5-Star Call to Action Banner */}
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

            {/* 2 Businesses Side-by-Side QR Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Profile 1 */}
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
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>Scan to Rate 5-Stars</span>
                  </div>
                </div>
              )}

              {/* Profile 2 */}
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
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>Scan to Rate 5-Stars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 3-Step Scan Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-around text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">1</span>
                <span>Open Phone Camera 📸</span>
              </span>
              <span>➔</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">2</span>
                <span>Point at QR Code</span>
              </span>
              <span>➔</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">3</span>
                <span>Tap 5-Stars & Post ⭐</span>
              </span>
            </div>

            {/* Footer Address & Helpline */}
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Main Market & Station Road, Satna (M.P.)</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>+91 9827012345 / 9425178910</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
