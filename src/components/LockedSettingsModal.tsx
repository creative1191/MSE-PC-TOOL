import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Check,
  AlertTriangle,
  FileText,
  Sliders,
  Star,
  ExternalLink,
  MapPin,
  Save,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { GoogleReviewsConfig } from '../types';
import {
  getStoredGoogleReviewsConfig,
  saveGoogleReviewsConfig,
  DEFAULT_GOOGLE_REVIEWS_CONFIG,
  formatGoogle5StarReviewUrl,
} from '../utils/googleReviews';

interface LockedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLogoUrl: string | null;
  onLogoUpload: (url: string | null) => void;
}

export const LockedSettingsModal: React.FC<LockedSettingsModalProps> = ({
  isOpen,
  onClose,
  customLogoUrl,
  onLogoUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'google-reviews'>('google-reviews');
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewsConfig>(getStoredGoogleReviewsConfig);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGoogleConfig(getStoredGoogleReviewsConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onLogoUpload(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGoogleConfig = () => {
    saveGoogleReviewsConfig(googleConfig);
    setSaveStatus('✅ Google Business Settings Saved Successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleResetGoogleConfig = () => {
    if (confirm('Reset Google Business profiles to recommended default template?')) {
      setGoogleConfig(DEFAULT_GOOGLE_REVIEWS_CONFIG);
      saveGoogleReviewsConfig(DEFAULT_GOOGLE_REVIEWS_CONFIG);
      setSaveStatus('Restored default Google profiles.');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden animate-fadeIn flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">System & Google Business Settings</h2>
              <p className="text-[11px] text-blue-200">Strict DTDC Rules + 2 Google Maps Profiles Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded text-gray-200 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('google-reviews')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'google-reviews'
                ? 'bg-white text-blue-700 border-t border-x border-gray-200 -mb-[1px]'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Google Reviews (2 Businesses)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-white text-blue-700 border-t border-x border-gray-200 -mb-[1px]'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format & Layout Rules</span>
          </button>
        </div>

        {/* Tab 1: Google Reviews for 2 Businesses */}
        {activeTab === 'google-reviews' && (
          <div className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
            {saveStatus && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold flex items-center justify-between">
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Explanation box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Google Review Auto-Post Clarification:</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Google ka anti-fraud system kisi bhi third-party app ko customer ke account se <em>chupke se auto-review post</em> karne ki anumati nahi deta hai (is se Google Business profile ban ho sakti hai).
              </p>
              <p className="text-blue-900 text-[11.5px] font-semibold leading-relaxed">
                👉 Isliye hum <strong>1-Tap Direct 5-Star Links</strong> use karte hain: Jaise hi customer link kholta hai, seedha 5-star rating bhari hui aati hai, bas unhe ek click me 'POST' dabana hota hai!
              </p>
            </div>

            {/* Business 1 Configuration */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-slate-900">Google Business #1 (Main Profile)</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px]">
                  <input
                    type="checkbox"
                    checked={googleConfig.business1.enabled}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business1: { ...prev.business1, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Active in Receipt</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium">Business Name on Google Maps:</label>
                  <input
                    type="text"
                    value={googleConfig.business1.name}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business1: { ...prev.business1, name: e.target.value },
                      }))
                    }
                    placeholder="e.g. Maa Sharda Enterprises - Courier Booking"
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-medium">
                    Google Maps Place ID OR Direct Review Link:
                  </label>
                  <input
                    type="text"
                    value={googleConfig.business1.reviewUrl}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business1: { ...prev.business1, reviewUrl: e.target.value },
                      }))
                    }
                    placeholder="https://search.google.com/local/writereview?placeid=... OR Place ID"
                    className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Will open Google Maps with 5 stars pre-selected
                  </span>
                  <a
                    href={formatGoogle5StarReviewUrl(googleConfig.business1.reviewUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <span>Test 1-Tap Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Business 2 Configuration */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-slate-900">Google Business #2 (Second Profile / Branch)</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px]">
                  <input
                    type="checkbox"
                    checked={googleConfig.business2.enabled}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business2: { ...prev.business2, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-amber-600"
                  />
                  <span>Active in Receipt</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium">Business Name on Google Maps:</label>
                  <input
                    type="text"
                    value={googleConfig.business2.name}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business2: { ...prev.business2, name: e.target.value },
                      }))
                    }
                    placeholder="e.g. Maa Sharda Express Logistics & Cargo"
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-medium">
                    Google Maps Place ID OR Direct Review Link:
                  </label>
                  <input
                    type="text"
                    value={googleConfig.business2.reviewUrl}
                    onChange={(e) =>
                      setGoogleConfig((prev) => ({
                        ...prev,
                        business2: { ...prev.business2, reviewUrl: e.target.value },
                      }))
                    }
                    placeholder="https://search.google.com/local/writereview?placeid=... OR Place ID"
                    className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Will open Google Maps with 5 stars pre-selected
                  </span>
                  <a
                    href={formatGoogle5StarReviewUrl(googleConfig.business2.reviewUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <span>Test 1-Tap Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Auto Dispatch Options */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold text-xs">
                <input
                  type="checkbox"
                  checked={googleConfig.autoOpenAfterPrint}
                  onChange={(e) =>
                    setGoogleConfig((prev) => ({ ...prev, autoOpenAfterPrint: e.target.checked }))
                  }
                  className="rounded text-blue-600"
                />
                <span>Automatically open Receipt & Review Dispatch modal after Print / PDF export</span>
              </label>

              <div>
                <label className="text-[11px] text-slate-600 font-medium">
                  Pamphlet Public Link (Optional Google Drive or Image link):
                </label>
                <input
                  type="url"
                  value={googleConfig.pamphletLink || ''}
                  onChange={(e) =>
                    setGoogleConfig((prev) => ({ ...prev, pamphletLink: e.target.value }))
                  }
                  placeholder="https://drive.google.com/... or leave blank for digital card"
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-hidden mt-0.5"
                />
              </div>
            </div>

            {/* Save & Reset buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetGoogleConfig}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Sample Setup</span>
              </button>

              <button
                type="button"
                onClick={handleSaveGoogleConfig}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Google Profiles</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Format & Layout Rules */}
        {activeTab === 'rules' && (
          <div className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
            {/* Rule 1: Logo */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>1. Official Brand Logo (Maa Sharda Enterprises)</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  LOCKED
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                Official circular emblem with sacred Veena & lotus gold perimeter is active.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 p-0.5 overflow-hidden bg-white shrink-0 shadow-xs">
                    <img
                      src="/assets/aistudio/logo_87b71685.jpg"
                      alt="Maa Sharda Enterprises"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Official Brand Logo Active</div>
                    <div className="text-[10px] text-slate-500">Maa Sharda Enterprises gold/navy emblem</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-xs bg-white hover:bg-gray-100 text-gray-800 font-semibold px-3 py-1.5 rounded border border-gray-300 cursor-pointer shadow-2xs">
                    Upload Alternative File
                    <input type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
                  </label>
                  {customLogoUrl && (
                    <button
                      onClick={() => onLogoUpload(null)}
                      className="text-xs text-red-600 hover:underline cursor-pointer font-medium"
                    >
                      Restore Official Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Rule 2: Consignor Priority */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>2. Consignor Priority Logic</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-gray-600">
                Manual consignor input in the interface takes strict priority over any scanned text
                from customer images.
              </p>
            </div>

            {/* Rule 3: Courier Charges Format */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>3. Courier Charges Style (Simple Bordered Box Only)</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  STRICT
                </span>
              </div>
              <p className="text-gray-600">
                Formatted as a clean, bordered box:{' '}
                <code className="bg-yellow-100 px-1 font-bold">Courier Charges: ₹ [AMOUNT]</code>. No
                breakup like Freight, Fuel, GST, Tax, Discount, Subtotal, or Grand Total is added.
              </p>
            </div>

            {/* Rule 4: Negative Directives */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Negative Directives Enforced:</span>
              </div>
              <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                <li>Do not invent missing values — leave blank if unstated in document.</li>
                <li>Preserve original spelling, capitalization, and numbers.</li>
                <li>Do not alter DTDC layout, borders, font weights, or barcode positions.</li>
                <li>Preserve exact 200mm x 92mm per-copy metrics on 3-copies portrait sheets.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 p-3 flex justify-end border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="bg-[#0c2340] hover:bg-[#122b5e] text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Close & Apply Rules
          </button>
        </div>
      </div>
    </div>
  );
};
