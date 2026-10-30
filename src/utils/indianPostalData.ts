import { CourierAddress, EnvelopePresetConfig, EnvelopePresetType } from '../types/courierPrint';

export const INDIAN_STATES: string[] = [
  'ANDAMAN AND NICOBAR ISLANDS',
  'ANDHRA PRADESH',
  'ARUNACHAL PRADESH',
  'ASSAM',
  'BIHAR',
  'CHANDIGARH',
  'CHHATTISGARH',
  'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'DELHI',
  'GOA',
  'GUJARAT',
  'HARYANA',
  'HIMACHAL PRADESH',
  'JAMMU AND KASHMIR',
  'JHARKHAND',
  'KARNATAKA',
  'KERALA',
  'LADAKH',
  'LAKSHADWEEP',
  'MADHYA PRADESH',
  'MAHARASHTRA',
  'MANIPUR',
  'MEGHALAYA',
  'MIZORAM',
  'NAGALAND',
  'ODISHA',
  'PUDUCHERRY',
  'PUNJAB',
  'RAJASTHAN',
  'SIKKIM',
  'TAMIL NADU',
  'TELANGANA',
  'TRIPURA',
  'UTTAR PRADESH',
  'UTTARAKHAND',
  'WEST BENGAL',
];

// 2-digit PIN code prefix mapping to State and sample city
export const PIN_PREFIX_MAP: Record<string, { state: string; sampleCity: string }> = {
  '11': { state: 'DELHI', sampleCity: 'NEW DELHI' },
  '12': { state: 'HARYANA', sampleCity: 'FARIDABAD' },
  '13': { state: 'HARYANA', sampleCity: 'AMBALA' },
  '14': { state: 'PUNJAB', sampleCity: 'LUDHIANA' },
  '15': { state: 'PUNJAB', sampleCity: 'BATHINDA' },
  '16': { state: 'CHANDIGARH', sampleCity: 'CHANDIGARH' },
  '17': { state: 'HIMACHAL PRADESH', sampleCity: 'SHIMLA' },
  '18': { state: 'JAMMU AND KASHMIR', sampleCity: 'JAMMU' },
  '19': { state: 'JAMMU AND KASHMIR', sampleCity: 'SRINAGAR' },
  '20': { state: 'UTTAR PRADESH', sampleCity: 'ALIGARH' },
  '21': { state: 'UTTAR PRADESH', sampleCity: 'ALLAHABAD' },
  '22': { state: 'UTTAR PRADESH', sampleCity: 'LUCKNOW' },
  '23': { state: 'UTTAR PRADESH', sampleCity: 'VARANASI' },
  '24': { state: 'UTTARAKHAND', sampleCity: 'DEHRADUN' },
  '25': { state: 'UTTAR PRADESH', sampleCity: 'MEERUT' },
  '26': { state: 'UTTAR PRADESH', sampleCity: 'BAREILLY' },
  '27': { state: 'UTTAR PRADESH', sampleCity: 'GORAKHPUR' },
  '28': { state: 'UTTAR PRADESH', sampleCity: 'AGRA' },
  '30': { state: 'RAJASTHAN', sampleCity: 'JAIPUR' },
  '31': { state: 'RAJASTHAN', sampleCity: 'UDAIPUR' },
  '32': { state: 'RAJASTHAN', sampleCity: 'KOTA' },
  '33': { state: 'RAJASTHAN', sampleCity: 'BIKANER' },
  '34': { state: 'RAJASTHAN', sampleCity: 'JODHPUR' },
  '36': { state: 'GUJARAT', sampleCity: 'RAJKOT' },
  '37': { state: 'GUJARAT', sampleCity: 'BHUJ' },
  '38': { state: 'GUJARAT', sampleCity: 'AHMEDABAD' },
  '39': { state: 'GUJARAT', sampleCity: 'SURAT' },
  '40': { state: 'MAHARASHTRA', sampleCity: 'MUMBAI' },
  '41': { state: 'MAHARASHTRA', sampleCity: 'PUNE' },
  '42': { state: 'MAHARASHTRA', sampleCity: 'NASHIK' },
  '43': { state: 'MAHARASHTRA', sampleCity: 'AURANGABAD' },
  '44': { state: 'MAHARASHTRA', sampleCity: 'NAGPUR' },
  '45': { state: 'MADHYA PRADESH', sampleCity: 'INDORE' },
  '46': { state: 'MADHYA PRADESH', sampleCity: 'BHOPAL' },
  '47': { state: 'MADHYA PRADESH', sampleCity: 'GWALIOR' },
  '48': { state: 'MADHYA PRADESH', sampleCity: 'JABALPUR' },
  '49': { state: 'CHHATTISGARH', sampleCity: 'RAIPUR' },
  '50': { state: 'TELANGANA', sampleCity: 'HYDERABAD' },
  '51': { state: 'ANDHRA PRADESH', sampleCity: 'TIRUPATI' },
  '52': { state: 'ANDHRA PRADESH', sampleCity: 'VIJAYAWADA' },
  '53': { state: 'ANDHRA PRADESH', sampleCity: 'VISAKHAPATNAM' },
  '56': { state: 'KARNATAKA', sampleCity: 'BENGALURU' },
  '57': { state: 'KARNATAKA', sampleCity: 'MANGALORE' },
  '58': { state: 'KARNATAKA', sampleCity: 'HUBBALLI' },
  '59': { state: 'KARNATAKA', sampleCity: 'BELAGAVI' },
  '60': { state: 'TAMIL NADU', sampleCity: 'CHENNAI' },
  '61': { state: 'TAMIL NADU', sampleCity: 'THANJAVUR' },
  '62': { state: 'TAMIL NADU', sampleCity: 'MADURAI' },
  '63': { state: 'TAMIL NADU', sampleCity: 'VELLORE' },
  '64': { state: 'TAMIL NADU', sampleCity: 'COIMBATORE' },
  '67': { state: 'KERALA', sampleCity: 'KOZHIKODE' },
  '68': { state: 'KERALA', sampleCity: 'KOCHI' },
  '69': { state: 'KERALA', sampleCity: 'THIRUVANANTHAPURAM' },
  '70': { state: 'WEST BENGAL', sampleCity: 'KOLKATA' },
  '71': { state: 'WEST BENGAL', sampleCity: 'HOWRAH' },
  '72': { state: 'WEST BENGAL', sampleCity: 'MIDNAPORE' },
  '73': { state: 'WEST BENGAL', sampleCity: 'SILIGURI' },
  '74': { state: 'WEST BENGAL', sampleCity: 'BARASAT' },
  '75': { state: 'ODISHA', sampleCity: 'BHUBANESWAR' },
  '76': { state: 'ODISHA', sampleCity: 'BERHAMPUR' },
  '77': { state: 'ODISHA', sampleCity: 'ROURKELA' },
  '78': { state: 'ASSAM', sampleCity: 'GUWAHATI' },
  '79': { state: 'TRIPURA', sampleCity: 'AGARTALA' },
  '80': { state: 'BIHAR', sampleCity: 'PATNA' },
  '81': { state: 'BIHAR', sampleCity: 'BHAGALPUR' },
  '82': { state: 'BIHAR', sampleCity: 'GAYA' },
  '83': { state: 'JHARKHAND', sampleCity: 'RANCHI' },
  '84': { state: 'BIHAR', sampleCity: 'MUZAFFARPUR' },
  '85': { state: 'BIHAR', sampleCity: 'PURNEA' },
};

