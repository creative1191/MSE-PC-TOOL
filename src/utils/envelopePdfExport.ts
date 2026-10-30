import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import {
  CourierAddress,
  CourierPrintSettings,
  EnvelopePresetConfig,
  PostalBadgeType,
} from '../types/courierPrint';
import { ENVELOPE_PRESETS, toUpperClean } from './indianPostalData';

export function generateBarcodeDataUrl(value: string): string | null {
  if (!value) return null;
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value.toUpperCase().trim(), {
      format: 'CODE128',
      width: 2,
      height: 48,
      displayValue: true,
      fontSize: 12,
      textMargin: 3,
      margin: 4,
      background: '#ffffff',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Failed to generate barcode data URL:', e);
    return null;
  }
}

export function getEnvelopeDimensionsMm(settings: CourierPrintSettings): {
  widthMm: number;
  heightMm: number;
  orientation: 'landscape' | 'portrait';
} {
  const preset: EnvelopePresetConfig =
    ENVELOPE_PRESETS[settings.preset] || ENVELOPE_PRESETS.DL;

  let width = settings.preset === 'CUSTOM' ? settings.customWidthMm : preset.widthMm;
  let height = settings.preset === 'CUSTOM' ? settings.customHeightMm : preset.heightMm;

  if (settings.orientation === 'PORTRAIT' && width > height) {
    const tmp = width;
    width = height;
    height = tmp;
  } else if (settings.orientation === 'LANDSCAPE' && height > width) {
    const tmp = width;
    width = height;
    height = tmp;
  }

  const orientation = width >= height ? 'landscape' : 'portrait';
  return { widthMm: width, heightMm: height, orientation };
}

export function formatCityStatePin(city: string, state: string, pin: string): string {
  const parts: string[] = [];
  if (city) parts.push(toUpperClean(city));
  if (state) parts.push(toUpperClean(state));
  const base = parts.join(', ');
  const cleanPin = pin ? pin.replace(/\D/g, '') : '';

  if (base && cleanPin) {
    return `${base} - ${cleanPin}`;
  }
  if (cleanPin) return cleanPin;
  return base;
}

function renderEnvelopeOnPdf(
  doc: jsPDF,
  to: CourierAddress,
  from: CourierAddress,
  settings: CourierPrintSettings,
  widthMm: number,
  heightMm: number
) {
  let mX = 12;
  let mY = 10;
  if (settings.marginPreset === 'COMPACT') {
    mX = 8;
    mY = 7;
  } else if (settings.marginPreset === 'WIDE') {
    mX = 18;
    mY = 14;
  } else if (settings.marginPreset === 'CUSTOM') {
    mX = settings.customMarginMm || 12;
    mY = settings.customMarginMm || 10;
  }

  const scale = settings.fontScale || 1.0;
  const isLandscape = widthMm >= heightMm;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, widthMm, heightMm, 'F');

  if (settings.boxedContainers) {
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.rect(mX - 2, mY - 2, widthMm - (mX * 2) + 4, heightMm - (mY * 2) + 4);
  }

  if (settings.postalBadge && settings.postalBadge !== 'NONE') {
    renderPostalBadgeOnPdf(doc, settings.postalBadge, widthMm - mX - 45, mY - 2, 45, 10);
  }

  const toBoxWidth = (widthMm - mX * 2) * (isLandscape ? 0.82 : 0.95);
  const toBoxX = mX;
  const toBoxY = mY + (settings.postalBadge !== 'NONE' ? 7 : 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11 * scale);
  doc.setTextColor(0, 0, 0);
  doc.text(toUpperClean(settings.receiverPrefix || 'TO:'), toBoxX, toBoxY);

  let currentY = toBoxY + 5.5;

  doc.setFont('helvetica', settings.boldNames ? 'bold' : 'normal');
  doc.setFontSize(13 * scale);
  const receiverName = toUpperClean(to.name || 'RECEIVER NAME');
  doc.text(receiverName, toBoxX, currentY);
  currentY += 5.2 * scale;

  if (to.company) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10 * scale);
    doc.text(toUpperClean(to.company), toBoxX, currentY);
    currentY += 4.5 * scale;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5 * scale);
  const line1 = toUpperClean(to.addressLine1 || '');
  if (line1) {
    const splitLine1 = doc.splitTextToSize(line1, toBoxWidth);
    doc.text(splitLine1, toBoxX, currentY);
    currentY += splitLine1.length * 4.2 * scale;
  }

  const line2 = toUpperClean(to.addressLine2 || '');
  if (line2) {
    const splitLine2 = doc.splitTextToSize(line2, toBoxWidth);
    doc.text(splitLine2, toBoxX, currentY);
    currentY += splitLine2.length * 4.2 * scale;
  }

  if (to.landmark) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5 * scale);
    const landmarkText = `LANDMARK: ${toUpperClean(to.landmark)}`;
    doc.text(landmarkText, toBoxX, currentY);
    currentY += 4.2 * scale;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11 * scale);
  const cityStatePin = formatCityStatePin(to.city, to.state, to.pinCode);
  doc.text(cityStatePin, toBoxX, currentY);
  currentY += 4.8 * scale;

  if (to.mobile) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10 * scale);
    doc.text(`MOBILE: ${to.mobile}`, toBoxX, currentY);
  }

  const fromBoxWidth = Math.min(85, (widthMm - mX * 2) * 0.45);
  const fromBoxHeight = 36 * scale;

  const isFromRight = settings.fromPosition === 'BOTTOM_RIGHT';
  const fromBoxX = isFromRight ? widthMm - mX - fromBoxWidth : mX;
  const fromBoxY = heightMm - mY - fromBoxHeight;

  if (settings.showBarcode && settings.barcodeValue) {
    const barcodeX = isFromRight ? mX : widthMm - mX - 55;
    const barcodeY = heightMm - mY - 22;
    const barcodeDataUrl = generateBarcodeDataUrl(settings.barcodeValue);
    if (barcodeDataUrl) {
      doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, 52, 18);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5 * scale);
  doc.setTextColor(30, 41, 59);
  doc.text(toUpperClean(settings.senderPrefix || 'FROM:'), fromBoxX, fromBoxY);

  let fromY = fromBoxY + 3.8;

  doc.setFont('helvetica', settings.boldNames ? 'bold' : 'normal');
  doc.setFontSize(9.5 * scale);
  doc.setTextColor(0, 0, 0);
  doc.text(toUpperClean(from.name || 'SENDER NAME'), fromBoxX, fromY);
  fromY += 3.8 * scale;

  if (from.company) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5 * scale);
    doc.text(toUpperClean(from.company), fromBoxX, fromY);
    fromY += 3.4 * scale;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5 * scale);
  const sLine1 = toUpperClean(from.addressLine1 || '');
  if (sLine1) {
    const splitS1 = doc.splitTextToSize(sLine1, fromBoxWidth);
    doc.text(splitS1, fromBoxX, fromY);
    fromY += splitS1.length * 3.4 * scale;
  }

  const sLine2 = toUpperClean(from.addressLine2 || '');
  if (sLine2) {
    const splitS2 = doc.splitTextToSize(sLine2, fromBoxWidth);
    doc.text(splitS2, fromBoxX, fromY);
    fromY += splitS2.length * 3.4 * scale;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5 * scale);
  const fromCityPin = formatCityStatePin(from.city, from.state, from.pinCode);
  doc.text(fromCityPin, fromBoxX, fromY);
  fromY += 3.6 * scale;

  if (from.mobile) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8 * scale);
    doc.text(`MOB: ${from.mobile}`, fromBoxX, fromY);
  }
}

