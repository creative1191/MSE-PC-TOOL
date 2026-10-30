import React from 'react';
import {
  CourierAddress,
  CourierPrintSettings,
  EnvelopePresetConfig,
  PostalBadgeType,
} from '../../types/courierPrint';
import { ENVELOPE_PRESETS, toUpperClean } from '../../utils/indianPostalData';
import { BarcodeRenderer } from '../BarcodeRenderer';
import { Phone } from 'lucide-react';
import { CourierA4SlipLayout } from './CourierA4SlipLayout';
import { A4ThreeSlipSheet } from './A4ThreeSlipSheet';

interface EnvelopePreviewProps {
  to: CourierAddress;
  from: CourierAddress;
  settings: CourierPrintSettings;
  zoomPercent: number;
}

export const EnvelopePreview: React.FC<EnvelopePreviewProps> = ({
  to,
  from,
  settings,
  zoomPercent,
}) => {
  const preset: EnvelopePresetConfig =
    ENVELOPE_PRESETS[settings.preset] || ENVELOPE_PRESETS.DL;

  let widthMm = settings.preset === 'CUSTOM' ? settings.customWidthMm : preset.widthMm;
  let heightMm = settings.preset === 'CUSTOM' ? settings.customHeightMm : preset.heightMm;

  if (settings.orientation === 'PORTRAIT' && widthMm > heightMm) {
    const tmp = widthMm;
    widthMm = heightMm;
    heightMm = tmp;
  } else if (settings.orientation === 'LANDSCAPE' && heightMm > widthMm) {
    const tmp = widthMm;
    widthMm = heightMm;
    heightMm = tmp;
  }

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

  const fontScale = settings.fontScale || 1.0;
  const isLandscape = widthMm >= heightMm;

  const fontClass =
    settings.typography === 'SERIF'
      ? 'font-serif'
      : settings.typography === 'MONO'
      ? 'font-mono'
      : 'font-sans';

  const cityStateParts = [to.city, to.state].filter(Boolean).map(toUpperClean);
  const toCityState = cityStateParts.join(', ');
  const toInlineCityPin = toCityState && to.pinCode
    ? `${toCityState} - ${to.pinCode}`
    : toCityState || to.pinCode || '';

  const fromCityStateParts = [from.city, from.state].filter(Boolean).map(toUpperClean);
  const fromCityState = fromCityStateParts.join(', ');
  const fromInlineCityPin = fromCityState && from.pinCode
    ? `${fromCityState} - ${from.pinCode}`
    : fromCityState || from.pinCode || '';

  const isFromRight = settings.fromPosition === 'BOTTOM_RIGHT';

  if (settings.preset === 'A4_3_SLIPS' || settings.preset === 'A4_COURIER_SLIP') {
    return (
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 select-none">
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            A4 3-Slip Dispatch Sheet (Normal Paper)
          </span>
          <span>•</span>
          <span>210 mm × 297 mm (A4 Portrait)</span>
          <span>•</span>
          <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
            {settings.paperSaveMode ? '🌱 Paper Save Mode (1 Copy at Top)' : '📋 3 Copies (Full Sheet)'}
          </span>
        </div>

        <div
          className="transition-transform duration-150 origin-top flex items-center justify-center"
          style={{ transform: `scale(${zoomPercent / 100})` }}
        >
          <div
            id="courierprint-active-envelope"
            className="shadow-2xl border border-slate-300 dark:border-slate-700 rounded-sm overflow-hidden"
          >
            <A4ThreeSlipSheet
              to={to}
              from={from}
              settings={settings}
              isPrintView={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {preset.name}
        </span>
        <span>•</span>
        <span>
          {widthMm} mm × {heightMm} mm ({((widthMm / 25.4).toFixed(2))}″ × {((heightMm / 25.4).toFixed(2))}″)
        </span>
        <span>•</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
          {settings.orientation}
        </span>
      </div>

      <div
        className="transition-transform duration-150 origin-top flex items-center justify-center"
        style={{
          transform: `scale(${zoomPercent / 100})`,
        }}
      >
        <div
          id="courierprint-active-envelope"
          className={`relative bg-white text-slate-900 shadow-xl border border-slate-300 dark:border-slate-700 box-border ${fontClass} ${
            settings.boxedContainers ? 'ring-1 ring-slate-800/20' : ''
          }`}
          style={{
            width: `${widthMm}mm`,
            height: `${heightMm}mm`,
            minWidth: `${widthMm}mm`,
            minHeight: `${heightMm}mm`,
            padding: `${mY}mm ${mX}mm`,
            boxSizing: 'border-box',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-200/60 pointer-events-none" />

          {/* Postal Badge */}
          {settings.postalBadge && settings.postalBadge !== 'NONE' && (
            <div className="absolute top-[8mm] right-[10mm] border-[1.5px] border-slate-900 bg-slate-50 px-3 py-1 font-bold text-[10px] tracking-wider text-slate-900 uppercase shadow-2xs select-none">
              {getPostalBadgeLabel(settings.postalBadge)}
            </div>
          )}

          {/* TO Box at Top: 78% to 85% width */}
          <div
            className={`flex flex-col justify-start ${
              settings.boxedContainers
                ? 'border border-slate-800 p-2.5 bg-slate-50/40 rounded-xs'
                : ''
            }`}
            style={{
              width: isLandscape ? '82%' : '96%',
              maxWidth: isLandscape ? '82%' : '96%',
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-wider text-slate-950 mb-1">
              <span className="text-[11px] font-black">{settings.receiverPrefix || 'TO:'}</span>
            </div>

            <div
              className={`text-slate-950 tracking-tight leading-snug uppercase ${
                settings.boldNames ? 'font-bold' : 'font-semibold'
              }`}
              style={{ fontSize: `${14 * fontScale}px` }}
            >
              {toUpperClean(to.name || 'RECEIVER NAME')}
            </div>

            {to.company && (
              <div
                className="font-bold text-slate-800 leading-snug uppercase mt-0.5"
                style={{ fontSize: `${11 * fontScale}px` }}
              >
                {toUpperClean(to.company)}
              </div>
            )}

            <div
              className="text-slate-800 leading-normal uppercase mt-1 space-y-0.5"
              style={{ fontSize: `${11.5 * fontScale}px` }}
            >
              {to.addressLine1 && <div>{toUpperClean(to.addressLine1)}</div>}
              {to.addressLine2 && <div>{toUpperClean(to.addressLine2)}</div>}
              {to.landmark && (
                <div className="italic text-slate-700 text-[10px] font-medium">
                  LANDMARK: {toUpperClean(to.landmark)}
                </div>
              )}
            </div>

            {/* Inline PIN */}
            <div
              className="font-bold text-slate-950 tracking-wide uppercase mt-1.5 flex items-center flex-wrap gap-1"
              style={{ fontSize: `${12.5 * fontScale}px` }}
            >
              <span>{toInlineCityPin || 'CITY, STATE - 000000'}</span>
            </div>

            {to.mobile && (
              <div
                className="font-bold text-slate-900 mt-1 flex items-center gap-1"
                style={{ fontSize: `${11 * fontScale}px` }}
              >
                {settings.includePhoneIcon && <Phone className="w-3 h-3 text-slate-700 inline shrink-0" />}
                <span>MOBILE: {to.mobile}</span>
              </div>
            )}
          </div>

          {/* Bottom Row */}
          <div className="absolute bottom-[8mm] left-[10mm] right-[10mm] flex items-end justify-between gap-4">
            {settings.showBarcode && settings.barcodeValue && (
              <div className={`${isFromRight ? 'order-1' : 'order-2'} shrink-0 max-w-[210px]`}>
                <BarcodeRenderer
                  value={settings.barcodeValue}
                  width={1.4}
                  height={32}
                  showText={true}
                  className="bg-transparent"
                />
              </div>
            )}

            <div
              className={`${
                isFromRight ? 'order-2 ml-auto text-left' : 'order-1 mr-auto text-left'
              } ${
                settings.boxedContainers
                  ? 'border border-slate-700 p-2 bg-slate-50/50 rounded-xs'
                  : ''
              } max-w-[50%]`}
            >
              <div className="font-bold text-[10px] tracking-wider text-slate-800 uppercase mb-0.5">
                {settings.senderPrefix || 'FROM:'}
              </div>

              <div
                className={`text-slate-950 uppercase leading-snug ${
                  settings.boldNames ? 'font-bold' : 'font-medium'
                }`}
                style={{ fontSize: `${10.5 * fontScale}px` }}
              >
                {toUpperClean(from.name || 'SENDER NAME')}
              </div>

              {from.company && (
                <div
                  className="text-slate-700 uppercase text-[9.5px] leading-tight"
                  style={{ fontSize: `${9.5 * fontScale}px` }}
                >
                  {toUpperClean(from.company)}
                </div>
              )}

              <div
                className="text-slate-700 uppercase leading-tight text-[9.5px] mt-0.5"
                style={{ fontSize: `${9.5 * fontScale}px` }}
              >
                {from.addressLine1 && <div>{toUpperClean(from.addressLine1)}</div>}
                {from.addressLine2 && <div>{toUpperClean(from.addressLine2)}</div>}
              </div>

              <div
                className="font-bold text-slate-900 uppercase text-[9.5px] mt-0.5"
                style={{ fontSize: `${9.5 * fontScale}px` }}
              >
                {fromInlineCityPin || 'CITY, STATE - 000000'}
              </div>

              {from.mobile && (
                <div
                  className="text-slate-800 font-semibold text-[9px] mt-0.5"
                  style={{ fontSize: `${9 * fontScale}px` }}
                >
                  MOB: {from.mobile}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getPostalBadgeLabel(badge: PostalBadgeType): string {
  switch (badge) {
    case 'SPEED_POST':
      return 'SPEED POST';
    case 'REGISTERED_POST':
      return 'REGISTERED POST';
    case 'BOOK_POST':
      return 'BOOK POST';
    case 'FRAGILE':
      return '⚠️ FRAGILE / HANDLE WITH CARE';
    case 'CASH_ON_DELIVERY':
      return 'CASH ON DELIVERY (C.O.D.)';
    case 'AIRMAIL':
      return '✈️ BY AIR MAIL / PAR AVION';
    case 'EXPRESS_PARCEL':
      return 'EXPRESS PARCEL';
    case 'DOCUMENT':
      return 'DOCUMENTS ONLY';
    default:
      return '';
  }
}