export const ENVELOPE_PRESETS: Record<EnvelopePresetType, EnvelopePresetConfig> = {
  DL: {
    id: 'DL',
    name: 'DL Envelope (Standard Commercial)',
    shortLabel: 'DL (110 × 220 mm)',
    widthMm: 220,
    heightMm: 110,
    description: 'Standard long business envelope (Fits 1/3 folded A4 sheet)',
    aspectRatio: 220 / 110,
  },
  C6: {
    id: 'C6',
    name: 'C6 Envelope (Quarter Fold)',
    shortLabel: 'C6 (114 × 162 mm)',
    widthMm: 162,
    heightMm: 114,
    description: 'Compact personal envelope (Fits A6 card or quarter-folded A4)',
    aspectRatio: 162 / 114,
  },
  C5: {
    id: 'C5',
    name: 'C5 Envelope (Half Sheet)',
    shortLabel: 'C5 (162 × 229 mm)',
    widthMm: 229,
    heightMm: 162,
    description: 'Medium envelope (Fits half-folded A4 / full A5 document)',
    aspectRatio: 229 / 162,
  },
  C4: {
    id: 'C4',
    name: 'C4 Envelope (Full A4 Document)',
    shortLabel: 'C4 (229 × 324 mm)',
    widthMm: 324,
    heightMm: 229,
    description: 'Large flat document packet (Fits unfolded A4 papers & catalogs)',
    aspectRatio: 324 / 229,
  },
  A4: {
    id: 'A4',
    name: 'A4 Sheet (Direct Full Page Dispatch)',
    shortLabel: 'A4 (210 × 297 mm)',
    widthMm: 210,
    heightMm: 297,
    description: 'Full A4 Dispatch Sheet with large visible receiver block',
    aspectRatio: 210 / 297,
  },
  A4_3_SLIPS: {
    id: 'A4_3_SLIPS',
    name: 'A4 3-Slip Dispatch Sheet (Normal Paper)',
    shortLabel: 'A4 3-Slips (Side-by-Side TO/FROM)',
    widthMm: 210,
    heightMm: 297,
    description: '3 equal 200mm × 92mm dispatch slips per A4 portrait page with side-by-side TO & FROM, cut lines and Paper Save mode',
    aspectRatio: 210 / 297,
    isMultiLabel: true,
    labelsCount: 3,
  },
  A4_COURIER_SLIP: {
    id: 'A4_COURIER_SLIP',
    name: 'A4 Courier Parcel Slip (Paper Save Mode)',
    shortLabel: 'A4 Courier Slip (Paper Save)',
    widthMm: 210,
    heightMm: 297,
    description: 'Crisp bordered parcel address slip with TO/FROM grid & barcode at top of A4 (saves 2/3 paper)',
    aspectRatio: 210 / 297,
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Custom Dimensions',
    shortLabel: 'Custom Size',
    widthMm: 220,
    heightMm: 110,
    description: 'User-specified envelope or label parcel dimensions in mm',
    aspectRatio: 2.0,
  },
  A4_LABELS_2: {
    id: 'A4_LABELS_2',
    name: 'A4 2-Up Dispatch Labels',
    shortLabel: '2-Up on A4',
    widthMm: 210,
    heightMm: 297,
    description: '2 large horizontal parcel shipping labels per A4 sheet',
    aspectRatio: 210 / 297,
    isMultiLabel: true,
    labelsCount: 2,
  },
  A4_LABELS_4: {
    id: 'A4_LABELS_4',
    name: 'A4 4-Up Dispatch Labels',
    shortLabel: '4-Up (2x2) on A4',
    widthMm: 210,
    heightMm: 297,
    description: '4 address labels arranged in a 2x2 grid per A4 sheet',
    aspectRatio: 210 / 297,
    isMultiLabel: true,
    labelsCount: 4,
  },
  A4_LABELS_6: {
    id: 'A4_LABELS_6',
    name: 'A4 6-Up Dispatch Labels',
    shortLabel: '6-Up (2x3) on A4',
    widthMm: 210,
    heightMm: 297,
    description: '6 compact dispatch labels per A4 sheet',
    aspectRatio: 210 / 297,
    isMultiLabel: true,
    labelsCount: 6,
  },
};

