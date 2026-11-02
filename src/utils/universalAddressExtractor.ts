import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore Vite query suffix for asset url
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { CourierAddress, DualOcrResult } from '../types/courierPrint';
import { parseRawAddressText, toUpperClean, lookupPinCode } from './indianPostalData';
import { runCourierOcr } from './tesseractOcr';

// Configure PDF worker for offline operation
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  if (typeof pdfWorkerUrl === 'string' && pdfWorkerUrl.length > 0) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  }
}

export interface UniversalExtractResult {
  text: string;
  parsedAddress: CourierAddress;
  dualResult?: DualOcrResult | null;
  fileType: 'IMAGE' | 'PDF' | 'EXCEL' | 'DOC' | 'TEXT';
}

/**
 * Universal Offline File & Document Address Extractor
 * Supports:
 * - Images (.png, .jpg, .jpeg, .webp) -> Tesseract OCR
 * - PDF documents (.pdf) -> Native PDF text layer, fallback to OCR
 * - Spreadsheets (.xlsx, .xls, .csv) -> SheetJS XLSX table parsing
 * - Word documents (.docx, .doc) -> XML stream text extraction
 * - Text files (.txt) -> Direct UTF-8 reading
 */
export async function extractAddressFromAnyFile(
  file: File,
  forceDualSplit: boolean = false,
  onProgress?: (pct: number, msg: string) => void
): Promise<UniversalExtractResult> {
  const fileName = file.name.toLowerCase();

  // 1. SPREADSHEETS (.xlsx, .xls, .csv)
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    onProgress?.(30, 'Reading spreadsheet table...');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0] || '';
    const sheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const textLines: string[] = [];
    for (const row of rows) {
      if (Array.isArray(row)) {
        const cleanRow = row
          .map((c) => (c !== null && c !== undefined ? String(c).trim() : ''))
          .filter(Boolean)
          .join(', ');
        if (cleanRow) textLines.push(cleanRow);
      }
    }
    const combinedText = textLines.join('\n');
    const parsed = parseRawAddressText(combinedText);

    onProgress?.(100, 'Spreadsheet parsed successfully!');
    return {
      text: combinedText,
      parsedAddress: parsed,
      fileType: 'EXCEL',
    };
  }

  // 2. TEXT FILES (.txt)
  if (fileName.endsWith('.txt')) {
    onProgress?.(50, 'Reading text file...');
    const text = await file.text();
    const parsed = parseRawAddressText(text);
    onProgress?.(100, 'Text extracted!');
    return {
      text,
      parsedAddress: parsed,
      fileType: 'TEXT',
    };
  }

  // 3. WORD DOCUMENTS (.docx, .doc)
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    onProgress?.(40, 'Extracting document text...');
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawString = decoder.decode(uint8);

    // Extract textual content from XML tags if docx, or clean strings
    const matches = rawString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    let extractedText = '';
    if (matches && matches.length > 0) {
      extractedText = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .join(' ');
    } else {
      // Fallback clean plain printable ascii/unicode tokens
      const words = rawString.match(/[a-zA-Z0-9\s,.\-+#/]{4,}/g);
      extractedText = words ? words.slice(0, 50).join('\n') : '';
    }

    const parsed = parseRawAddressText(extractedText);
    onProgress?.(100, 'Document parsed!');
    return {
      text: extractedText,
      parsedAddress: parsed,
      fileType: 'DOC',
    };
  }

  // 4. PDF DOCUMENTS (.pdf)
  if (fileName.endsWith('.pdf')) {
    onProgress?.(20, 'Opening PDF document...');
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
    });
    const pdf = await loadingTask.promise;
    let fullPdfText = '';

    for (let p = 1; p <= Math.min(pdf.numPages, 3); p++) {
      onProgress?.(20 + Math.floor((p / pdf.numPages) * 30), `Reading page ${p}...`);
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((it: any) => ('str' in it ? it.str : ''))
        .filter(Boolean);
      fullPdfText += ' ' + pageStrings.join(' ') + '\n';
    }

    // If PDF contains selectable text
    if (fullPdfText.replace(/\s/g, '').length > 25) {
      const parsed = parseRawAddressText(fullPdfText);
      onProgress?.(100, 'PDF text extracted!');
      return {
        text: fullPdfText,
        parsedAddress: parsed,
        fileType: 'PDF',
      };
    }

    // If PDF is a scanned bitmap without text layer, render page 1 to canvas and run OCR
    onProgress?.(50, 'Scanned PDF detected. Rendering page for OCR...');
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // @ts-ignore
      await firstPage.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');
      const ocrRes = await runCourierOcr(dataUrl, forceDualSplit, (pct, msg) => {
        onProgress?.(50 + Math.floor(pct * 0.5), msg);
      });

      return {
        text: ocrRes.rawText,
        parsedAddress: (ocrRes.receiver as CourierAddress) || parseRawAddressText(ocrRes.rawText),
        dualResult: ocrRes.isSplitDual ? ocrRes : null,
        fileType: 'PDF',
      };
    }
  }

  // 5. IMAGES (.png, .jpg, .jpeg, .webp, camera scans)
  onProgress?.(15, 'Loading image for OCR...');
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const ocrRes = await runCourierOcr(dataUrl, forceDualSplit, onProgress);
  return {
    text: ocrRes.rawText,
    parsedAddress: (ocrRes.receiver as CourierAddress) || parseRawAddressText(ocrRes.rawText),
    dualResult: ocrRes.isSplitDual || (ocrRes.sender?.name && ocrRes.receiver?.name) ? ocrRes : null,
    fileType: 'IMAGE',
  };
}