function renderPostalBadgeOnPdf(
  doc: jsPDF,
  badge: PostalBadgeType,
  x: number,
  y: number,
  w: number,
  h: number
) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.setFillColor(248, 250, 252);
  doc.rect(x, y, w, h, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  let label = 'SPEED POST';
  if (badge === 'REGISTERED_POST') label = 'REGISTERED POST';
  else if (badge === 'BOOK_POST') label = 'BOOK POST';
  else if (badge === 'FRAGILE') label = '⚠️ FRAGILE / HANDLE WITH CARE';
  else if (badge === 'CASH_ON_DELIVERY') label = 'CASH ON DELIVERY (C.O.D.)';
  else if (badge === 'AIRMAIL') label = '✈️ BY AIR MAIL / PAR AVION';
  else if (badge === 'EXPRESS_PARCEL') label = 'EXPRESS PARCEL';
  else if (badge === 'DOCUMENT') label = 'DOCUMENTS ONLY';

  doc.text(label, x + w / 2, y + 6.5, { align: 'center' });
}

export async function exportEnvelopeToPdf(
  to: CourierAddress,
  from: CourierAddress,
  settings: CourierPrintSettings,
  customFilename?: string
): Promise<void> {
  const { widthMm, heightMm, orientation } = getEnvelopeDimensionsMm(settings);

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  renderEnvelopeOnPdf(doc, to, from, settings, widthMm, heightMm);

  const safeName = to.name ? to.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Envelope';
  const filename = customFilename || `CourierPrint_${settings.preset}_${safeName}.pdf`;
  doc.save(filename);
}

export async function exportBatchEnvelopesToPdf(
  recipients: CourierAddress[],
  from: CourierAddress,
  settings: CourierPrintSettings,
  customFilename?: string
): Promise<void> {
  if (!recipients.length) return;

  const { widthMm, heightMm, orientation } = getEnvelopeDimensionsMm(settings);

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  recipients.forEach((to, idx) => {
    if (idx > 0) {
      doc.addPage([widthMm, heightMm], orientation);
    }
    renderEnvelopeOnPdf(doc, to, from, settings, widthMm, heightMm);
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `CourierPrint_Batch_${recipients.length}_Envelopes_${timestamp}.pdf`;
  doc.save(filename);
}