export function toUpperClean(val: string | undefined | null): string {
  if (!val) return '';
  return String(val).trim().toUpperCase();
}

export function lookupPinCode(pin: string): { state: string; sampleCity: string } | null {
  const cleanPin = pin.replace(/\D/g, '');
  if (cleanPin.length < 2) return null;
  const prefix = cleanPin.substring(0, 2);
  return PIN_PREFIX_MAP[prefix] || null;
}

export function parseRawAddressText(rawText: string, defaultId?: string): CourierAddress {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = '';
  let company = '';
  let addressLine1 = '';
  let addressLine2 = '';
  let landmark = '';
  let city = '';
  let state = '';
  let pinCode = '';
  let mobile = '';

  const pinMatch = rawText.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    pinCode = pinMatch[1];
    const autoLookup = lookupPinCode(pinCode);
    if (autoLookup) {
      state = autoLookup.state;
      if (!city) city = autoLookup.sampleCity;
    }
  }

  const phoneMatch = rawText.match(/(?:\+91[\s\-]?)?(?:[6-9]\d{9})\b/);
  if (phoneMatch) {
    mobile = phoneMatch[0].replace(/\D/g, '').slice(-10);
  }

  const cleanLines: string[] = [];

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (/^(?:TO|CONSIGNEE|RECEIVER|DELIVER TO)\s*[:\-]\s*(.*)/i.test(line)) {
      const match = line.match(/^(?:TO|CONSIGNEE|RECEIVER|DELIVER TO)\s*[:\-]\s*(.*)/i);
      if (match && match[1]) name = match[1].trim();
      continue;
    }

    if (/^(?:FROM|CONSIGNOR|SENDER|DISPATCH FROM)\s*[:\-]\s*(.*)/i.test(line)) {
      const match = line.match(/^(?:FROM|CONSIGNOR|SENDER|DISPATCH FROM)\s*[:\-]\s*(.*)/i);
      if (match && match[1]) name = match[1].trim();
      continue;
    }

    if (/^(?:NAME|ATTN|MR|MRS|MS|DR)\.?\s*[:\-]?\s*(.*)/i.test(line) && !name) {
      const match = line.match(/^(?:NAME|ATTN|MR|MRS|MS|DR)\.?\s*[:\-]?\s*(.*)/i);
      if (match && match[1]) name = match[1].trim();
      continue;
    }

    if (/(?:LANDMARK|NEAR|OPP|OPPOSITE|BEHIND|BESIDE)\s*[:\-]?\s*(.*)/i.test(line)) {
      landmark = line.replace(/^(?:LANDMARK|NEAR|OPP|OPPOSITE)\s*[:\-]?\s*/i, '').trim();
      continue;
    }

    if (/(?:MOB|PHONE|TEL|CONTACT|CELL)\s*[:\-]?\s*([0-9\s\-+]+)/i.test(line)) {
      const m = line.match(/([0-9]{10})/);
      if (m && !mobile) mobile = m[1];
      continue;
    }

    for (const st of INDIAN_STATES) {
      if (upper.includes(st)) {
        state = st;
        break;
      }
    }

    if (/^\+?[\d\s\-]{8,}$/.test(line)) continue;
    if (/^\d{6}$/.test(line)) continue;

    cleanLines.push(line);
  }

  if (!name && cleanLines.length > 0) {
    name = cleanLines.shift() || '';
  }

  if (cleanLines.length > 0 && /(?:LTD|PVT|LIMITED|ENTERPRISES|TRADERS|CORP|SOLUTIONS|SERVICES|INC|LLP|STORE|SHOP)/i.test(cleanLines[0])) {
    company = cleanLines.shift() || '';
  }

  if (cleanLines.length > 0) {
    addressLine1 = cleanLines.shift() || '';
  }
  if (cleanLines.length > 0) {
    const next = cleanLines.shift() || '';
    if (next.includes('-') && /\d{6}/.test(next)) {
      const parts = next.split(/[\-,]/).map((s) => s.trim());
      if (parts[0] && !city) city = parts[0];
    } else {
      addressLine2 = next;
    }
  }

  if (cleanLines.length > 0) {
    const rest = cleanLines.join(', ');
    if (!city) {
      city = rest;
    } else if (!addressLine2) {
      addressLine2 = rest;
    } else {
      addressLine2 += `, ${rest}`;
    }
  }

  if (city && pinCode) {
    city = city.replace(new RegExp(`\\b${pinCode}\\b`, 'g'), '').replace(/[\-,]/g, '').trim();
  }

  if (!state && pinCode) {
    const lookup = lookupPinCode(pinCode);
    if (lookup) state = lookup.state;
  }

  return {
    id: defaultId || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: toUpperClean(name || 'RECEIVER NAME'),
    company: toUpperClean(company),
    addressLine1: toUpperClean(addressLine1 || 'ADDRESS LINE 1'),
    addressLine2: toUpperClean(addressLine2),
    landmark: toUpperClean(landmark),
    city: toUpperClean(city || 'CITY'),
    state: toUpperClean(state || 'STATE'),
    pinCode: pinCode || '000000',
    mobile: mobile ? mobile.slice(-10) : '',
    isBoldName: true,
  };
}

export const DEFAULT_SENDER: CourierAddress = {
  id: 'sender-default',
  name: 'MAA SHARDA ENTERPRISES',
  company: 'LOGISTICS & COURIER SERVICES',
  addressLine1: 'NEAR REST HOUSE, SATNA-PANNA ROAD',
  addressLine2: 'NH39',
  landmark: 'NEAR REST HOUSE',
  city: 'NAGOD',
  state: 'MADHYA PRADESH',
  pinCode: '485446',
  mobile: '8982091190',
  isBoldName: true,
  isDefaultSender: true,
  category: 'BRANCH',
};

export const DEFAULT_RECEIVER: CourierAddress = {
  id: 'receiver-default',
  name: 'RAJESH KUMAR SHARMA',
  company: 'SHARMA TRADING CORPORATION',
  addressLine1: 'FLAT NO. 302, SAI KRIPA APARTMENTS',
  addressLine2: '7TH CROSS, INDIRANAGAR 1ST STAGE',
  landmark: 'NEAR CMH HOSPITAL',
  city: 'BENGALURU',
  state: 'KARNATAKA',
  pinCode: '560037',
  mobile: '9845098765',
  isBoldName: true,
  category: 'CUSTOMER',
};
