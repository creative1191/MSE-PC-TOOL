import QRCode from 'qrcode';
import { GoogleReviewsConfig, DTDCBillData, CourierType } from '../types';

export const GOOGLE_REVIEWS_STORAGE_KEY = 'courierprint_google_reviews_config_v2';

export const DEFAULT_GOOGLE_REVIEWS_CONFIG: GoogleReviewsConfig = {
  autoOpenAfterPrint: true,
  showReviewQrOnReceipt: true,
  customMessageIntro: 'Namaste! Aapka courier Maa Sharda Enterprises se book ho gaya hai.',
  pamphletLink: '',
  business1: {
    id: 'biz1',
    name: 'Maa Sharda Enterprises (Trackon Courier)',
    tagline: 'Trackon Courier Booking Center, Satna (M.P.)',
    reviewUrl: 'https://g.page/r/CXFZojMLBwpCEAI/review',
    placeId: 'CXFZojMLBwpCEAI',
    address: 'Near Simariya Chowk, Main Road, Satna, Madhya Pradesh',
    enabled: true,
  },
  business2: {
    id: 'biz2',
    name: 'Maa Sharda Enterprises (Shree Maruti Courier)',
    tagline: 'Shree Maruti Courier Services, Satna (M.P.)',
    reviewUrl: 'https://g.page/r/CamhPWShStPKEAI/review',
    placeId: 'CamhPWShStPKEAI',
    address: 'Station Road / Simariya Chowk, Satna, Madhya Pradesh',
    enabled: true,
  },
};

/**
 * Loads saved Google reviews configuration or falls back to defaults.
 */
export function getStoredGoogleReviewsConfig(): GoogleReviewsConfig {
  try {
    const raw = localStorage.getItem(GOOGLE_REVIEWS_STORAGE_KEY);
    if (!raw) return DEFAULT_GOOGLE_REVIEWS_CONFIG;
    const parsed = JSON.parse(raw);

    // Auto-migrate from old sample Place IDs to the user's real links
    if (
      !parsed.business1?.reviewUrl ||
      parsed.business1.reviewUrl.includes('ChIJN1t_tDeuEmsRUsoyG83frY4')
    ) {
      parsed.business1 = { ...DEFAULT_GOOGLE_REVIEWS_CONFIG.business1 };
    }
    if (
      !parsed.business2?.reviewUrl ||
      parsed.business2.reviewUrl.includes('ChIJm97p8rV1EmsRMAA_SHARDA2')
    ) {
      parsed.business2 = { ...DEFAULT_GOOGLE_REVIEWS_CONFIG.business2 };
    }

    return {
      ...DEFAULT_GOOGLE_REVIEWS_CONFIG,
      ...parsed,
      business1: { ...DEFAULT_GOOGLE_REVIEWS_CONFIG.business1, ...(parsed.business1 || {}) },
      business2: { ...DEFAULT_GOOGLE_REVIEWS_CONFIG.business2, ...(parsed.business2 || {}) },
    };
  } catch {
    return DEFAULT_GOOGLE_REVIEWS_CONFIG;
  }
}

/**
 * Persists Google reviews configuration to localStorage.
 */
export function saveGoogleReviewsConfig(config: GoogleReviewsConfig): void {
  try {
    localStorage.setItem(GOOGLE_REVIEWS_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Unable to persist Google reviews config to localStorage', err);
  }
}

/**
 * Formats any input (Place ID or raw Google review URL) into the official 1-tap direct 5-star review URL.
 * When clicked on phone/desktop, Google Maps immediately opens with 5 stars pre-selected so customer only taps "Post".
 */
export function formatGoogle5StarReviewUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // If user entered a bare Google Place ID (e.g. starts with ChIJ...)
  if (trimmed.startsWith('ChIJ') && !trimmed.includes('/')) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmed)}`;
  }

  // If already a valid URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If user entered just placeid= or g.page/r/...
  if (trimmed.startsWith('g.page/') || trimmed.startsWith('maps.app.goo.gl/')) {
    return `https://${trimmed}`;
  }

  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmed)}`;
}

/**
 * Generates tracking URL for the specified courier and AWB.
 */
export function getCourierTrackingUrl(courier: CourierType | undefined, awb: string): string {
  const cleanAwb = (awb || '').trim();
  if (!cleanAwb) return 'https://www.dtdc.in/tracking.asp';

  switch (courier) {
    case 'TRACKON':
      return `https://trackon.in/Tracking/Index?awb=${cleanAwb}`;
    case 'SHREEMARUTI':
      return `https://www.shreemaruticourier.com/track-shipment/?tracking_no=${cleanAwb}`;
    case 'BLUEDART':
      return `https://www.bluedart.com/tracking?handler=trak&numbers=${cleanAwb}`;
    case 'DELHIVERY':
      return `https://www.delhivery.com/track/package/${cleanAwb}`;
    case 'DTDC':
    default:
      return `https://www.dtdc.in/tracking.asp?trkid=${cleanAwb}`;
  }
}

