import React from 'react';
import {
  CourierAddress,
  CourierPrintSettings,
} from '../../types/courierPrint';
import { getEnvelopeDimensionsMm, formatCityStatePin, generateBarcodeDataUrl } from '../../utils/envelopePdfExport';
import { toUpperClean } from '../../utils/indianPostalData';
import { CourierA4SlipLayout } from './CourierA4SlipLayout';
import { A4ThreeSlipSheet } from './A4ThreeSlipSheet';

interface PrintMountProps {
  to: CourierAddress;
  from: CourierAddress;
  settings: CourierPrintSettings;
  batchRecipients?: CourierAddress[] | null;
}

export const PrintMount: React.FC<PrintMountProps> = ({
  to,
  from,
  settings,
  batchRecipients,
}) => {
  const { widthMm, heightMm, orientation } = getEnvelopeDimensionsMm(settings);

  // Margin calculation
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
  const isFromRight = settings.fromPosition === 'BOTTOM_RIGHT';

  const isA4SheetPreset =
    settings.preset === 'A4_3_SLIPS' ||
    settings.preset === 'A4_COURIER_SLIP' ||
    settings.preset === 'A4';

  // Exact page size directive for Chromium print engine:
  // For A4 sheets: A4 portrait
  // For Envelopes (DL, C6, C5, C4, Custom): exact widthMm and heightMm
  const pageSizeDirective = isA4SheetPreset
    ? 'A4 portrait'
    : `${widthMm}mm ${heightMm}mm`;

  const recipients = batchRecipients && batchRecipients.length > 0 ? batchRecipients : [to];

  return (
    <>
      {/* Injected True-Scale @page CSS Rule for Window.print() - Complete Print Isolation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: ${pageSizeDirective};
              margin: 0;
            }
            body, html {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: #ffffff !important;
              overflow: visible !important;
            }
            /* Strictly eliminate all non-print screen elements */
            .no-print,
            .no-print *,
            header,
            nav,
            aside,
            footer,
            button,
            input,
            textarea,
            select,
            .windows-titlebar,
            .studio-screen-ui {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .courierprint-mount {
              display: block !important;
              visibility: visible !important;
              width: ${widthMm}mm !important;
              height: auto !important;
              margin: 0 auto !important;
              padding: 0 !important;
              position: static !important;
              background: #ffffff !important;
            }
            .envelope-page {
              width: ${widthMm}mm !important;
              height: ${heightMm}mm !important;
              min-width: ${widthMm}mm !important;
              min-height: ${heightMm}mm !important;
              max-width: ${widthMm}mm !important;
              max-height: ${heightMm}mm !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              break-after: page !important;
              position: relative !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
              margin: 0 auto !important;
            }
            .envelope-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        `,
      }} />

      {/* Actual Hidden/Print Container */}
      <div className="hidden courierprint-mount print:block" style={{ width: `${widthMm}mm`, height: 'auto' }}>
        {recipients.map((rec, idx) => {
          const toInlineCityPin = formatCityStatePin(rec.city, rec.state, rec.pinCode);
          const fromInlineCityPin = formatCityStatePin(from.city, from.state, from.pinCode);
          const barcodeDataUrl = settings.showBarcode && settings.barcodeValue
            ? generateBarcodeDataUrl(settings.barcodeValue)
            : null;

          if (settings.preset === 'A4_3_SLIPS' || settings.preset === 'A4_COURIER_SLIP') {
            return (
              <div
                key={rec.id || `envelope-page-${idx}`}
                className="envelope-page relative bg-white text-black box-border select-none"
                style={{
                  width: '210mm',
                  height: '297mm',
                  minWidth: '210mm',
                  minHeight: '297mm',
                  fontFamily: 'Segoe UI, Arial, sans-serif',
                }}
              >
                <A4ThreeSlipSheet
                  to={rec}
                  from={from}
                  settings={settings}
                  isPrintView={true}
                />
              </div>
            );
          }

          return (
            <div
              key={rec.id || `envelope-page-${idx}`}
              className="envelope-page relative bg-white text-black box-border select-none"
              style={{
                width: `${widthMm}mm`,
                height: `${heightMm}mm`,
                padding: `${mY}mm ${mX}mm`,
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
            >
              {/* Optional Subtle Border */}
              {settings.boxedContainers && (
                <div
                  className="absolute border border-black pointer-events-none"
                  style={{
                    top: `${mY - 2}mm`,
                    left: `${mX - 2}mm`,
                    right: `${mX - 2}mm`,
                    bottom: `${mY - 2}mm`,
                  }}
                />
              )}

              {/* 1. TOP POSTAL BADGE */}
              {settings.postalBadge && settings.postalBadge !== 'NONE' && (
                <div
                  className="absolute border border-black bg-white px-3 py-1 font-bold text-[9px] uppercase tracking-wider"
                  style={{
                    top: `${mY}mm`,
                    right: `${mX}mm`,
                  }}
                >
                  {settings.postalBadge.replace(/_/g, ' ')}
                </div>
              )}

              {/* 2. TO (RECEIVER) BOX AT TOP: 78% to 85% width */}
              <div
                className="flex flex-col justify-start"
                style={{
                  width: isLandscape ? '82%' : '96%',
                  maxWidth: isLandscape ? '82%' : '96%',
                  marginTop: settings.postalBadge !== 'NONE' ? '4mm' : '0mm',
                }}
              >
                {/* Header: Strictly "TO:" (NO Hindi labels) */}
                <div className="font-bold text-xs tracking-wider text-black mb-1">
                  {toUpperClean(settings.receiverPrefix || 'TO:')}
                </div>

                {/* Receiver Name */}
                <div
                  className={`text-black leading-snug uppercase ${
                    settings.boldNames ? 'font-bold' : 'font-semibold'
                  }`}
                  style={{ fontSize: `${14 * scale}px` }}
                >
                  {toUpperClean(rec.name || 'RECEIVER NAME')}
                </div>

                {/* Company */}
                {rec.company && (
                  <div
                    className="font-bold text-black uppercase leading-snug mt-0.5"
                    style={{ fontSize: `${11 * scale}px` }}
                  >
                    {toUpperClean(rec.company)}
                  </div>
                )}

                {/* Address Lines */}
                <div
                  className="text-black leading-normal uppercase mt-1 space-y-0.5"
                  style={{ fontSize: `${11.5 * scale}px` }}
                >
                  {rec.addressLine1 && <div>{toUpperClean(rec.addressLine1)}</div>}
                  {rec.addressLine2 && <div>{toUpperClean(rec.addressLine2)}</div>}
                  {rec.landmark && (
                    <div className="italic text-[10px]">
                      LANDMARK: {toUpperClean(rec.landmark)}
                    </div>
                  )}
                </div>

                {/* City, State, PIN (Strictly INLINE - NO CORNER BADGE) */}
                <div
                  className="font-bold text-black uppercase tracking-wide mt-1"
                  style={{ fontSize: `${12.5 * scale}px` }}
                >
                  {toInlineCityPin || 'CITY, STATE - 000000'}
                </div>

                {/* Mobile */}
                {rec.mobile && (
                  <div
                    className="font-bold text-black mt-1"
                    style={{ fontSize: `${11 * scale}px` }}
                  >
                    MOBILE: {rec.mobile}
                  </div>
                )}
              </div>

              {/* 3. BOTTOM ROW: Barcode at bottom-left & FROM at bottom-right */}
              <div
                className="absolute flex items-end justify-between"
                style={{
                  left: `${mX}mm`,
                  right: `${mX}mm`,
                  bottom: `${mY}mm`,
                }}
              >
                {/* Barcode at bottom-left */}
                {barcodeDataUrl && (
                  <div className={`${isFromRight ? 'order-1' : 'order-2'} max-w-[55mm]`}>
                    <img src={barcodeDataUrl} alt="Barcode" className="h-[16mm] object-contain" />
                  </div>
                )}

                {/* FROM (Sender) at bottom-right */}
                <div
                  className={`${isFromRight ? 'order-2 ml-auto text-left' : 'order-1 mr-auto text-left'} max-w-[50%]`}
                >
                  {/* Header: Strictly "FROM:" (NO Hindi labels) */}
                  <div className="font-bold text-[9px] uppercase tracking-wider text-black mb-0.5">
                    {toUpperClean(settings.senderPrefix || 'FROM:')}
                  </div>

                  <div
                    className={`text-black uppercase leading-snug ${
                      settings.boldNames ? 'font-bold' : 'font-medium'
                    }`}
                    style={{ fontSize: `${10.5 * scale}px` }}
                  >
                    {toUpperClean(from.name || 'SENDER NAME')}
                  </div>

                  {from.company && (
                    <div
                      className="text-black uppercase text-[9.5px] leading-tight"
                      style={{ fontSize: `${9.5 * scale}px` }}
                    >
                      {toUpperClean(from.company)}
                    </div>
                  )}

                  <div
                    className="text-black uppercase leading-tight text-[9.5px] mt-0.5"
                    style={{ fontSize: `${9.5 * scale}px` }}
                  >
                    {from.addressLine1 && <div>{toUpperClean(from.addressLine1)}</div>}
                    {from.addressLine2 && <div>{toUpperClean(from.addressLine2)}</div>}
                  </div>

                  {/* Inline PIN */}
                  <div
                    className="font-bold text-black uppercase text-[9.5px] mt-0.5"
                    style={{ fontSize: `${9.5 * scale}px` }}
                  >
                    {fromInlineCityPin || 'CITY, STATE - 000000'}
                  </div>

                  {from.mobile && (
                    <div className="font-semibold text-[9px] mt-0.5">
                      MOB: {from.mobile}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
