import React from 'react';
import { DTDCBillData } from '../types';
import { CourierLogo } from './CourierLogo';
import { BarcodeRenderer } from './BarcodeRenderer';
import { COURIER_CONFIGS } from '../data/courierConfigs';

interface DtdcBillLayoutProps {
  data: DTDCBillData;
  copyTitle?: string;
  isPodCopy?: boolean;
  isBlank?: boolean;
  isLandscapeFull?: boolean;
  customLogoUrl?: string | null;
}

export const formatAmount = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

export const DtdcBillLayout: React.FC<DtdcBillLayoutProps> = ({
  data,
  copyTitle = "Sender's Copy",
  isPodCopy = false,
  isBlank = false,
  isLandscapeFull = false,
  customLogoUrl,
}) => {
  // If in Paper Save Mode, render blank space on print, but on screen show gentle helper indicator
  if (isBlank) {
    return (
      <div className="w-full min-h-[80mm] max-h-[86mm] border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded flex flex-col items-center justify-center p-4 text-center print:border-none print:bg-transparent print:h-[85mm]">
        <span className="text-emerald-800 font-bold text-xs flex items-center gap-1.5 print:hidden">
          🌱 Paper Save Mode Active ({copyTitle})
        </span>
        <span className="text-emerald-600 text-[11px] mt-1 print:hidden">
          This area is left blank on the printed page to save paper. Only the top Sender's Copy will print.
        </span>
      </div>
    );
  }

  const courierType = data.courier || 'DTDC';
  const courierConfig = COURIER_CONFIGS[courierType] || COURIER_CONFIGS.DTDC;
  const heightClass = isLandscapeFull ? 'min-h-[175mm]' : 'min-h-[80mm] max-h-[86mm]';

  return (
    <div
      className={`invoice-card w-full ${heightClass} border-[1.5px] border-black border-solid bg-white text-black flex flex-col justify-between box-border select-text`}
      style={{ fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif' }}
    >
      {/* ================= 1. HEADER ROW ================= */}
      <div className="grid grid-cols-12 border-b-[1.5px] border-black items-stretch">
        {/* Top Left: Logo & Registered Office Address (~42% width) */}
        <div className="col-span-5 flex items-center gap-2 p-1 sm:p-1.5 border-r-[1.5px] border-black">
          <div className="shrink-0 flex items-center justify-center max-w-[130px] sm:max-w-[145px]">
            <CourierLogo
              courier={courierType}
              customLogoUrl={customLogoUrl}
              className={isLandscapeFull ? 'h-9 w-auto max-w-[165px]' : 'h-6 sm:h-7 w-auto max-w-[135px]'}
            />
          </div>
          <div className="leading-tight text-black min-w-0 flex-1">
            <div className="font-bold text-[8.5px] tracking-tight truncate">{courierConfig.fullName}</div>
            <div className="text-[7px] text-gray-800 leading-tight truncate">{courierConfig.regdOfficeLine1}</div>
            <div className="text-[7px] text-gray-800 leading-tight truncate">{courierConfig.regdOfficeLine2}</div>
          </div>
        </div>

        {/* Top Right: Origin / Dest / Product / Type / Date (~58% width) */}
        <div className="col-span-7 grid grid-cols-2">
          {/* Origin & Product column */}
          <div className="flex flex-col justify-between border-r-[1.5px] border-black">
            <div className="border-b-[1.5px] border-black text-center py-0.5 text-[8.5px]">
              Origin: <span className="font-bold uppercase">{data.origin || ''}</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-0.5 font-bold text-[9.5px] tracking-wide text-center uppercase">
              PRODUCT: {data.product || courierConfig.defaultProducts[0]}
            </div>
          </div>

          {/* Dest, Type & Date column */}
          <div className="flex flex-col justify-between text-center">
            <div className="border-b-[1.5px] border-black py-0.5 text-[8.5px]">
              Dest: <span className="font-bold uppercase">{data.dest || ''}</span>
            </div>
            <div className="border-b-[1.5px] border-black py-0.5 text-[8.5px]">
              Type: <span className="font-bold uppercase">{data.type || ''}</span>
            </div>
            <div className="py-0.5 text-[8px] text-gray-800">
              Date: <span className="font-normal">{data.date || ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. CONSIGNOR & CONSIGNEE DETAILS ================= */}
      <div className="grid grid-cols-2 border-b-[1.5px] border-black items-stretch">
        {/* Consignor (Left) */}
        <div className="p-1 sm:p-1.5 border-r-[1.5px] border-black text-[8px] leading-[1.2] text-black">
          <div>
            Consignor's Name: <span className="font-bold">{data.consignorName || ''}</span>
          </div>
          <div className="mt-0.5 break-words">
            Consignor's Address: <span className="font-bold">{data.consignorAddress || ''}</span>
          </div>
          <div className="mt-0.5">
            GSTIN No.: <span>{data.consignorGstin || ''}</span>
          </div>
          <div className="mt-0.5 flex gap-3">
            <span>Phone: <span className="font-bold font-mono">{data.consignorPhone || ''}</span></span>
            {data.consignorEmail && <span>Email: <span>{data.consignorEmail}</span></span>}
          </div>
        </div>

        {/* Consignee (Right) */}
        <div className="p-1 sm:p-1.5 flex flex-col justify-between text-[8px] leading-[1.2] text-black">
          <div>
            {data.customerRefNo && (
              <div>
                Customer Ref No: <span>{data.customerRefNo}</span>
              </div>
            )}
            <div className={data.customerRefNo ? 'mt-0.5' : ''}>
              Consignee's Name: <span className="font-bold">{data.consigneeName || ''}</span>
            </div>
            <div className="mt-0.5 break-words">
              Consignee's Address: <span className="font-bold">{data.consigneeAddress || ''}</span>
            </div>
            <div className="mt-0.5">
              GSTIN No.: <span>{data.consigneeGstin || ''}</span>
            </div>
            <div className="mt-0.5 flex gap-3">
              <span>Phone: <span className="font-bold font-mono">{data.consigneePhone || ''}</span></span>
              {data.consigneeEmail && <span>Email: <span>{data.consigneeEmail}</span></span>}
            </div>
          </div>

          {/* Courier Charges Box */}
          <div className="mt-0.5">
            <div className="border-[1.5px] border-black px-2 py-0.5 inline-block font-bold text-[10px]">
              Courier Charges: ₹ {formatAmount(data.courierCharges)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. TECHNICAL SPECS, BARCODE & SIGNATURES ================= */}
      <div className="grid grid-cols-12 border-b-[1.5px] border-black items-stretch flex-1">
        {/* Column 1: Content Spec, Paperwork & Declaration (~33% width) */}
        <div className="col-span-4 border-r-[1.5px] border-black flex flex-col justify-between">
          <div className="p-1 border-b-[1.5px] border-black text-[8.5px]">
            Content Specification : <span className="font-bold">{data.contentSpec || ''}</span>
          </div>
          <div className="p-1 border-b-[1.5px] border-black text-[8px]">
            Paperwork Enclosed : <span>{data.paperworkEnclosed || ''}</span>
          </div>

          <div className="p-1 text-[7px] leading-tight flex-1 flex flex-col justify-between">
            <div>
              I/We declare that this consignment does not contain personal mail, cash, jewellery, contraband, illegal drugs, any prohibited items and commodities which can cause safety hazards while transporting
            </div>

            <div className="text-center my-1">
              <div className="font-bold text-[8.5px]">
                {isPodCopy ? "Receiver's Signature & Stamp" : "Sender's Signature & Seal"}
              </div>
              <div className="text-[6.5px] text-gray-700 mt-0.5">
                {courierConfig.termsStatement}
              </div>
            </div>
          </div>

          <div className="border-t-[1.5px] border-black px-1 py-0.5 text-[6.5px] text-center text-gray-800">
            https://{courierConfig.website} | {courierConfig.supportEmail} | {courierConfig.supportPhone}
          </div>
        </div>

        {/* Column 2: Weights, Pieces, Dimensions & Depot Address (~27% width) */}
        <div className="col-span-3 border-r-[1.5px] border-black flex flex-col text-[8px]">
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            Declared Value: <span className="font-bold">{data.declaredValue || ''}</span>
          </div>
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            No Of Pieces: <span className="font-bold">{data.pieces || ''}</span>
          </div>
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            Actual Weight: <span className="font-bold">{data.actualWeight || ''}</span>
          </div>
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            Ewaybill Number: <span className="font-mono">{data.ewaybillNumber || ''}</span>
          </div>
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            Dim: <span className="font-bold">{data.dim || ''}</span>
          </div>
          <div className="p-0.5 px-1 border-b-[1.5px] border-black">
            Charged weight: <span className="font-bold">{data.chargedWeight || ''}</span>
          </div>

          {/* Booking Center / Branch details */}
          <div className="p-1 text-[7px] leading-tight flex-1">
            <div>
              Name : <span className="font-bold uppercase">{data.bookingBranchName || ''}</span>
            </div>
            <div className="mt-0.5">
              Address: <span className="font-bold uppercase">{data.bookingBranchAddress || ''}</span>
            </div>
            <div className="mt-0.5">
              Phone : <span className="font-bold font-mono">{data.bookingBranchPhone || ''}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Mode, Barcode, Risk Surcharge & Remark (~40% width) */}
        <div className="col-span-5 flex flex-col justify-between">
          {/* Barcode Block */}
          <div className="p-1 flex flex-col items-center justify-center text-center">
            <div className="text-[10px]">
              Mode: <span className="font-bold">{data.mode || 'SURFACE'}</span>
            </div>
            <div className="my-0.5 w-full flex justify-center">
              <BarcodeRenderer
                value={data.awb || '7D134850071'}
                width={isLandscapeFull ? 2 : 1.3}
                height={isLandscapeFull ? 38 : 25}
                className="w-full max-w-[200px]"
              />
            </div>
            <div className="text-[9.5px]">
              {courierConfig.awbLabel}: <span className="font-bold font-mono">{data.awb || '7D134850071'}</span>
            </div>
          </div>

          {/* Risk Surcharge Grid */}
          <div className="border-t-[1.5px] border-black">
            <div className="grid grid-cols-12 items-stretch">
              <div className="col-span-7 border-r-[1.5px] border-black flex items-center justify-center p-1">
                <span className="font-bold text-[11px]">Risk Surcharge</span>
              </div>
              <div className="col-span-5 flex flex-col justify-between">
                <div className="border-b-[1.5px] border-black flex items-center justify-between px-2 py-0.5 text-[8.5px]">
                  <span>Owner</span>
                  <div className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-[9px] leading-none">
                    {data.riskSurchargeOwner ? '✓' : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-0.5 text-[8.5px]">
                  <span>Carrier</span>
                  <div className="w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-[9px] leading-none">
                    {data.riskSurchargeCarrier ? '✓' : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-[1.5px] border-black px-1.5 py-0.5 text-[8px]">
              Remark : <span>{data.remark || ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. FOOTER BAR ================= */}
      <div className="px-1.5 py-0.5 flex items-center justify-between text-[7px] font-bold tracking-tight">
        <span className="truncate pr-2">{courierConfig.footerNotice}</span>
        <span className="shrink-0 uppercase font-mono text-black">{copyTitle}</span>
      </div>
    </div>
  );
};
