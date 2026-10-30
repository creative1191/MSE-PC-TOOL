import React from 'react';
import { CourierAddress, CourierPrintSettings } from '../../types/courierPrint';
import { toUpperClean } from '../../utils/indianPostalData';
import { Phone, Scissors, Leaf } from 'lucide-react';

interface A4ThreeSlipSheetProps {
  to: CourierAddress;
  from: CourierAddress;
  settings: CourierPrintSettings;
  isPrintView?: boolean;
}

export const A4ThreeSlipSheet: React.FC<A4ThreeSlipSheetProps> = ({
  to,
  from,
  settings,
  isPrintView = false,
}) => {
  const fontScale = settings.fontScale || 1.0;
  const paperSave = Boolean(settings.paperSaveMode);
  const marginPreset = settings.printMargin || 'normal';

  // Margins in mm: normal (9mm), relaxed (13mm), compact (5mm)
  const paddingYMm = marginPreset === 'relaxed' ? 13 : marginPreset === 'compact' ? 5 : 9;
  const paddingXMm = marginPreset === 'relaxed' ? 12 : marginPreset === 'compact' ? 7 : 10;

  const toCityState = [to.city, to.state].filter(Boolean).map(toUpperClean).join(', ');
  const toCityPin = toCityState && to.pinCode ? `${toCityState} - ${to.pinCode}` : toCityState || to.pinCode || '';

  const fromCityState = [from.city, from.state].filter(Boolean).map(toUpperClean).join(', ');
  const fromCityPin = fromCityState && from.pinCode ? `${fromCityState} - ${from.pinCode}` : fromCityState || from.pinCode || '';

  const copies = [
    { num: 1, label: 'Copy 1' },
    { num: 2, label: 'Copy 2' },
    { num: 3, label: 'Copy 3' },
  ];

  return (
    <div
      className="bg-white text-slate-950 box-border flex flex-col justify-between"
      style={{
        width: '210mm',
        height: '297mm',
        minWidth: '210mm',
        minHeight: '297mm',
        padding: `${paddingYMm}mm ${paddingXMm}mm`,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      {copies.map((copy, index) => {
        const isHiddenInPaperSave = paperSave && copy.num > 1;

        if (isHiddenInPaperSave) {
          if (isPrintView) {
            // In physical print, render blank transparent spacer to preserve position without wasting ink
            return (
              <div
                key={copy.num}
                className="w-full"
                style={{ height: '88mm', visibility: 'hidden' }}
              />
            );
          }

          // In preview screen, show clean dashed paper-save indicator
          return (
            <div key={copy.num} className="w-full flex flex-col" style={{ height: '88mm' }}>
              {index > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono py-1 select-none">
                  <Scissors className="w-3 h-3 text-slate-400" />
                  <div className="flex-1 border-b border-dashed border-slate-300" />
                  <span>✂ CUT HERE (200mm × 92mm)</span>
                  <div className="flex-1 border-b border-dashed border-slate-300" />
                </div>
              )}
              <div className="flex-1 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-950">
                  Paper Save Mode Active ({copy.label} Blank)
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Ye hissa printer me plain white rahega taaki aapka A4 paper kharab na ho.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={copy.num} className="w-full flex flex-col justify-between" style={{ height: '90mm' }}>
            {/* Cut line between copies */}
            {index > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono py-0.5 select-none print:text-black">
                <Scissors className="w-3 h-3 text-slate-400 print:text-black shrink-0" />
                <div className="flex-1 border-b border-dashed border-slate-400 print:border-black" />
                <span className="text-[9px] uppercase tracking-wider text-slate-400 print:text-black">
                  CUT HERE FOR PARCEL DISPATCH
                </span>
                <div className="flex-1 border-b border-dashed border-slate-400 print:border-black" />
              </div>
            )}

            {/* Slip Content: EXACT Reference Image Design (TO at top-left, FROM at bottom-right) */}
            <div
              className={`flex-1 relative bg-white flex flex-col justify-between p-2 ${
                settings.boxedContainers ? 'border border-slate-400 print:border-black rounded-xs' : ''
              }`}
            >
              {/* TOP LEFT: TO (RECIPIENT) */}
              <div className="max-w-[75%] space-y-0.5">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-950">
                  {settings.receiverPrefix || 'TO:'}
                </div>

                <div
                  className="font-bold text-slate-950 uppercase tracking-tight leading-snug"
                  style={{ fontSize: `${13.5 * fontScale}px` }}
                >
                  {to.name ? toUpperClean(to.name) : 'RECIPIENT NAME'}
                </div>

                {to.company && (
                  <div
                    className="font-bold text-slate-900 uppercase leading-snug"
                    style={{ fontSize: `${11 * fontScale}px` }}
                  >
                    {toUpperClean(to.company)}
                  </div>
                )}

                <div
                  className="text-slate-800 uppercase leading-tight text-[11px] space-y-0.5 pt-0.5"
                  style={{ fontSize: `${10.5 * fontScale}px` }}
                >
                  {to.addressLine1 && <div>{toUpperClean(to.addressLine1)}</div>}
                  {to.addressLine2 && <div>{toUpperClean(to.addressLine2)}</div>}
                  {to.landmark && (
                    <div className="italic text-slate-700 font-medium">
                      LANDMARK: {toUpperClean(to.landmark)}
                    </div>
                  )}
                </div>

                {toCityPin ? (
                  <div
                    className="font-bold text-slate-950 uppercase tracking-wide pt-1"
                    style={{ fontSize: `${12 * fontScale}px` }}
                  >
                    {toCityPin}
                  </div>
                ) : null}

                {to.mobile ? (
                  <div
                    className="font-bold text-slate-950 flex items-center gap-1 pt-0.5"
                    style={{ fontSize: `${11 * fontScale}px` }}
                  >
                    <Phone className="w-3 h-3 text-slate-700 print:text-black inline shrink-0" />
                    <span>MOBILE: {to.mobile}</span>
                  </div>
                ) : null}
              </div>

              {/* BOTTOM RIGHT: FROM (SENDER) */}
              <div className="self-end text-left max-w-[50%] mt-auto space-y-0.5 pl-4">
                <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-950">
                  {settings.senderPrefix || 'FROM:'}
                </div>

                <div
                  className="font-bold text-slate-950 uppercase leading-snug"
                  style={{ fontSize: `${11.5 * fontScale}px` }}
                >
                  {toUpperClean(from.name || 'MAA SHARDA ENTERPRISES')}
                </div>

                {from.company ? (
                  <div
                    className="font-medium text-slate-700 uppercase leading-tight"
                    style={{ fontSize: `${9.5 * fontScale}px` }}
                  >
                    {toUpperClean(from.company)}
                  </div>
                ) : null}

                <div
                  className="text-slate-700 uppercase leading-tight text-[9.5px] space-y-0.5"
                  style={{ fontSize: `${9.5 * fontScale}px` }}
                >
                  {from.addressLine1 && <div>{toUpperClean(from.addressLine1)}</div>}
                  {from.addressLine2 && <div>{toUpperClean(from.addressLine2)}</div>}
                </div>

                {fromCityPin ? (
                  <div
                    className="font-bold text-slate-950 uppercase text-[10px] pt-0.5"
                    style={{ fontSize: `${10 * fontScale}px` }}
                  >
                    {fromCityPin}
                  </div>
                ) : null}

                {from.mobile ? (
                  <div
                    className="text-slate-800 font-semibold text-[9.5px]"
                    style={{ fontSize: `${9.5 * fontScale}px` }}
                  >
                    MOB: {from.mobile}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
