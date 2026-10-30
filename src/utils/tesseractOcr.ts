import { createWorker } from 'tesseract.js';
import { CourierAddress, DualOcrResult } from '../types/courierPrint';
import { parseRawAddressText } from './indianPostalData';

let cachedWorker: any = null;

async function getWorker(onProgress?: (progress: number, status: string) => void) {
  if (cachedWorker) return cachedWorker;

  const worker = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (m && m.progress !== undefined && onProgress) {
        onProgress(Math.round(m.progress * 100), m.status || 'Processing');
      }
    },
  });

  cachedWorker = worker;
  return worker;
}

function preprocessCanvas(
  sourceImage: HTMLImageElement,
  sx: number,
  sy: number,
  sWidth: number,
  sHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sWidth;
  canvas.height = sHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(sourceImage, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

  const imgData = ctx.getImageData(0, 0, sWidth, sHeight);
  const data = imgData.data;
  const contrastFactor = 1.25;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = (gray - 128) * contrastFactor + 128;
    gray = Math.max(0, Math.min(255, gray));

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for OCR'));
    img.src = src;
  });
}

export async function runCourierOcr(
  imageSrc: string,
  forceSplitDual: boolean = false,
  onProgress?: (percent: number, status: string) => void
): Promise<DualOcrResult> {
  const img = await loadImage(imageSrc);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const aspectRatio = width / height;

  const shouldSplit = forceSplitDual || aspectRatio >= 1.8;
  const worker = await getWorker(onProgress);

  if (shouldSplit) {
    const halfWidth = Math.floor(width / 2);

    const leftCanvas = preprocessCanvas(img, 0, 0, halfWidth, height);
    const rightCanvas = preprocessCanvas(img, halfWidth, 0, width - halfWidth, height);

    const leftDataUrl = leftCanvas.toDataURL('image/png');
    const rightDataUrl = rightCanvas.toDataURL('image/png');

    if (onProgress) onProgress(20, 'Scanning Left Side (Sender)...');
    const leftRes = await worker.recognize(leftCanvas);
    const leftText = leftRes.data.text || '';

    if (onProgress) onProgress(60, 'Scanning Right Side (Receiver)...');
    const rightRes = await worker.recognize(rightCanvas);
    const rightText = rightRes.data.text || '';

    if (onProgress) onProgress(95, 'Parsing structured addresses...');

    const leftHasTo = /(?:TO|CONSIGNEE|RECEIVER)\b/i.test(leftText);
    const rightHasFrom = /(?:FROM|CONSIGNOR|SENDER)\b/i.test(rightText);

    let senderText = leftText;
    let receiverText = rightText;

    if (leftHasTo && rightHasFrom) {
      senderText = rightText;
      receiverText = leftText;
    }

    const senderAddr = parseRawAddressText(senderText, 'sender-ocr');
    const receiverAddr = parseRawAddressText(receiverText, 'receiver-ocr');

    if (onProgress) onProgress(100, 'Complete');

    return {
      rawText: `[LEFT / SENDER]:\n${leftText}\n\n[RIGHT / RECEIVER]:\n${rightText}`,
      sender: senderAddr,
      receiver: receiverAddr,
      isSplitDual: true,
      confidence: Math.round(((leftRes.data.confidence || 75) + (rightRes.data.confidence || 75)) / 2),
      previewImageUrl: imageSrc,
      leftImageUrl: leftDataUrl,
      rightImageUrl: rightDataUrl,
    };
  }

  const processedCanvas = preprocessCanvas(img, 0, 0, width, height);
  if (onProgress) onProgress(30, 'Recognizing address slip text...');
  const res = await worker.recognize(processedCanvas);
  const text = res.data.text || '';

  if (onProgress) onProgress(90, 'Extracting fields...');

  const toSplitMatch = text.search(/(?:^|\n)(?:TO|CONSIGNEE|DELIVER TO)\s*[:\-]/i);
  const fromSplitMatch = text.search(/(?:^|\n)(?:FROM|CONSIGNOR|SENDER)\s*[:\-]/i);

  let senderAddr: Partial<CourierAddress> = {};
  let receiverAddr: Partial<CourierAddress> = {};

  if (toSplitMatch !== -1 && fromSplitMatch !== -1) {
    if (toSplitMatch < fromSplitMatch) {
      const toSection = text.substring(toSplitMatch, fromSplitMatch);
      const fromSection = text.substring(fromSplitMatch);
      receiverAddr = parseRawAddressText(toSection);
      senderAddr = parseRawAddressText(fromSection);
    } else {
      const fromSection = text.substring(fromSplitMatch, toSplitMatch);
      const toSection = text.substring(toSplitMatch);
      senderAddr = parseRawAddressText(fromSection);
      receiverAddr = parseRawAddressText(toSection);
    }
  } else {
    receiverAddr = parseRawAddressText(text);
  }

  if (onProgress) onProgress(100, 'Complete');

  return {
    rawText: text,
    sender: senderAddr,
    receiver: receiverAddr,
    isSplitDual: false,
    confidence: Math.round(res.data.confidence || 70),
    previewImageUrl: imageSrc,
  };
}
