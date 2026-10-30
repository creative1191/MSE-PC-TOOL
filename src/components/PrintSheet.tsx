import React from 'react';
import { DTDCBillData } from '../types';
import { DtdcBillLayout } from './DtdcBillLayout';

interface PrintSheetProps {
  data: DTDCBillData;
  customLogoUrl?: string | null;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  data,
  customLogoUrl,
  sheetRef,
}) => {
  const marginMode = data.printMargin || 'normal';
  const marginClass =
    marginMode === 'relaxed'
      ? 'margin-relaxed px-[10mm] py-[8mm]'
      : marginMode === 'compact'
      ? 'margin-compact px-[4mm] py-[4mm]'
      : 'margin-normal px-[6mm] py-[6mm]';

  if (data.layoutMode === 'SINGLE_LANDSCAPE') {
    return (
      <div
        ref={sheetRef}
        id="dtdc-print-area"
        className={`print-container-landscape ${marginClass} bg-white w-[297mm] min-w-[297mm] max-w-[297mm] print:min-h-0 mx-auto shadow-md print:shadow-none box-border flex flex-col justify-center`}
      >
        <DtdcBillLayout
          data={data}
          copyTitle="Sender / Parcel Copy"
          isLandscapeFull={true}
          customLogoUrl={customLogoUrl}
        />
      </div>
    );
  }

  // A4 PORTRAIT SHEET (210mm x 297mm)
  // When Paper Save Mode is ON:
  // - Top Copy (200mm x 85mm) prints at the top of A4 sheet with clear cut guide line
  // - Remaining 2/3 of A4 sheet is left blank so it can be cut off and reused in the printer!
  // When Paper Save Mode is OFF:
  // - All 3 Copies (Sender, Consignee, POD) print stacked with cut lines.
  return (
    <div
      ref={sheetRef}
      id="dtdc-print-area"
      className={`print-container ${marginClass} bg-white w-[210mm] min-w-[210mm] max-w-[210mm] min-h-[297mm] print:min-h-0 print:h-auto mx-auto shadow-md print:shadow-none flex flex-col ${
        data.paperSaveMode ? 'justify-start' : 'justify-between'
      } box-border`}
    >
      {/* COPY 1: Sender's Copy / Parcel Address Slip */}
      <DtdcBillLayout
        data={data}
        copyTitle={data.paperSaveMode ? "Sender's Copy / Parcel Slip" : "Sender's Copy"}
        isBlank={false}
        isPodCopy={false}
        customLogoUrl={customLogoUrl}
      />

      {/* Dotted cut line under Copy 1 */}
      <div className="border-t border-dashed border-gray-500 relative my-1 text-center select-none">
        <span className="bg-white px-2.5 text-[8.5px] text-gray-600 font-mono -top-2.5 relative font-semibold">
          ✂ --- CUT HERE {data.paperSaveMode ? '(Paper Save Mode: Cut Top 1/3 for Parcel, Remaining A4 Sheet Saved)' : '(Copy 1 / Copy 2)'} --- ✂
        </span>
      </div>

      {data.paperSaveMode ? (
        /* SCREEN HELPER: Visual representation of saved A4 paper area */
        <div className="w-full flex-1 min-h-[175mm] mt-2 border-2 border-dashed border-emerald-400 bg-emerald-50/30 rounded-xl flex flex-col items-center justify-center p-6 text-center print:hidden select-none">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-xl font-bold flex items-center justify-center mb-2 shadow-2xs">
            🌱
          </div>
          <span className="text-emerald-950 font-extrabold text-sm tracking-tight">
            A4 Paper Save Mode Active (1 Copy Printed at Top)
          </span>
          <p className="text-emerald-800 text-xs mt-1.5 max-w-md leading-relaxed">
            Sirf upar wala <strong>parcel address & courier bill slip</strong> print hoga. Dotted cut line se kaat kar parcel par chipkayein. Baaki ka <strong>67% A4 paper bilkul saaf bacha rahega</strong> jise aap dubara printer me daal sakte hain!
          </p>
          <div className="mt-3 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-[11px] text-emerald-900 font-mono font-semibold shadow-2xs">
            <span>Printed Slip: 200mm × 85mm</span>
            <span>•</span>
            <span>Paper Saved: 2/3 of A4 Sheet</span>
          </div>
        </div>
      ) : (
        <>
          {/* COPY 2: Consignee's Copy */}
          <DtdcBillLayout
            data={data}
            copyTitle="Consignee's Copy"
            isBlank={false}
            isPodCopy={false}
            customLogoUrl={customLogoUrl}
          />

          {/* Dotted cut line between Copy 2 and POD Copy */}
          <div className="border-t border-dashed border-gray-400 relative my-0.5 text-center select-none">
            <span className="bg-white px-2 text-[8px] text-gray-500 font-mono -top-2 relative">
              ✂ --- CUT HERE (Copy 2 / POD Copy) --- ✂
            </span>
          </div>

          {/* COPY 3: P.O.D. Copy */}
          <DtdcBillLayout
            data={data}
            copyTitle="P.O.D. Copy"
            isBlank={false}
            isPodCopy={true}
            customLogoUrl={customLogoUrl}
          />
        </>
      )}
    </div>
  );
};
