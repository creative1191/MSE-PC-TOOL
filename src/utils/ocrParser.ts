import { OCRMatchResult, CourierType } from '../types';

/**
 * Removes duplicate address blocks, billing address remnants, and labels.
 * Ensures the shipping address is clean and never repeated.
 */
export function cleanAddressString(rawAddress?: string, nameToStrip?: string): string {
  if (!rawAddress) return '';

  let cleaned = rawAddress
    // Cut off anything starting from BILLING ADDRESS, BILL TO, ORDER DETAILS, or ITEM DESCRIPTION
    .replace(/(?:BILLING\s*ADDRESS|BILL\s*TO\s*ADDRESS|BILL\s*TO|ORDER\s*DETAILS|SALES\s*NUMBER|ITEM\s*DESCRIPTION|PAYMENT\s*TYPE|POWERED\s*BY)[\s\S]*/i, '')
    // Remove leading labels
    .replace(/^(?:SHIPPING\s*ADDRESS|SHIP\s*TO\s*ADDRESS|SHIP\s*TO|DELIVERY\s*ADDRESS|CONSIGNEE\s*ADDRESS|CONSIGNEE['’]?S\s*ADDRESS|ADDRESS)\s*[:\-]?\s*/i, '')
    .trim();

  // If the consignee name is at the beginning of the address, strip it so it doesn't repeat
  if (nameToStrip && nameToStrip.trim().length > 2) {
    const escaped = nameToStrip.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`^${escaped}\\s*[,\\-\\n\\s]*`, 'i'), '');
  }

  // Split into comma, semicolon, or newline segments
  const segments = cleaned
    .split(/[,;\n\r]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const uniqueSegments: string[] = [];

  for (const seg of segments) {
    const norm = seg.toLowerCase().replace(/\s+/g, ' ');

    // Filter out label words
    if (
      norm === 'shipping address' ||
      norm === 'billing address' ||
      norm === 'delivery address' ||
      norm === 'consignee address' ||
      norm === 'consignee' ||
      norm === 'address' ||
      norm === 'order details' ||
      norm === 'sales number' ||
      norm === 'item description' ||
      norm.startsWith('awb number') ||
      norm.startsWith('sale date') ||
      norm.startsWith('payment type') ||
      norm.startsWith('powered by')
    ) {
      continue;
    }

    // Skip if segment equals the consignee name
    if (nameToStrip && norm === nameToStrip.trim().toLowerCase()) {
      continue;
    }

    // Check if we've already included this segment or very similar phrase
    if (!seen.has(norm)) {
      seen.add(norm);
      uniqueSegments.push(seg);
    }
  }

  // If the result still has duplicate halves (e.g. "Ambala, Haryana - 133006, Ambala, Haryana - 133006")
  let joined = uniqueSegments.join(', ');
  const halfLen = Math.floor(joined.length / 2);
  if (halfLen > 15) {
    const firstHalf = joined.slice(0, halfLen).trim().replace(/,$/, '');
    const secondHalf = joined.slice(halfLen).trim().replace(/^,/, '').trim();
    if (secondHalf.toLowerCase().includes(firstHalf.toLowerCase())) {
      joined = secondHalf;
    }
  }

  return joined;
}

/**
 * Detects which courier (DTDC, BLUEDART, or DELHIVERY) a raw text / document belongs to.
 */
export function detectCourierFromText(rawText: string): CourierType | null {
  const upper = rawText.toUpperCase();
  if (upper.includes('BLUE DART') || upper.includes('BLUEDART') || upper.includes('AIR WAYBILL') || upper.includes('WBN') || upper.includes('APEX')) {
    return 'BLUEDART';
  }
  if (upper.includes('DELHIVERY') || upper.includes('POWERED BY DELHIVERY') || upper.includes('DELHIVERY EXPRESS') || upper.includes('EXPRESS PARCEL')) {
    return 'DELHIVERY';
  }
  if (upper.includes('DTDC') || upper.includes('DOTZOT') || upper.includes('7D') || upper.includes('7X') || upper.includes('CONSIGNMENT NOTE')) {
    return 'DTDC';
  }
  return null;
}

/**
 * Extracts PIN code (6-digit Indian Postal PIN) from an address or text block.
 */
export function extractPinCode(text: string): string | null {
  const pinMatch = text.match(/(?:PIN(?:[\s\-_Code:]*)|Postal\s*Code[:\s\-]*|[-–]\s*)?([1-9][0-9]{5})\b/i);
  return pinMatch && pinMatch[1] ? pinMatch[1] : null;
}

/**
 * Extracts a 10-digit Indian mobile number or valid phone number from a text block.
 */
export function extractPhoneNumber(text: string): string | null {
  // 1. Mobile number starting with 6, 7, 8, 9 with optional +91 or 0 prefix
  const mobileMatch = text.match(/(?:Phone|Tel|Mobile|Mob|Contact|Ph|Cell)?\s*[:\-]?\s*(?:\+?91[\-\s]?)?(?:0)?([6-9]\d{9})\b/i);
  if (mobileMatch && mobileMatch[1]) {
    return mobileMatch[1];
  }

  // 2. Standard 10-digit number with spaces/hyphens (e.g. 98765-43210 or 98765 43210)
  const spacedMatch = text.match(/\b([6-9]\d{4}[\s\-]\d{5})\b/);
  if (spacedMatch && spacedMatch[1]) {
    return spacedMatch[1].replace(/[\s\-]/g, '');
  }

  // 3. Landline with STD code (e.g. 011-23456789 or 022-28765432)
  const landlineMatch = text.match(/\b(0\d{2,4}[\-\s]?\d{6,8})\b/);
  if (landlineMatch && landlineMatch[1]) {
    return landlineMatch[1].replace(/[\s\-]/g, '');
  }

  return null;
}

/**
 * Extracts destination city from address or destination labels.
 */
export function extractDestinationCity(text: string, addressText?: string): string | null {
  // Explicit destination labels
  const destMatch = text.match(/(?:Dest(?:ination)?|To\s*Station|To\s*City|Delivery\s*City|Destn|Area\s*Code)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\n|Product|Type|Weight|Date|PIN|,|$)/i);
  if (destMatch && destMatch[1]) {
    const cleanDest = destMatch[1].trim().toUpperCase();
    if (cleanDest.length >= 2 && cleanDest.length <= 25 && !cleanDest.match(/^(address|phone|courier|pin)/i)) {
      return cleanDest;
    }
  }

  if (addressText) {
    const upperAddr = addressText.toUpperCase();
    // Known major Indian hubs
    const commonHubs = [
      'AMBALA', 'MEHSANA', 'MAHESANA', 'SATNA', 'NAGOD', 'KOTA', 'MUMBAI', 'DELHI', 'NEW DELHI',
      'BANGALORE', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'AHMEDABAD',
      'JAIPUR', 'SURAT', 'LUCKNOW', 'KANPUR', 'INDORE', 'BHOPAL', 'PATNA', 'VADODARA',
      'NAGPUR', 'COIMBATORE', 'THANE', 'GURUGRAM', 'GURGAON', 'NOIDA', 'GHAZIABAD',
      'LUDHIANA', 'CHANDIGARH', 'KURUKSHETRA', 'REWA', 'JABALPUR', 'GWALIOR', 'VARANASI'
    ];

    for (const hub of commonHubs) {
      if (upperAddr.includes(hub)) {
        return hub === 'MAHESANA' ? 'MEHSANA' : hub;
      }
    }

    // Fallback: extract word preceding PIN code
    const pin = extractPinCode(addressText);
    if (pin) {
      const words = addressText.split(/[\s,–\-]+/);
      const pinIndex = words.findIndex(w => w.includes(pin));
      if (pinIndex > 0) {
        for (let i = pinIndex - 1; i >= 0 && i >= pinIndex - 3; i--) {
          const candidate = words[i].replace(/[^A-Za-z]/g, '').trim().toUpperCase();
          if (candidate.length >= 3 && !['HARYANA', 'GUJARAT', 'PUNJAB', 'RAJASTHAN', 'MAHARASHTRA', 'INDIA', 'PIN', 'DISTT', 'TEH', 'VPO', 'NEAR'].includes(candidate)) {
            return candidate;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Parses OCR extracted text across DTDC, Blue Dart, and Delhivery courier formats.
 * Handles receipts, tax invoices, shipping manifests, and Snipping Tool label captures.
 */
export function parseCourierOcrText(rawText: string, preferredCourier?: CourierType): OCRMatchResult {
  const result: OCRMatchResult = { rawText };

  if (!rawText || rawText.trim().length === 0) {
    return result;
  }

  // UNIVERSAL MULTI-COPY & MULTI-LABEL SHEET PROTECTION (DTDC, Blue Dart, Delhivery):
  // Courier bills and labels frequently print 2, 3, or 4 copies or labels on a single A4 page:
  // - DTDC: "Sender's Copy", "Account's Copy", "POD Copy"
  // - Blue Dart: "Shipper's Copy", "Consignee's Copy", "POD Copy", "Accounts Copy"
  // - Delhivery: 4-Up label sheets (4 labels on 1 sheet) or "Consignor Copy", "Transporter Copy"
  //
  // Extract data strictly from the PRIMARY (first / shipper's) copy to prevent repeated or mixed fields!
  let effectiveText = rawText;

  // 1. Look for explicit Shipper / Sender Copy marker
  const primaryCopyIndex = rawText.search(
    /(?:Sender['’]s\s*Copy|Shipper['’]s\s*Copy|Origin\s*Copy|Customer\s*Copy|Consignor\s*Copy|Original\s*for\s*(?:Consignor|Shipper))/i
  );
  if (primaryCopyIndex > 50) {
    const endMatch = rawText.slice(primaryCopyIndex).match(/^[^\n\r]+/);
    effectiveText = rawText.slice(0, primaryCopyIndex + (endMatch ? endMatch[0].length : 25));
  } else {
    // 2. Check for courier brand or AWB repeating multiple times on the same sheet
    const brandRegexes = [
      /DTDC\s*Express\s*Limited/gi,
      /Blue\s*Dart\s*Express(?:\s*Limited)?/gi,
      /(?:Powered\s*by\s*)?Delhivery(?:\s*Private\s*Limited|\s*Surface|\s*Express)?/gi,
      /Air\s*Waybill\s*No\.?/gi,
      /\bAWB\s*No\.?\s*:/gi,
    ];

    for (const bRegex of brandRegexes) {
      const matches = [...rawText.matchAll(bRegex)];
      if (matches.length > 1 && matches[1].index && matches[1].index > 100) {
        effectiveText = rawText.slice(0, matches[1].index);
        break;
      }
    }
  }

  // Detect courier or use preferred
  const detected = detectCourierFromText(effectiveText) || preferredCourier || 'DTDC';
  result.detectedCourier = detected;

  // Helper to extract clean multiline address and discard headers/footers
  const extractCleanAddress = (block: string): string => {
    return block
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''))
      .filter(
        (l) =>
          l.length > 0 &&
          !l.match(
            /^(?:gstin|gst|phone|tel|email|contact|customer|consignee|consignor|cin|content|paperwork|declared|no\s*of|actual|mode|awb|dim|charged|name\s*:)/i
          )
      )
      .join(', ');
  };

  // ================= 1. AWB NUMBER EXTRACTION =================
  if (detected === 'BLUEDART') {
    const bdAwbMatch = effectiveText.match(/(?:Waybill|Way\s*Bill|AWB(?:\s*Number)?|Air\s*Waybill|WBN|Tracking\s*(?:No|#)|Wb\s*No)\s*[:#\.\-]?\s*([0-9]{8,12})/i);
    if (bdAwbMatch && bdAwbMatch[1]) {
      result.awb = bdAwbMatch[1].trim();
    } else {
      const bdFallback = effectiveText.match(/\b([0-9]{9,11})\b/);
      if (bdFallback && bdFallback[1]) {
        result.awb = bdFallback[1].trim();
      }
    }
  } else if (detected === 'DELHIVERY') {
    // Delhivery AWB: e.g. "AWB Number: 34084710004874", "AWB: 1412345678901"
    const delAwbMatch = effectiveText.match(/(?:AWB(?:\s*Number)?|Waybill|LR\s*No|Tracking\s*(?:No|#)|Order\s*ID)\s*[:#\.\-]?\s*([0-9]{12,15})/i);
    if (delAwbMatch && delAwbMatch[1]) {
      result.awb = delAwbMatch[1].trim();
    } else {
      const delFallback = effectiveText.match(/\b([0-9]{12,14})\b/);
      if (delFallback && delFallback[1]) {
        result.awb = delFallback[1].trim();
      }
    }
  } else {
    // DTDC: Starts with 7D, 7X, or 7 followed by digits/letters
    const awbPrimary = effectiveText.match(/AWB\s*No\.?\s*[:\-]?\s*([A-Z0-9]{8,})/i);
    if (awbPrimary && awbPrimary[1]) {
      result.awb = awbPrimary[1].trim().toUpperCase();
    } else {
      const awbSecondary = effectiveText.match(/\b(7[A-Z0-9]{9,12})\b/);
      if (awbSecondary && awbSecondary[1]) {
        result.awb = awbSecondary[1].trim().toUpperCase();
      }
    }
  }

  // ================= 2. CONSIGNOR (SENDER / BILL FROM) =================
  // Direct DTDC Consignor Matchers
  const dtdcConsignorName = effectiveText.match(
    /(?:Consignor(?:['’]s)?(?:\s*Name)?|Shipper(?:['’]s)?(?:\s*Name)?|Sender(?:['’]s)?(?:\s*Name)?|Bill\s*From|Sold\s*By|Dispatched\s*From)\s*[:\-]?\s*([A-Za-z0-9\s\.\-&]{3,50}?)(?:\n|Address|Phone|Contact|Ph|Mob|Tel|GST|$)/i
  );
  if (dtdcConsignorName && dtdcConsignorName[1]) {
    const sName = dtdcConsignorName[1].trim();
    if (!sName.match(/^(address|phone|tel|dtdc|blue dart|delhivery|customer|consignee)$/i)) {
      result.consignorName = sName;
    }
  }

  const dtdcConsignorAddr = effectiveText.match(
    /(?:Consignor(?:['’]s)?[\s\S]{0,30}?Address|Shipper(?:['’]s)?\s*Address|Sender(?:['’]s)?\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){0,4}?)(?=\n\s*(?:GSTIN|Phone|Customer|Consignee|Content|$))/i
  );
  if (dtdcConsignorAddr && dtdcConsignorAddr[1]) {
    result.consignorAddress = cleanAddressString(extractCleanAddress(dtdcConsignorAddr[1]), result.consignorName);
  }

  // Fallback for Bill From section
  if (!result.consignorName || !result.consignorAddress) {
    const billFromSection = effectiveText.match(
      /(?:BILL\s*FROM|SOLD\s*BY|DISPATCHED\s*FROM|SHIPPER|CONSIGNOR(?:\s*DETAILS)?)\s*[:\-]?\s*([\s\S]+?)(?=(?:SHIPPING\s*ADDRESS|BILLING\s*ADDRESS|BILL\s*TO|SHIP\s*TO|CONSIGNEE|ORDER\s*DETAILS|$))/i
    );
    if (billFromSection && billFromSection[1]) {
      const lines = billFromSection[1]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.match(/^(email:|gst\s*number:|phone:|tel:)/i));

      if (lines.length > 0 && !result.consignorName) {
        result.consignorName = lines[0];
      }
      if (lines.length > 1 && !result.consignorAddress) {
        result.consignorAddress = cleanAddressString(lines.slice(1).join(', '), result.consignorName);
      }
    }
  }

  // Consignor GSTIN & Origin City
  const gstinMatch = effectiveText.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
  if (gstinMatch && gstinMatch[1]) {
    result.consignorGstin = gstinMatch[1].trim();
  }

  // Origin detection (from explicit Origin label or Consignor address)
  const originMatch = effectiveText.match(/(?:Origin|From\s*Station|From\s*City|Shipped\s*From)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\n|Dest|To|,|$)/i);
  if (originMatch && originMatch[1]) {
    const cleanOrigin = originMatch[1].trim().toUpperCase();
    if (cleanOrigin.length >= 2 && cleanOrigin.length <= 25) {
      result.origin = cleanOrigin;
    }
  } else if (result.consignorAddress) {
    if (result.consignorAddress.toUpperCase().includes('NAGOD')) {
      result.origin = 'NAGOD';
    } else if (result.consignorAddress.toUpperCase().includes('SATNA')) {
      result.origin = 'SATNA';
    } else {
      const originPin = extractPinCode(result.consignorAddress);
      if (originPin) {
        const words = result.consignorAddress.split(/[\s,]+/);
        const pinIndex = words.findIndex((w) => w.includes(originPin));
        if (pinIndex > 0 && words[pinIndex - 1].length > 2) {
          result.origin = words[pinIndex - 1].replace(/[^A-Za-z]/g, '').toUpperCase();
        }
      }
    }
  }

  // ================= 3. CONSIGNEE (RECIPIENT / DESTINATION DETAILS) =================
  // Direct DTDC Consignee Name Matcher
  const dtdcConsigneeName = effectiveText.match(
    /(?:Consignee(?:['’]s)?(?:\s*Name)?|Receiver(?:['’]s)?(?:\s*Name)?|Customer(?:\s*Name)?|Ship\s*To(?:\s*Name)?|Deliver\s*To(?:\s*Name)?)\s*[:\-]?\s*([A-Za-z0-9\s\.\-&]{3,50}?)(?:\n|Address|Phone|Contact|Ph|Mob|Tel|Pin|GST|$)/i
  );
  if (dtdcConsigneeName && dtdcConsigneeName[1]) {
    const rName = dtdcConsigneeName[1].trim();
    if (
      !rName.match(
        /^(address|phone|tel|dtdc|blue dart|delhivery|total|powered|sales|item|payment|order|tax|invoice|discount)$/i
      )
    ) {
      result.consigneeName = rName;
    }
  }

  // Direct DTDC Consignee Address Matcher
  const dtdcConsigneeAddr = effectiveText.match(
    /(?:Consignee(?:['’]s)?[\s\S]{0,30}?Address|Delivery\s*Address|Ship\s*To\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){0,4}?)(?=\n\s*(?:GSTIN|Phone|Contact|Mobile|Tel|Email|Courier\s*Charges|Declared\s*Value|Content|$))/i
  );
  if (dtdcConsigneeAddr && dtdcConsigneeAddr[1]) {
    result.consigneeAddress = cleanAddressString(extractCleanAddress(dtdcConsigneeAddr[1]), result.consigneeName);
  }

  // Shipping Address Block fallback (Delhivery / Tax Invoices)
  if (!result.consigneeName || !result.consigneeAddress) {
    const shippingSectionMatch = effectiveText.match(
      /(?:SHIPPING\s*ADDRESS|SHIP\s*TO|DELIVER(?:Y)?\s*TO|CONSIGNEE\s*\((?:SHIP\s*TO|DELIVER\s*TO)\)|DELIVERY\s*ADDRESS|CONSIGNEE\s*ADDRESS)\s*[:\-]?\s*([\s\S]+?)(?=(?:BILLING\s*ADDRESS|BILL\s*TO\s*ADDRESS|BILL\s*TO|ORDER\s*DETAILS|ITEM\s*DESCRIPTION|PAYMENT\s*TYPE|POWERED\s*BY|$))/i
    );

    if (shippingSectionMatch && shippingSectionMatch[1] && shippingSectionMatch[1].trim().length > 5) {
      const lines = shippingSectionMatch[1]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 0 &&
            !l.match(/^(billing|shipping|order|sales|payment|awb|tax|invoice|phone|tel|mob|contact)/i)
        );

      if (lines.length > 0 && !result.consigneeName) {
        result.consigneeName = lines[0].replace(/^(?:Name|Consignee(?:'s)?|Receiver|To)\s*[:\-]?\s*/i, '').trim();
      }
      if (lines.length > 1 && !result.consigneeAddress) {
        result.consigneeAddress = cleanAddressString(lines.slice(1).join(', '), result.consigneeName);
      }
    }
  }

  // Ensure recipient PIN code is extracted and appended if missing
  const recipientPin = extractPinCode(result.consigneeAddress || effectiveText);
  if (recipientPin && result.consigneeAddress && !result.consigneeAddress.includes(recipientPin)) {
    result.consigneeAddress = `${result.consigneeAddress} - ${recipientPin}`;
  }

  // Recipient Destination City
  const detectedDest = extractDestinationCity(effectiveText, result.consigneeAddress);
  if (detectedDest) {
    result.dest = detectedDest;
  }

  // Customer Reference / Order ID
  const orderRefMatch = effectiveText.match(
    /(?:Customer\s*Ref(?:\s*No)?|Order\s*(?:No|ID|Number)|Invoice\s*(?:No|Number)|Ref\s*No)\s*[:\-]?\s*([A-Za-z0-9\-\/]{4,25})/i
  );
  if (orderRefMatch && orderRefMatch[1]) {
    const ref = orderRefMatch[1].trim();
    if (!ref.match(/^(address|phone|courier|dtdc|bluedart)/i)) {
      result.customerRefNo = ref;
    }
  }

  // Recipient GSTIN
  const consigneeGstinMatch = effectiveText.match(
    /(?:Consignee\s*GSTIN|Buyer\s*GSTIN|Recipient\s*GSTIN)\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i
  );
  if (consigneeGstinMatch && consigneeGstinMatch[1]) {
    result.consigneeGstin = consigneeGstinMatch[1].trim();
  }

  // Phone numbers extraction (Filter out dummy '0000000000')
  const phoneNumbers = [...effectiveText.matchAll(/(?:Phone|Contact|Mobile|Ph|Tel|Mob)\s*[:\-]?\s*(?:\+?91[\-\s]?)?(?:0)?([6-9]\d{9})\b/gi)];
  if (phoneNumbers.length > 0) {
    result.consignorPhone = phoneNumbers[0][1];
    if (phoneNumbers.length > 1) {
      result.consigneePhone = phoneNumbers[1][1];
    }
  }

  // ================= 4. PRODUCT, TYPE & MODE =================
  if (detected === 'BLUEDART') {
    if (effectiveText.match(/APEX|AIR/i)) {
      result.product = 'APEX';
      result.mode = 'AIR';
    } else if (effectiveText.match(/SURFACE/i)) {
      result.product = 'SURFACE';
      result.mode = 'SURFACE';
    } else {
      result.product = 'DOMESTIC PRIORITY';
      result.mode = 'AIR';
    }
    result.type = effectiveText.match(/NON[\-\s]?DOC/i) ? 'NON-DOCUMENT' : 'DOCUMENT';
  } else if (detected === 'DELHIVERY') {
    if (effectiveText.match(/SURFACE|HEAVY/i)) {
      result.product = 'Heavy Surface';
      result.mode = 'SURFACE';
    } else {
      result.product = 'Express Parcel';
      result.mode = 'AIR';
    }
    result.type = 'NON-DOCUMENT';
  } else {
    // DTDC
    const productMatch = effectiveText.match(/PRODUCT\s*:\s*([A-Z0-9\s\-]+?)(?:\n|Type|Date|$)/i);
    if (productMatch && productMatch[1]) {
      result.product = productMatch[1].trim();
    }
    const typeMatch = effectiveText.match(/Type\s*:\s*([A-Za-z\-]+)/i);
    if (typeMatch && typeMatch[1]) {
      result.type = typeMatch[1].trim().toUpperCase().includes('NON') ? 'NON-DOCUMENT' : 'DOCUMENT';
    }
    const modeMatch = effectiveText.match(/Mode\s*:\s*([A-Za-z]+)/i);
    if (modeMatch && modeMatch[1]) {
      result.mode = modeMatch[1].trim().toUpperCase();
    }
  }

  // ================= 5. WEIGHT & PIECES (CRITICAL ACCURACY) =================
  // Actual Weight extraction (e.g. "Actual Weight: 100 Gms", "Gross Wt: 0.50 Kgs", "Physical Weight: 0.35 kg")
  const actualWtMatch = effectiveText.match(
    /(?:Actual\s*(?:Weight|Wt)|Gross\s*(?:Weight|Wt)|Physical\s*(?:Weight|Wt)|Dead\s*(?:Weight|Wt)|\bWeight\b|\bWt\b)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*(?:Gms?|Kgs?|gm|kg|g|G|K)\.?)?)/i
  );
  if (actualWtMatch && actualWtMatch[1]) {
    const rawVal = actualWtMatch[1].trim();
    result.actualWeight = /^[0-9]+(?:\.[0-9]+)?$/.test(rawVal) ? `${rawVal} Kgs` : rawVal;
  }

  // Charged Weight extraction (e.g. "Charged weight: 500 Gms", "Chargeable Wt: 1.5 Kgs", "Volumetric Weight: 0.50 kg")
  const chargedWtMatch = effectiveText.match(
    /(?:Charged\s*(?:weight|wt)|Chargeable\s*(?:Weight|Wt)|Vol(?:umetric)?\.?\s*(?:Weight|Wt))\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*(?:Gms?|Kgs?|gm|kg|g|G|K)\.?)?)/i
  );
  if (chargedWtMatch && chargedWtMatch[1]) {
    const rawVal = chargedWtMatch[1].trim();
    result.chargedWeight = /^[0-9]+(?:\.[0-9]+)?$/.test(rawVal) ? `${rawVal} Kgs` : rawVal;
  }

  // Pieces: check Qty or No of Pieces
  const piecesMatch = effectiveText.match(/(?:No\s*Of\s*Pieces|Pieces|Pcs|Quantity|Qty)\s*[:\-]?\s*([0-9]+)/i);
  result.pieces = piecesMatch && piecesMatch[1] ? piecesMatch[1].trim() : '1';

  // ================= 6. CONTENT SPECIFICATION AUTO-FILL =================
  const contentMatch = effectiveText.match(
    /(?:Item\s*Desc(?:ription)?|Product\s*(?:Description|Name|Title)?|Description\s*Of\s*Goods|Nature\s*Of\s*Goods|Declared\s*Description(?:\s*Of\s*Goods)?|Goods\s*Description|Content\s*Specification|Contents|Commodity|Particulars|Item\s*Name|\bItems\b|\bContent\b)\s*[:\-]\s*([A-Za-z0-9\s,\/\.\-&]{2,60}?)(?=\n|SKU|Qty|Declared|Value|Weight|Pieces|Date|Rs|₹|Total|Rate|Tax|HSN|$)/i
  );
  if (contentMatch && contentMatch[1]) {
    const cleanContent = contentMatch[1].replace(/^(?:of|for|is)\s+/i, '').trim();
    if (
      cleanContent.length >= 2 &&
      cleanContent.length <= 50 &&
      !cleanContent.match(/^(sku|qty|rate|tax|total|amount|inr|hsn|price|paperwork|declared|not\s*applicable)/i)
    ) {
      result.contentSpec = cleanContent.toUpperCase();
    }
  }

  // Guaranteed Content Auto-Fill: If blank or Not Applicable, automatically deduce from Courier Type or Context
  if (!result.contentSpec || result.contentSpec.toUpperCase().includes('NOT APPLICABLE')) {
    const isDocumentShipment =
      result.type === 'DOCUMENT' ||
      effectiveText.match(/\b(?:Type\s*:\s*DOCUMENT|APEX\s*DOC|DOX|\bDOCUMENTS?\b)\b/i);

    if (isDocumentShipment) {
      result.contentSpec = 'DOCUMENTS';
    } else {
      const commonCategories = [
        { pattern: /\b(?:milk\s*analys(?:er|or)|milk\s*tester)\b/i, name: 'MILK ANALYSER' },
        { pattern: /\b(?:electric\s*items?|electrical|electronics?)\b/i, name: 'ELECTRIC ITEMS' },
        { pattern: /\b(?:laptop|notebook|computer|desktop)\b/i, name: 'LAPTOP & ACCESSORIES' },
        { pattern: /\b(?:mobile|smartphone|phone\s*accessories)\b/i, name: 'MOBILE PHONE & ACCESSORIES' },
        { pattern: /\b(?:documents?|papers?|legal\s*papers?|agreements?)\b/i, name: 'DOCUMENTS' },
        { pattern: /\b(?:cloth(?:es|ing)?|garments?|saree|dress|textile|apparel)\b/i, name: 'CLOTHING & APPAREL' },
        { pattern: /\b(?:medicines?|pharmaceuticals?|tablets?|capsules?)\b/i, name: 'MEDICINES' },
        { pattern: /\b(?:auto\s*parts?|automobile|vehicle\s*parts?|spare\s*parts?)\b/i, name: 'AUTO SPARE PARTS' },
        { pattern: /\b(?:books?|study\s*material|stationery)\b/i, name: 'BOOKS & STATIONERY' },
        { pattern: /\b(?:hardware|tools?|industrial\s*goods)\b/i, name: 'HARDWARE TOOLS' },
      ];

      for (const cat of commonCategories) {
        if (cat.pattern.test(effectiveText)) {
          result.contentSpec = cat.name;
          break;
        }
      }

      if (!result.contentSpec) {
        result.contentSpec = isDocumentShipment ? 'DOCUMENTS' : 'ELECTRIC ITEMS';
      }
    }
  }

  // Declared Value
  const declaredMatch = effectiveText.match(/(?:Declared\s*Value|Total(?:\s*INR)?|Invoice\s*Value|COD\s*Amount)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (declaredMatch && declaredMatch[1]) {
    result.declaredValue = declaredMatch[1].trim();
  } else {
    result.declaredValue = 'Not Applicable';
  }

  // Courier Charges
  const chargesMatch = effectiveText.match(/(?:Courier\s*Charges|Freight|Booking\s*Charge)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (chargesMatch && chargesMatch[1]) {
    result.courierCharges = parseFloat(chargesMatch[1]);
  }

  // Date
  const dateMatch = effectiveText.match(/(?:Date|Sale\s*Date)\s*[:\-]?\s*(\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2}|\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4}|[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4})/i);
  if (dateMatch && dateMatch[1]) {
    result.date = dateMatch[1].trim();
  }

  return result;
}

// Backward compatibility alias for existing code
export const parseDtdcOcrText = parseCourierOcrText;
