import React from 'react';
import { CourierAddress } from '../../types/courierPrint';
import { toUpperClean } from '../../utils/indianPostalData';
import { BarcodeRenderer } from '../BarcodeRenderer';

interface CourierA4SlipLayoutProps {
  to: CourierAddress;
  from: CourierAddress;
  barcodeValue?: string;
  mode?: string;
  product?: string;
  date?: string;
  charges?: string | number;
  copyTitle?: string;
  showCutLine?: boolean;
}

export const CourierA4SlipLayout: React.FC<CourierA4SlipLayoutProps> = ({
  to,
  from,
  barcodeValue = '7D950374350',
  mode = 'SURFACE',
  product = 'B2C SMART EXPRESS',
  date,
  charges = '220.00',
  copyTitle = "SENDER'S COPY / PARCEL SLIP",
  showCutLine = true,
}) => {
  const formattedDate =
    date ||
    new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const fromAddressText = [
    from.company,
    from.addressLine1,
    from.addressLine2,
    from.landmark,
    `${from.city || 'SATNA'}, ${from.state || 'MADHYA PRADESH'} ${from.pinCode || '485446'}`.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  const toAddressText = [
    to.company,
    to.addressLine1,
    to.addressLine2,
    to.landmark ? `Near ${to.landmark}` : '',
    `${to.city || 'DESTINATION'}, ${to.state || ''} ${to.pinCode || ''}`.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full max-w-[200mm] mx-auto select-text text-black font-sans box-border">
      {/* ================= MAIN COURIER BORDERED BOX (Exact reference image styling) ================= */}
      <div className="border-[1.5px] border-black bg-white flex flex-col justify-between text-black box-border">
        {/* ROW 1: HEADER (LOGO + ORIGIN / DEST / PRODUCT / DATE) */}
        <div className="grid grid-cols-12 border-b-[1.5px] border-black items-stretch">
          {/* Logo & Registered Office Address (Col 5) */}
          <div className="col-span-5 flex items-center gap-2 p-1.5 border-r-[1.5px] border-black">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-amber-400 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src="/assets/aistudio/logo_87b71685.jpg"
                alt="Maa Sharda Enterprises"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-extrabold text-[9px] tracking-tight uppercase truncate">
                MAA SHARDA ENTERPRISES
              </div>
              <div className="text-[7px] text-gray-800 leading-tight truncate">
                Authorized Courier & Logistics Dispatch Hub
              </div>
              <div className="text-[6.5px] text-gray-600 leading-tight truncate">
                Main Market Road & Station Road, Satna 485446 (M.P.)
              </div>
            </div>
          </div>

          {/* Origin / Dest / Product / Date (Col 7) */}
          <div className="col-span-7 grid grid-cols-2">
            {/* Origin & Product */}
            <div className="flex flex-col justify-between border-r-[1.5px] border-black">
              <div className="border-b-[1.5px] border-black text-center py-0.5 text-[8.5px]">
                Origin: <span className="font-bold uppercase">{toUpperClean(from.city || 'SATNA')}</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-0.5 font-bold text-[9px] tracking-wide text-center uppercase">
                PRODUCT: {product}
              </div>
            </div>

            {/* Dest, Type & Date */}
            <div className="flex flex-col justify-between text-center">
              <div className="border-b-[1.5px] border-black py-0.5 text-[8.5px]">
                Dest: <span className="font-bold uppercase text-blue-900">{toUpperClean(to.city || 'DESTINATION')}</span>
              </div>
              <div className="border-b-[1.5px] border-black py-0.5 text-[8.5px]">
                Type: <span className="font-bold uppercase">PARCEL / NON-DOC</span>
              </div>
              <div className="py-0.5 text-[7.5px] text-gray-800">
                Date: <span className="font-normal">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: CONSIGNOR & CONSIGNEE DETAILS */}
        <div className="grid grid-cols-2 border-b-[1.5px] border-black items-stretch">
          {/* Consignor (Left) */}
          <div className="p-1.5 border-r-[1.5px] border-black text-[8px] leading-[1.25]">
            <div className="text-gray-900">
              Consignor's Name: <span className="font-bold text-black uppercase">{toUpperClean(from.name || 'SENDER NAME')}</span>
            </div>
            <div className="mt-0.5 break-words">
              Consignor's Address: <span className="font-semibold text-black uppercase">{toUpperClean(fromAddressText)}</span>
            </div>
            <div className="mt-0.5">
              GSTIN No.: <span className="font-mono">---</span>
            </div>
            <div className="mt-0.5 flex gap-2">
              <span>Phone: <span className="font-bold font-mono">{from.mobile || '---'}</span></span>
            </div>
          </div>

          {/* Consignee (Right) */}
          <div className="p-1.5 flex flex-col justify-between text-[8px] leading-[1.25]">
            <div>
              <div className="text-gray-900">
                Consignee's Name: <span className="font-extrabold text-[9px] text-black uppercase">{toUpperClean(to.name || 'RECIPIENT NAME')}</span>
              </div>
              <div className="mt-0.5 break-words">
                Consignee's Address: <span className="font-bold text-black uppercase">{toUpperClean(toAddressText)}</span>
              </div>
              <div className="mt-0.5">
                GSTIN No.: <span className="font-mono">---</span>
              </div>
              <div className="mt-0.5 flex gap-2">
                <span>Phone: <span className="font-bold font-mono text-black">{to.mobile || '---'}</span></span>
              </div>
            </div>

            {/* Courier Charges / Parcel Dispatch Box */}
            <div className="mt-1">
              <div className="border-[1.5px] border-black px-2 py-0.5 inline-block font-bold text-[9.5px]">
                Courier Charges: ₹ {typeof charges === 'number' ? charges.toFixed(2) : charges}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: SPECS, BOOKING BRANCH, BARCODE & SIGNATURES */}
        <div className="grid grid-cols-12 border-b-[1.5px] border-black items-stretch">
          {/* Column 1: Content Spec & Declaration (Col 4) */}
          <div className="col-span-4 border-r-[1.5px] border-black flex flex-col justify-between p-1 text-[7.5px] leading-tight">
            <div>
              <div className="font-bold pb-0.5 border-b border-gray-300">
                Content Specification : <span className="font-normal">PARCEL MERCHANDISE / DOCS</span>
              </div>
              <div className="mt-1 text-[6.5px] text-gray-700 leading-tight">
                I/We declare that this consignment does not contain personal mail, cash, jewellery, contraband, illegal drugs, or hazardous goods.
              </div>
            </div>

            <div className="text-center my-1">
              <div className="font-bold text-[8px] uppercase">
                Sender's Signature & Seal
              </div>
              <div className="text-[6px] text-gray-500 mt-0.5">
                I have read and accepted carriage terms & conditions.
              </div>
            </div>

            <div className="text-[6.5px] text-gray-700 text-center border-t border-gray-200 pt-0.5">
              Customer Support: 8982091190 | 9827012345
            </div>
          </div>

          {/* Column 2: Specs & Booking Branch (Col 3) */}
          <div className="col-span-3 border-r-[1.5px] border-black flex flex-col text-[7.5px]">
            <div className="p-0.5 px-1 border-b border-black">
              Declared Value: <span className="font-bold">1500</span>
            </div>
            <div className="p-0.5 px-1 border-b border-black">
              No Of Pieces: <span className="font-bold">1</span>
            </div>
            <div className="p-0.5 px-1 border-b border-black">
              Actual Weight: <span className="font-bold">0.50 Kgs</span>
            </div>
            <div className="p-0.5 px-1 border-b border-black">
              Charged weight: <span className="font-bold">0.50 Kgs</span>
            </div>

            {/* Booking Center Details */}
            <div className="p-1 text-[7px] leading-tight flex-1">
              <div>
                Name : <span className="font-bold uppercase">MAA SHARDA ENTERPRISES</span>
              </div>
              <div className="mt-0.5">
                Address: <span className="font-bold uppercase">NEAR REST HOUSE, NAGOD / MAIN MARKET, SATNA 485446</span>
              </div>
              <div className="mt-0.5">
                Phone : <span className="font-bold font-mono">8982091190 / 9827012345</span>
              </div>
            </div>
          </div>

          {/* Column 3: Mode, Barcode & Risk Surcharge (Col 5) */}
          <div className="col-span-5 flex flex-col justify-between">
            {/* Barcode Block */}
            <div className="p-1 flex flex-col items-center justify-center text-center">
              <div className="text-[9px]">
                Mode: <span className="font-bold uppercase">{mode}</span>
              </div>
              <div className="my-0.5 w-full flex justify-center">
                <BarcodeRenderer
                  value={barcodeValue}
                  width={1.4}
                  height={26}
                  className="w-full max-w-[190px]"
                />
              </div>
              <div className="text-[9px]">
                AWB No: <span className="font-bold font-mono">{barcodeValue}</span>
              </div>
            </div>

            {/* Risk Surcharge */}
            <div className="border-t-[1.5px] border-black">
              <div className="grid grid-cols-12 items-stretch">
                <div className="col-span-7 border-r-[1.5px] border-black flex items-center justify-center p-0.5">
                  <span className="font-bold text-[9.5px]">Risk Surcharge</span>
                </div>
                <div className="col-span-5 flex flex-col justify-between">
                  <div className="border-b-[1.5px] border-black flex items-center justify-between px-1.5 py-0.5 text-[8px]">
                    <span>Owner</span>
                    <div className="w-3 h-3 border border-black flex items-center justify-center font-bold text-[8px] leading-none">
                      ✓
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1.5 py-0.5 text-[8px]">
                    <span>Carrier</span>
                    <div className="w-3 h-3 border border-black flex items-center justify-center font-bold text-[8px] leading-none">
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-[1.5px] border-black px-1 py-0.5 text-[7px]">
                Remark : <span>PARCEL DISPATCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: FOOTER NOTICE */}
        <div className="px-1.5 py-0.5 flex items-center justify-between text-[7px] font-bold tracking-tight">
          <span className="truncate pr-2 uppercase">
            THIS DOCUMENT IS NOT A TAX INVOICE. WEIGHT CAPTURED BY MSE WILL BE USED FOR INVOICE GENERATION.
          </span>
          <span className="shrink-0 uppercase font-mono text-black">{copyTitle}</span>
        </div>
      </div>

      {/* ================= DOTTED CUT LINE (Paper Save Mode separator) ================= */}
      {showCutLine && (
        <div className="border-t border-dashed border-gray-600 relative my-1.5 text-center select-none">
          <span className="bg-white px-2.5 text-[8.5px] text-gray-700 font-mono -top-2.5 relative font-bold">
            ✂ --- CUT HERE (Paper Save Mode: Cut Top 1/3 for Parcel, Remaining 2/3 of A4 Paper Saved) --- ✂
          </span>
        </div>
      )}
    </div>
  );
};
