import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Download,
  Copy,
  Upload,
  Check,
  X,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Building,
  Image as ImageIcon,
  Send,
  Trash2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { CourierAddress } from '../types/courierPrint';
import { CourierLogo } from './CourierLogo';
import { toUpperClean } from '../utils/indianPostalData';
import { getStoredGoogleReviewsConfig, formatGoogle5StarReviewUrl } from '../utils/googleReviews';

interface ServiceCardModalProps {
  currentSender: CourierAddress;
  currentRecipientMobile?: string;
  currentRecipientName?: string;
  onClose: () => void;
}

const PAMPHLET_STORAGE_KEY = 'courierprint_custom_pamphlet_image_v1';

export const ServiceCardModal: React.FC<ServiceCardModalProps> = ({
  currentSender,
  currentRecipientMobile = '',
  currentRecipientName = '',
  onClose,
}) => {
  const [customerMobile, setCustomerMobile] = useState<string>(() => {
    return currentRecipientMobile.replace(/\D/g, '').slice(-10);
  });
  const [customerName, setCustomerName] = useState<string>(currentRecipientName || '');

  // Custom pamphlet image (Base64 saved in localStorage)
  const [customPamphletUrl, setCustomPamphletUrl] = useState<string | null>(() => {
    return localStorage.getItem(PAMPHLET_STORAGE_KEY);
  });

  // Services offered checklist
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Trackon Couriers (Prime Track / Air / Surface)',
    'Shree Maruti Courier (Fast Express & Cargo)',
    'Delhivery Express Parcel',
    'DTDC Express (Air & Surface)',
    'Blue Dart Priority Delivery',
    'Free Doorstep Parcel Pickup',
  ]);

  const [businessTimings, setBusinessTimings] = useState<string>('Mon - Sat: 9:00 AM - 9:00 PM');
  const [specialNote, setSpecialNote] = useState<string>('Best courier rates & fast delivery guaranteed!');
  const [copiedText, setCopiedText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cardPreviewRef = useRef<HTMLDivElement | null>(null);

  // Handle uploading custom pamphlet
  const handlePamphletUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomPamphletUrl(dataUrl);
        try {
          localStorage.setItem(PAMPHLET_STORAGE_KEY, dataUrl);
        } catch (err) {
          console.warn('Could not save pamphlet to localStorage', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPamphlet = () => {
    if (confirm('Remove custom pamphlet and restore standard digital service card?')) {
      setCustomPamphletUrl(null);
      localStorage.removeItem(PAMPHLET_STORAGE_KEY);
    }
  };

  // Generate formatted WhatsApp message text
  const generateWhatsAppMessage = (): string => {
    const senderName = toUpperClean(currentSender.name || 'COURIER DISPATCH HUB');
    const senderCompany = currentSender.company ? `${toUpperClean(currentSender.company)}\n` : '';
    const phone = currentSender.mobile || '9827012345';
    const address = [currentSender.addressLine1, currentSender.addressLine2, currentSender.landmark]
      .filter(Boolean)
      .join(', ');
    const cityPin = `${currentSender.city || 'CITY'}, ${currentSender.state || 'STATE'} - ${currentSender.pinCode || '000000'}`;

    const greeting = customerName ? `Namaste *${customerName.trim()}* Ji! 🙏\n\n` : `Namaste! 🙏\n\n`;

    const gConfig = getStoredGoogleReviewsConfig();
    let reviewText = '';
    if (gConfig.business1.enabled || gConfig.business2.enabled) {
      reviewText = `⭐ *Rate Us 5-Stars on Google Maps:*\n`;
      if (gConfig.business1.enabled && gConfig.business1.reviewUrl) {
        reviewText += `🏢 1. ${gConfig.business1.name}:\n👉 ${formatGoogle5StarReviewUrl(gConfig.business1.reviewUrl)}\n`;
      }
      if (gConfig.business2.enabled && gConfig.business2.reviewUrl) {
        reviewText += `🏢 2. ${gConfig.business2.name}:\n👉 ${formatGoogle5StarReviewUrl(gConfig.business2.reviewUrl)}\n`;
      }
      reviewText += `━━━━━━━━━━━━━━━━━━━━\n`;
    }

    return (
      `${greeting}` +
      `📦 *${senderName}*\n` +
      `${senderCompany}` +
      `_Authorized Multi-Courier & Logistics Booking Center_\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 *Our Available Courier Services:*\n` +
      selectedServices.map((s) => `• ${s}`).join('\n') +
      `\n\n` +
      `📍 *Counter Address:*\n` +
      `${address}\n` +
      `*${cityPin}*\n\n` +
      `📞 *Call / WhatsApp for Booking:*\n` +
      `*+91 ${phone}*\n\n` +
      `⏱️ *Timings:* ${businessTimings}\n` +
      `💡 *Note:* _${specialNote}_\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      reviewText +
      `_Save our contact number for quick courier rates & live parcel tracking!_`
    );
  };

  // 1-Click WhatsApp Direct Send (100% FREE Click-to-Chat)
  const handleSendWhatsApp = () => {
    const cleanNumber = customerMobile.replace(/\D/g, '').slice(-10);
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);

    let url = '';
    if (cleanNumber.length === 10) {
      url = `https://wa.me/91${cleanNumber}?text=${encoded}`;
    } else {
      url = `https://wa.me/?text=${encoded}`;
    }

    // Open WhatsApp safely in all environments
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy message to clipboard
  const handleCopyText = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  // Download pamphlet image
  const handleDownloadPamphlet = () => {
    if (customPamphletUrl) {
      const link = document.createElement('a');
      link.href = customPamphletUrl;
      link.download = `${currentSender.name.replace(/\s+/g, '_')}_Pamphlet.png`;
      link.click();
    } else {
      alert('Custom pamphlet image is not uploaded yet. You can upload your pamphlet file below!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Digital Service Card & Pamphlet</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">
                  100% FREE WHATSAPP
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send your agency pamphlet, contact details, and courier services list to any customer in 1 click
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace: 2-Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 flex-1 overflow-y-auto pr-1">
          {/* LEFT COLUMN: Digital Card / Pamphlet Preview (5 Cols) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {customPamphletUrl ? 'Custom Pamphlet / Flyer' : 'Auto-Generated Service Card'}
              </span>
              {customPamphletUrl && (
                <button
                  type="button"
                  onClick={handleRemoveCustomPamphlet}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Visual Card Display Stage */}
            <div
              ref={cardPreviewRef}
              className="relative rounded-2xl overflow-hidden shadow-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex flex-col justify-between"
            >
              {customPamphletUrl ? (
                // Custom Uploaded Pamphlet Image Display
                <div className="relative group">
                  <img
                    src={customPamphletUrl}
                    alt="Custom Agency Pamphlet"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md cursor-pointer"
                    >
                      Change Pamphlet
                    </button>
                  </div>
                </div>
              ) : (
                // Auto-Generated Enterprise Visiting Card
                <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white space-y-3.5">
                  {/* Top Branding & Courier Badges */}
                  <div className="flex items-center gap-3 border-b border-blue-500/20 pb-3">
                    <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-md shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src="/assets/aistudio/logo_87b71685.jpg"
                        alt="Maa Sharda Enterprises"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                        Authorized Booking Center
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
                        {toUpperClean(currentSender.name || 'MAA SHARDA ENTERPRISES')}
                      </h3>
                      {currentSender.company && (
                        <div className="text-[11px] text-blue-200/80 uppercase font-medium">
                          {toUpperClean(currentSender.company)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Courier Partner Badges */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center justify-around gap-1 border border-white/10">
                    <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-rose-700">TRACKON</span>
                    <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-emerald-700">SHREE MARUTI</span>
                    <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-red-700/80">DELHIVERY</span>
                    <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-red-600/80">DTDC</span>
                    <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-blue-600/80">BLUE DART</span>
                  </div>

                  {/* Address & Contact Details */}
                  <div className="space-y-1.5 text-xs text-blue-100/90 pt-1">
                    <div className="flex items-start gap-1.5 text-[11px] leading-tight">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        {[currentSender.addressLine1, currentSender.addressLine2, currentSender.landmark].filter(Boolean).join(', ')}, {currentSender.city} - {currentSender.pinCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>+91 {currentSender.mobile || '9827012345'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-blue-200/80">
                      <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{businessTimings}</span>
                    </div>
                  </div>

                  {/* Footer Tagline */}
                  <div className="pt-2 border-t border-blue-500/20 text-[10px] text-center text-blue-300 font-mono">
                    Doorstep Pickup • Air Cargo • Surface Express
                  </div>
                </div>
              )}
            </div>

            {/* Pamphlet Upload Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>
                  {customPamphletUrl ? 'Upload Different Pamphlet Image' : 'Upload Your Own Shop Pamphlet / Visiting Card'}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePamphletUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Customer WhatsApp Dispatch Form & Message Customization (7 Cols) */}
          <div className="md:col-span-7 flex flex-col space-y-3.5">
            {/* Customer Number Input Box */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send Card to Customer WhatsApp (100% Free)</span>
                </label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  No Service Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    CUSTOMER NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="E.g. Rajesh Kumar"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    CUSTOMER WHATSAPP NUMBER *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                      +91
                    </span>
                    <input
                      type="text"
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="98XXXXXXXX"
                      className="w-full font-mono text-xs font-bold p-2 rounded-r-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Checklist */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Services Mentioned on WhatsApp Slip
              </span>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  'Trackon Couriers (Prime Track / Air / Surface)',
                  'Shree Maruti Courier (Fast Express & Cargo)',
                  'Delhivery Express Parcel',
                  'DTDC Express (Air & Surface)',
                  'Blue Dart Priority Delivery',
                  'Free Doorstep Parcel Pickup',
                ].map((service) => {
                  const isChecked = selectedServices.includes(service);
                  return (
                    <label
                      key={service}
                      className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter((s) => s !== service));
                          }
                        }}
                        className="rounded accent-emerald-600"
                      />
                      <span className="truncate">{service}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes & Timings */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  SHOP TIMINGS
                </label>
                <input
                  type="text"
                  value={businessTimings}
                  onChange={(e) => setBusinessTimings(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  PROMO NOTE / TAGLINE
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {customerMobile.length === 10
                    ? `Send Service Card to +91 ${customerMobile}`
                    : 'Open WhatsApp with Service Card (Free)'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Text Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPamphlet}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Pamphlet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
