import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { DTDCBillData } from '../types';
import { formatAmount } from '../components/DtdcBillLayout';
import { COURIER_CONFIGS } from '../data/courierConfigs';

/**
 * Captures the live visible print sheet element directly at high resolution (pixelRatio: 2.5).
 * Enforces standard A4 pixel bounds (794px for portrait, 1123px for landscape) so elements
 * inside scrollable preview containers are NEVER clipped or truncated on the right edge.
 */
async function captureLiveElement(
  element: HTMLElement,
  isLandscape: boolean = false,
  isHighRes: boolean = true
): Promise<string> {
  const pixelRatio = isHighRes ? 2.5 : 1.8;
  const targetWidth = isLandscape ? 1123 : 794;
  const targetHeight = Math.max(element.scrollHeight, element.offsetHeight, isLandscape ? 794 : 1123);

  return await toPng(element, {
    width: targetWidth,
    height: targetHeight,
    pixelRatio,
    backgroundColor: '#ffffff',
    skipFonts: true,
    cacheBust: false,
    style: {
      width: `${targetWidth}px`,
      minWidth: `${targetWidth}px`,
      maxWidth: `${targetWidth}px`,
      margin: '0',
    },
    filter: (node: any) => !node?.classList?.contains?.('no-print'),
  });
}

/**
 * Downloads a high-resolution PNG of the exact courier bill.
 */
export async function downloadBillAsPng(
  element: HTMLElement,
  data: DTDCBillData,
  isHighRes: boolean = true
) {
  try {
    const courier = data.courier || 'DTDC';
    const config = COURIER_CONFIGS[courier] || COURIER_CONFIGS.DTDC;
    const isLandscape = data.layoutMode === 'SINGLE_LANDSCAPE';

    const safeName = (data.consignorName || config.shortName)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    const dest = (data.dest || 'SHIP').replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${config.shortName}_${safeName}_${data.courierCharges || 0}rs_${dest}_${isHighRes ? 'HighRes' : 'Std'}.png`;

    const imgData = await captureLiveElement(element, isLandscape, isHighRes);
    const link = document.createElement('a');
    link.href = imgData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    throw err;
  }
}

/**
 * Downloads an exact pixel-perfect PDF of the live courier bill sheet (A4 Portrait 3-copies or Landscape).
 * Renders the exact same layout (3 stacked copies with barcodes, official headers, cut lines) at 300 DPI.
 * Applies a 6mm safe page margin so the receipt NEVER touches or exceeds the page borders.
 */
export async function downloadBillAsPdf(element: HTMLElement, data: DTDCBillData) {
  const courier = data.courier || 'DTDC';
  const config = COURIER_CONFIGS[courier] || COURIER_CONFIGS.DTDC;
  const isLandscape = data.layoutMode === 'SINGLE_LANDSCAPE';

  const safeName = (data.consignorName || config.shortName)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  const dest = (data.dest || 'SHIP').replace(/[^a-zA-Z0-9]/g, '');
  const suffix = data.layoutMode === '3_COPIES_PORTRAIT' ? '_3Copies' : '';
  const filename = `${config.shortName}_${safeName}_${data.courierCharges || 0}rs_${dest}${suffix}.pdf`;

  // 1. Capture the live print sheet directly with full A4 canvas width
  const imgData = await captureLiveElement(element, isLandscape, true);

  // 2. Build standard A4 PDF
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = isLandscape ? 297 : 210;
  const pdfHeight = isLandscape ? 210 : 297;

  // Safe 6mm margins around the A4 page so receipt borders NEVER clip or touch the paper edge
  const marginX = 6;
  const marginY = 6;
  const maxW = pdfWidth - (marginX * 2);
  const maxH = pdfHeight - (marginY * 2);

  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  
  let renderW = maxW;
  let renderH = renderW / ratio;

  if (renderH > maxH) {
    renderH = maxH;
    renderW = renderH * ratio;
  }

  const posX = (pdfWidth - renderW) / 2;
  const posY = data.paperSaveMode ? marginY : (pdfHeight - renderH) / 2;

  pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
  pdf.save(filename);
  return true;
}

/**
 * Downloads standalone editable HTML template.
 */
export function downloadBillAsHtml(data: DTDCBillData) {
  const courier = data.courier || 'DTDC';
  const config = COURIER_CONFIGS[courier] || COURIER_CONFIGS.DTDC;
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.shortName} Bill - ${data.awb}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .bill { background: #fff; border: 2px solid #000; padding: 12px; max-width: 900px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
    .charges-box { border: 2px solid #000; padding: 6px 14px; font-weight: bold; font-size: 16px; display: inline-block; }
    .table { width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; margin: 8px 0; }
    .table th, .table td { border: 1px solid #000; padding: 4px; }
  </style>
</head>
<body>
  <div class="bill">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:8px;">
      <h2 style="margin:0; color:${config.themeColor};">${config.fullName.toUpperCase()} - ${config.docTitle}</h2>
      <div><strong>${config.awbLabel}: ${data.awb}</strong> | Mode: ${data.mode} | Date: ${data.date}</div>
    </div>
    <div class="grid">
      <div>
        <strong>CONSIGNOR:</strong> ${data.consignorName}<br>
        Address: <strong>${data.consignorAddress}</strong><br>
        Contact: ${data.consignorPhone}<br>
        Origin: ${data.origin} | Depot: ${data.senderDepot}
      </div>
      <div>
        <strong>CONSIGNEE:</strong> ${data.consigneeName}<br>
        Address: <strong>${data.consigneeAddress}</strong><br>
        Contact: ${data.consigneePhone}<br>
        Destination: ${data.dest}
      </div>
    </div>
    <table class="table">
      <thead>
        <tr><th>Content</th><th>Declared</th><th>Pieces</th><th>Actual Wt</th><th>Charged Wt</th><th>Dimensions</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.contentSpec}</td>
          <td>${data.declaredValue}</td>
          <td>${data.pieces}</td>
          <td>${data.actualWeight}</td>
          <td>${data.chargedWeight}</td>
          <td>${data.dim}</td>
        </tr>
      </tbody>
    </table>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
      <div class="charges-box">
        Courier Charges: ₹ ${formatAmount(data.courierCharges)}
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.shortName}_${data.awb}_Bill.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
