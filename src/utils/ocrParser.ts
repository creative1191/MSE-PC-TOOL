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

  // Detect courier or use preferred
  const detected = detectCourierFromText(rawText) || preferredCourier || 'DTDC';
  result.detectedCourier = detected;

  // ================= 1. AWB NUMBER EXTRACTION =================
  if (detected === 'BLUEDART') {
    const bdAwbMatch = rawText.match(/(?:Waybill|Way\s*Bill|AWB(?:\s*Number)?|Air\s*Waybill|WBN|Tracking\s*(?:No|#)|Wb\s*No)\s*[:#\.\-]?\s*([0-9]{8,12})/i);
    if (bdAwbMatch && bdAwbMatch[1]) {
      result.awb = bdAwbMatch[1].trim();
    } else {
      const bdFallback = rawText.match(/\b([0-9]{9,11})\b/);
      if (bdFallback && bdFallback[1]) {
        result.awb = bdFallback[1].trim();
      }
    }
  } else if (detected === 'DELHIVERY') {
    // Delhivery AWB: e.g. "AWB Number: 34084710004874", "AWB: 1412345678901"
    const delAwbMatch = rawText.match(/(?:AWB(?:\s*Number)?|Waybill|LR\s*No|Tracking\s*(?:No|#)|Order\s*ID)\s*[:#\.\-]?\s*([0-9]{12,15})/i);
    if (delAwbMatch && delAwbMatch[1]) {
      result.awb = delAwbMatch[1].trim();
    } else {
      const delFallback = rawText.match(/\b([0-9]{12,14})\b/);
      if (delFallback && delFallback[1]) {
        result.awb = delFallback[1].trim();
      }
    }
  } else {
    // DTDC: Starts with 7D, 7X, or 7 followed by digits/letters
    const awbPrimary = rawText.match(/AWB\s*No\.?\s*[:\-]?\s*([A-Z0-9]{8,})/i);
    if (awbPrimary && awbPrimary[1]) {
      result.awb = awbPrimary[1].trim().toUpperCase();
    } else {
      const awbSecondary = rawText.match(/\b(7[A-Z0-9]{9,12})\b/);
      if (awbSecondary && awbSecondary[1]) {
        result.awb = awbSecondary[1].trim().toUpperCase();
      }
    }
  }

  // ================= 2. CONSIGNOR (SENDER / BILL FROM) =================
  // Delhivery / Tax Invoice: BILL FROM section
  const billFromSection = rawText.match(
    /(?:BILL\s*FROM|SOLD\s*BY|DISPATCHED\s*FROM|SHIPPER|CONSIGNOR(?:\s*DETAILS)?)\s*[:\-]?\s*([\s\S]+?)(?=(?:SHIPPING\s*ADDRESS|BILLING\s*ADDRESS|BILL\s*TO|SHIP\s*TO|CONSIGNEE|ORDER\s*DETAILS|$))/i
  );

  if (billFromSection && billFromSection[1]) {
    const lines = billFromSection[1]
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.match(/^(email:|gst\s*number:|phone:|tel:)/i));

    if (lines.length > 0) {
      result.consignorName = lines[0]; // e.g. "Maa Sharda Enterprises"
      const addrLines = lines.slice(1);
      if (addrLines.length > 0) {
        result.consignorAddress = addrLines.join(', ');
      }
    }
  } else {
    // Fallback consignor match
    const consignorNameMatch = rawText.match(
      /(?:Consignor(?:\s*Name)?|Shipper(?:\s*Name)?|Sender(?:\s*Name)?|Return\s*To|From(?:\s*Name)?|Vendor|Merchant)\s*[:\-]?\s*([A-Za-z0-9\s\.\-&]{3,45}?)(?:\n|Address|Phone|Contact|Ph|Mob|Tel|GST|$)/i
    );
    if (consignorNameMatch && consignorNameMatch[1]) {
      const sName = consignorNameMatch[1].trim();
      if (!sName.match(/^(address|phone|tel|dtdc|blue dart|delhivery)$/i)) {
        result.consignorName = sName;
      }
    }

    const consignorAddrMatch = rawText.match(
      /(?:Consignor[\s\S]*?Address|Shipper\s*Address|Sender\s*Address|Return\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){0,2})/i
    );
    if (consignorAddrMatch && consignorAddrMatch[1]) {
      result.consignorAddress = consignorAddrMatch[1].replace(/\r?\n/g, ', ').trim();
    }
  }

  // Consignor GSTIN & Origin City
  const gstinMatch = rawText.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
  if (gstinMatch && gstinMatch[1]) {
    result.consignorGstin = gstinMatch[1].trim();
  }

  // Origin detection (from Consignor address or explicit Origin label)
  const originMatch = rawText.match(/(?:Origin|From\s*Station|From\s*City|Shipped\s*From)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\n|Dest|To|,|$)/i);
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
        const pinIndex = words.findIndex(w => w.includes(originPin));
        if (pinIndex > 0 && words[pinIndex - 1].length > 2) {
          result.origin = words[pinIndex - 1].replace(/[^A-Za-z]/g, '').toUpperCase();
        }
      }
    }
  }

  // ================= 3. CONSIGNEE (RECIPIENT / DESTINATION DETAILS) =================
  // Strict scan and map of ALL available recipient details:
  // - consigneeName
  // - consigneeAddress (including PIN code)
  // - consigneePhone
  // - dest (Destination city)
  // - customerRefNo
  // - consigneeGstin

  let shippingRawBlock = '';

  // STRATEGY A: Explicit SHIPPING ADDRESS block (Delhivery / Tax Invoices)
  // STOP before BILLING ADDRESS, BILL TO, ORDER DETAILS, or ITEM DESCRIPTION to avoid repeating identical addresses!
  const shippingSectionMatch = rawText.match(
    /(?:SHIPPING\s*ADDRESS|SHIP\s*TO|DELIVER(?:Y)?\s*TO|CONSIGNEE\s*\((?:SHIP\s*TO|DELIVER\s*TO)\)|DELIVERY\s*ADDRESS|CONSIGNEE\s*ADDRESS)\s*[:\-]?\s*([\s\S]+?)(?=(?:BILLING\s*ADDRESS|BILL\s*TO\s*ADDRESS|BILL\s*TO|ORDER\s*DETAILS|ITEM\s*DESCRIPTION|PAYMENT\s*TYPE|POWERED\s*BY|$))/i
  );

  // STRATEGY B: Consignee block (DTDC / Blue Dart Consignment notes)
  const consigneeBlockMatch = rawText.match(
    /(?:CONSIGNEE(?:'S)?(?:\s*DETAILS)?|RECEIVER(?:'S)?(?:\s*DETAILS)?|DELIVERY\s*ADDRESS)\s*[:\-]?\s*([\s\S]+?)(?=(?:CONSIGNOR|SHIPPER|BOOKING\s*BRANCH|TECHNICAL\s*SPECS|ORDER\s*DETAILS|RISK\s*SURCHARGE|$))/i
  );

  if (shippingSectionMatch && shippingSectionMatch[1] && shippingSectionMatch[1].trim().length > 5) {
    shippingRawBlock = shippingSectionMatch[1].trim();
  } else if (consigneeBlockMatch && consigneeBlockMatch[1] && consigneeBlockMatch[1].trim().length > 5) {
    shippingRawBlock = consigneeBlockMatch[1].trim();
  }

  if (shippingRawBlock) {
    // 3.1 Extract phone from within shipping block first
    const blockPhone = extractPhoneNumber(shippingRawBlock);
    if (blockPhone) {
      result.consigneePhone = blockPhone;
    }

    // 3.2 Extract recipient PIN code
    const blockPin = extractPinCode(shippingRawBlock);

    // 3.3 Split block into clean lines
    const lines = shippingRawBlock
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.match(/^(billing|shipping|order|sales|payment|awb|tax|invoice|phone|tel|mob|contact)/i));

    if (lines.length > 0) {
      // Line 0 is typically the Consignee Name (e.g. "Gurvinder singh" or "Mantra softech india pvt ltd")
      let rawName = lines[0]
        .replace(/^(?:Name|Consignee(?:'s)?(?:\s*Name)?|Receiver(?:\s*Name)?|To|Customer(?:\s*Name)?)\s*[:\-]?\s*/i, '')
        .trim();

      // Check if name has attached address on the same line
      const nameParts = rawName.split(/[,;\t]+/);
      if (nameParts.length > 1 && nameParts[0].length >= 3) {
        result.consigneeName = nameParts[0].trim();
        const remainingAddr = [nameParts.slice(1).join(', '), ...lines.slice(1)].join(', ');
        result.consigneeAddress = cleanAddressString(remainingAddr, result.consigneeName);
      } else {
        result.consigneeName = rawName;
        const addrLines = lines.slice(1);
        if (addrLines.length > 0) {
          result.consigneeAddress = cleanAddressString(addrLines.join(', '), result.consigneeName);
        } else {
          // Single-line block fallback
          const words = rawName.split(/\s+/);
          if (words.length >= 4) {
            result.consigneeName = words.slice(0, 2).join(' ');
            result.consigneeAddress = cleanAddressString(words.slice(2).join(' '), result.consigneeName);
          }
        }
      }
    }

    // Ensure PIN code is included in consigneeAddress if found
    if (blockPin && result.consigneeAddress && !result.consigneeAddress.includes(blockPin)) {
      result.consigneeAddress = `${result.consigneeAddress} - ${blockPin}`;
    }
  }

  // STRATEGY C: Explicit Field Matchers for DTDC & Blue Dart formats
  if (!result.consigneeName) {
    const consigneeNameMatch = rawText.match(
      /(?:Consignee(?:['’]s)?(?:\s*Name)?|Receiver(?:['’]s)?(?:\s*Name)?|Customer(?:\s*Name)?|\bTo\b\s*[:\-])\s*[:\-]?\s*([A-Za-z0-9\s\.\-&]{3,45}?)(?:\n|Address|Phone|Contact|Ph|Mob|Tel|Pin|GST|$)/i
    );
    if (consigneeNameMatch && consigneeNameMatch[1]) {
      const name = consigneeNameMatch[1].trim();
      if (
        !name.match(/^(address|phone|tel|dtdc|blue dart|delhivery|total|powered|sales|item|payment|order|tax|invoice|discount)/i) &&
        !name.includes('INR') &&
        !name.includes('Powered by') &&
        !name.includes('Total')
      ) {
        result.consigneeName = name;
      }
    }
  }

  if (!result.consigneeAddress) {
    const consigneeAddrMatch = rawText.match(
      /(?:Consignee(?:['’]s)?[\s\S]*?Address|Delivery\s*Address|Ship\s*To\s*Address)\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+){0,4}?)(?=(?:GSTIN|Phone|Contact|Mobile|Tel|Email|Courier\s*Charges|Declared\s*Value|Content|$))/i
    );
    if (consigneeAddrMatch && consigneeAddrMatch[1]) {
      result.consigneeAddress = cleanAddressString(consigneeAddrMatch[1].replace(/\r?\n/g, ', '), result.consigneeName);
    }
  }

  // Safety filter on consigneeName: Never allow "Total INR", "Powered by", or "tal INR"
  if (result.consigneeName) {
    if (
      result.consigneeName.match(/^(total|powered|sales|item|payment|order|tax|invoice|discount)/i) ||
      result.consigneeName.includes('INR') ||
      result.consigneeName.includes('Powered')
    ) {
      result.consigneeName = '';
    }
  }

  // Ensure consigneeAddress is clean and deduplicated
  if (result.consigneeAddress) {
    result.consigneeAddress = cleanAddressString(result.consigneeAddress, result.consigneeName);
  }

  // 3.4 Recipient Phone Extraction fallback
  if (!result.consigneePhone) {
    // Look specifically for phone near Consignee or Receiver
    const consigneePhoneMatch = rawText.match(
      /(?:(?:Consignee|Receiver|Customer|Delivery|Ship\s*To)[\s\S]{0,100}?(?:Phone|Contact|Mobile|Ph|Tel|Mob)\s*[:\-]?\s*)(?:\+?91[\-\s]?)?(?:0)?([6-9]\d{9})\b/i
    );
    if (consigneePhoneMatch && consigneePhoneMatch[1]) {
      result.consigneePhone = consigneePhoneMatch[1].trim();
    } else {
      const generalPhone = extractPhoneNumber(rawText);
      if (generalPhone && generalPhone !== result.consignorPhone) {
        result.consigneePhone = generalPhone;
      }
    }
  }

  // 3.5 Recipient Destination City Extraction
  const detectedDest = extractDestinationCity(rawText, result.consigneeAddress);
  if (detectedDest) {
    result.dest = detectedDest;
  }

  // 3.6 Recipient Customer Ref / Order Number
  const orderRefMatch = rawText.match(/(?:Customer\s*Ref(?:\s*No)?|Order\s*(?:No|ID|Number)|Invoice\s*(?:No|Number)|Ref\s*No)\s*[:\-]?\s*([A-Za-z0-9\-\/]{4,25})/i);
  if (orderRefMatch && orderRefMatch[1]) {
    const ref = orderRefMatch[1].trim();
    if (!ref.match(/^(address|phone|courier|dtdc|bluedart)/i)) {
      result.customerRefNo = ref;
    }
  }

  // 3.7 Recipient GSTIN
  const consigneeGstinMatch = rawText.match(/(?:Consignee\s*GSTIN|Buyer\s*GSTIN|Recipient\s*GSTIN)\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i);
  if (consigneeGstinMatch && consigneeGstinMatch[1]) {
    result.consigneeGstin = consigneeGstinMatch[1].trim();
  }

  // ================= 4. PRODUCT, TYPE & MODE =================
  if (detected === 'BLUEDART') {
    if (rawText.match(/APEX|AIR/i)) {
      result.product = 'APEX';
      result.mode = 'AIR';
    } else if (rawText.match(/SURFACE/i)) {
      result.product = 'SURFACE';
      result.mode = 'SURFACE';
    } else {
      result.product = 'DOMESTIC PRIORITY';
      result.mode = 'AIR';
    }
    result.type = rawText.match(/NON[\-\s]?DOC/i) ? 'NON-DOCUMENT' : 'DOCUMENT';
  } else if (detected === 'DELHIVERY') {
    if (rawText.match(/SURFACE|HEAVY/i)) {
      result.product = 'Heavy Surface';
      result.mode = 'SURFACE';
    } else {
      result.product = 'Express Parcel';
      result.mode = 'AIR';
    }
    result.type = 'NON-DOCUMENT';
  } else {
    // DTDC
    const productMatch = rawText.match(/PRODUCT\s*:\s*([A-Z0-9\s\-]+?)(?:\n|Type|Date|$)/i);
    if (productMatch && productMatch[1]) {
      result.product = productMatch[1].trim();
    }
    const typeMatch = rawText.match(/Type\s*:\s*([A-Za-z\-]+)/i);
    if (typeMatch && typeMatch[1]) {
      result.type = typeMatch[1].trim().toUpperCase().includes('NON') ? 'NON-DOCUMENT' : 'DOCUMENT';
    }
    const modeMatch = rawText.match(/Mode\s*:\s*([A-Za-z]+)/i);
    if (modeMatch && modeMatch[1]) {
      result.mode = modeMatch[1].trim().toUpperCase();
    }
  }

  // ================= 5. WEIGHT & PIECES =================
  const actualWtMatch = rawText.match(/(?:Actual\s*Weight|Weight|Gross\s*Wt|Wt)\s*[:\-]?\s*([0-9\.]+\s*(?:Gms|Kgs|kg|gm|KG))/i);
  if (actualWtMatch && actualWtMatch[1]) {
    result.actualWeight = actualWtMatch[1].trim();
  }

  const chargedWtMatch = rawText.match(/(?:Charged\s*Weight|Chargeable\s*Wt|Vol\s*Weight)\s*[:\-]?\s*([0-9\.]+\s*(?:Gms|Kgs|kg|gm|KG))/i);
  if (chargedWtMatch && chargedWtMatch[1]) {
    result.chargedWeight = chargedWtMatch[1].trim();
  }

  // Pieces: check Qty or No of Pieces
  const piecesMatch = rawText.match(/(?:No\s*Of\s*Pieces|Pieces|Pcs|Quantity|Qty)\s*[:\-]?\s*([0-9]+)/i);
  if (piecesMatch && piecesMatch[1]) {
    result.pieces = piecesMatch[1].trim();
  }

  // ================= 6. CONTENT SPECIFICATION & VALUE =================
  // Comprehensive extraction for Item Description, Goods, Commodity, and Products
  const contentMatch = rawText.match(
    /(?:Item\s*Desc(?:ription)?|Product\s*(?:Description|Name|Title)?|Description\s*Of\s*Goods|Nature\s*Of\s*Goods|Goods\s*Description|Content\s*(?:Specification)?|Contents|Commodity|Particulars|Item\s*Name|\bItems\b|\bContent\b)\s*[:\-]?\s*([A-Za-z0-9\s,\/\.\-&]{2,60}?)(?:\n|SKU|Qty|Declared|Value|Weight|Pieces|Date|Rs|₹|Total|Rate|Tax|HSN|$)/i
  );
  if (contentMatch && contentMatch[1]) {
    const cleanContent = contentMatch[1].replace(/^(?:of|for|is)\s+/i, '').trim();
    if (cleanContent.length >= 2 && cleanContent.length <= 50 && !cleanContent.match(/^(sku|qty|rate|tax|total|amount|inr|hsn|price)/i)) {
      result.contentSpec = cleanContent.toUpperCase();
    }
  }

  // Fallback 1: Scan for common product types if not explicitly matched above
  if (!result.contentSpec) {
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
      if (cat.pattern.test(rawText)) {
        result.contentSpec = cat.name;
        break;
      }
    }
  }

  // Fallback 2: Default standard content specification so it is NEVER empty
  if (!result.contentSpec) {
    result.contentSpec = result.type === 'DOCUMENT' ? 'DOCUMENTS' : 'ELECTRIC ITEMS';
  }

  const declaredMatch = rawText.match(/(?:Declared\s*Value|Total(?:\s*INR)?|Invoice\s*Value|COD\s*Amount)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (declaredMatch && declaredMatch[1]) {
    result.declaredValue = declaredMatch[1].trim();
  }

  // ================= 7. COURIER CHARGES =================
  const chargesMatch = rawText.match(/(?:Courier\s*Charges|Freight|Booking\s*Charge)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (chargesMatch && chargesMatch[1]) {
    result.courierCharges = parseFloat(chargesMatch[1]);
  }

  // ================= 8. DATE =================
  const dateMatch = rawText.match(/(?:Date|Sale\s*Date)\s*[:\-]?\s*(\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2}|\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4}|[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4})/i);
  if (dateMatch && dateMatch[1]) {
    result.date = dateMatch[1].trim();
  }

  return result;
}

// Backward compatibility alias for existing code
export const parseDtdcOcrText = parseCourierOcrText;