/**
 * Generates a high-quality QR code data URL.
 */
export async function generateQrCodeDataUrl(text: string, width = 180): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.warn('QR Code generation failed', err);
    return '';
  }
}

export interface ReceiptDispatchParams {
  billData: DTDCBillData;
  config: GoogleReviewsConfig;
  target: 'sender' | 'receiver';
  recipientName: string;
  recipientMobile: string;
  hasCustomPamphlet: boolean;
  servicesSummary?: string[];
}

/**
 * Generates the complete, high-converting WhatsApp message bundling:
 * 1. Booking receipt & live tracking
 * 2. Service pamphlet & visiting card notice
 * 3. 1-Tap 5-Star Direct Google Review Links for both businesses
 */
export function generateReceiptDispatchMessage(params: ReceiptDispatchParams): string {
  const { billData, config, target, recipientName, recipientMobile, hasCustomPamphlet } = params;
  const courier = billData.courier || 'DTDC';
  const courierLabel = courier === 'BLUEDART' ? 'Blue Dart Express' : courier === 'DELHIVERY' ? 'Delhivery Express' : 'DTDC Express';
  const awb = billData.awb || 'N/A';
  const origin = billData.origin || 'SATNA';
  const dest = billData.dest || 'DESTINATION';
  const trackingUrl = getCourierTrackingUrl(courier, awb);
  const amount = billData.courierCharges ? `₹${billData.courierCharges}` : 'Paid';

  const nameGreeting = recipientName ? `*${recipientName.trim()}* Ji` : 'Customer Ji';
  const header = `🙏 Namaste ${nameGreeting}!\n\n` +
    `📦 *MAA SHARDA ENTERPRISES*\n` +
    `_Authorized Multi-Courier Booking & Logistics Hub_\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ *Booking Confirmation Receipt*\n\n` +
    `• *Courier Partner:* ${courierLabel}\n` +
    `• *AWB / Docket No:* *${awb}*\n` +
    `• *Route:* ${origin} ➔ *${dest}*\n` +
    `• *Total Charged:* *${amount}*\n` +
    `• *Date:* ${billData.date || new Date().toLocaleDateString('en-IN')}\n\n` +
    `🔍 *Live Parcel Tracking Link:*\n` +
    `${trackingUrl}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`;

  // Pamphlet Section
  let pamphletSection = '';
  if (hasCustomPamphlet || config.pamphletLink) {
    pamphletSection = `📑 *Hamara Service Card & Rate Pamphlet:*\n` +
      `_DTDC, Blue Dart, Delhivery, Speed Post, Doorstep Pickup available._\n` +
      (config.pamphletLink ? `👉 Pamphlet Link: ${config.pamphletLink}\n` : `_(Digital visiting card attached above)_\n`) +
      `━━━━━━━━━━━━━━━━━━━━\n`;
  } else {
    pamphletSection = `🚚 *Available Services:*\n` +
      `• DTDC (Air / Surface)\n` +
      `• Blue Dart Priority\n` +
      `• Delhivery E-Commerce Parcel\n` +
      `• Speed Post & Free Doorstep Pickup\n` +
      `━━━━━━━━━━━━━━━━━━━━\n`;
  }

  // Google Reviews for BOTH businesses
  let reviewSection = '';
  const biz1 = config.business1;
  const biz2 = config.business2;

  if (biz1.enabled || biz2.enabled) {
    reviewSection = `⭐ *5-STAR GOOGLE REVIEW REQUEST:*\n` +
      `Aapka feedback hamare liye bahut anmol hai! Kripya neeche diye gaye link par click karke *5-Star rating* dekar hamara sahyog karein:\n\n`;

    if (biz1.enabled && biz1.reviewUrl) {
      reviewSection += `🏢 *1. ${biz1.name}*\n` +
        `👉 5-Star Review Dein: ${formatGoogle5StarReviewUrl(biz1.reviewUrl)}\n\n`;
    }

    if (biz2.enabled && biz2.reviewUrl) {
      reviewSection += `🏢 *2. ${biz2.name}*\n` +
        `👉 5-Star Review Dein: ${formatGoogle5StarReviewUrl(biz2.reviewUrl)}\n\n`;
    }

    reviewSection += `_(Link kholte hi 5-star ka page aayega, bas 'POST' button dabayein - sirf 2 second lagenge!)_\n` +
      `━━━━━━━━━━━━━━━━━━━━\n`;
  }

  const footer = `📞 *Booking / Rate Enquiries:* +91 9827012345 / 9425178910\n` +
    `📍 *Address:* Main Market & Station Road, Satna (M.P.)\n` +
    `_Thank you for choosing Maa Sharda Enterprises!_`;

  return `${header}${pamphletSection}${reviewSection}${footer}`;
}
