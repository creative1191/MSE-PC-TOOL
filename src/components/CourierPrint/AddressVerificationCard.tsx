import React, { useState } from 'react';
import { CourierAddress, DualOcrResult } from '../../types/courierPrint';
import { toUpperClean } from '../../utils/indianPostalData';
import { ArrowLeftRight, Check, X, Sparkles } from 'lucide-react';

interface AddressVerificationCardProps {
  ocrResult: DualOcrResult;
  onApplyBoth: (sender: CourierAddress, receiver: CourierAddress) => void;
  onClose: () => void;
}

export const AddressVerificationCard: React.FC<AddressVerificationCardProps> = ({
  ocrResult,
  onApplyBoth,
  onClose,
}) => {
  const [sender, setSender] = useState<CourierAddress>({
    id: 'sender-ocr',
    name: toUpperClean(ocrResult.sender?.name || ''),
    company: toUpperClean(ocrResult.sender?.company || ''),
    addressLine1: toUpperClean(ocrResult.sender?.addressLine1 || ''),
    addressLine2: toUpperClean(ocrResult.sender?.addressLine2 || ''),
    landmark: toUpperClean(ocrResult.sender?.landmark || ''),
    city: toUpperClean(ocrResult.sender?.city || ''),
    state: toUpperClean(ocrResult.sender?.state || ''),
    pinCode: ocrResult.sender?.pinCode || '',
    mobile: ocrResult.sender?.mobile || '',
    isBoldName: true,
  });

  const [receiver, setReceiver] = useState<CourierAddress>({
    id: 'receiver-ocr',
    name: toUpperClean(ocrResult.receiver?.name || ''),
    company: toUpperClean(ocrResult.receiver?.company || ''),
    addressLine1: toUpperClean(ocrResult.receiver?.addressLine1 || ''),
    addressLine2: toUpperClean(ocrResult.receiver?.addressLine2 || ''),
    landmark: toUpperClean(ocrResult.receiver?.landmark || ''),
    city: toUpperClean(ocrResult.receiver?.city || ''),
    state: toUpperClean(ocrResult.receiver?.state || ''),
    pinCode: ocrResult.receiver?.pinCode || '',
    mobile: ocrResult.receiver?.mobile || '',
    isBoldName: true,
  });

  const handleSwap = () => {
    const temp = { ...sender };
    setSender({ ...receiver, id: 'sender-ocr' });
    setReceiver({ ...temp, id: 'receiver-ocr' });
  };

  const handleApply = () => {
    onApplyBoth(sender, receiver);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Dual-Address OCR Verification ({ocrResult.confidence}% Match)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ocrResult.isSplitDual
                  ? 'Horizontal slip split down the middle (Left: Sender, Right: Receiver)'
                  : 'Structured multi-address extracted from single scan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Swap Action Bar */}
        <div className="py-2.5 flex items-center justify-between px-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg my-3 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Review and fine-tune extracted addresses below before applying. All text is strictly in CAPITALS.
          </span>
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap (Sender ⇄ Receiver)</span>
          </button>
        </div>

        {/* Side-by-Side Dual Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1">
          {/* LEFT: SENDER (FROM) */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-bold text-xs tracking-wider text-slate-700 dark:text-slate-300">
                SENDER (FROM)
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                Bottom-Right Box
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                NAME *
              </label>
              <input
                type="text"
                value={sender.name}
                onChange={(e) => setSender({ ...sender, name: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                COMPANY / SHOP
              </label>
              <input
                type="text"
                value={sender.company || ''}
                onChange={(e) => setSender({ ...sender, company: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                ADDRESS LINE 1 *
              </label>
              <input
                type="text"
                value={sender.addressLine1}
                onChange={(e) => setSender({ ...sender, addressLine1: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                ADDRESS LINE 2
              </label>
              <input
                type="text"
                value={sender.addressLine2 || ''}
                onChange={(e) => setSender({ ...sender, addressLine2: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  CITY *
                </label>
                <input
                  type="text"
                  value={sender.city}
                  onChange={(e) => setSender({ ...sender, city: toUpperClean(e.target.value) })}
                  className="w-full uppercase text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  PIN CODE *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={sender.pinCode}
                  onChange={(e) => setSender({ ...sender, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  STATE *
                </label>
                <input
                  type="text"
                  value={sender.state}
                  onChange={(e) => setSender({ ...sender, state: toUpperClean(e.target.value) })}
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  MOBILE NO.
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={sender.mobile || ''}
                  onChange={(e) => setSender({ ...sender, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full font-mono text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: RECEIVER (TO) */}
          <div className="border border-blue-300 dark:border-blue-700/60 rounded-lg p-3 bg-blue-50/30 dark:bg-blue-950/20 space-y-2.5">
            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
              <span className="font-bold text-xs tracking-wider text-blue-900 dark:text-blue-300">
                RECEIVER (TO)
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-200 font-mono">
                Top Prominent Box
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-0.5">
                NAME *
              </label>
              <input
                type="text"
                value={receiver.name}
                onChange={(e) => setReceiver({ ...receiver, name: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs font-bold px-2.5 py-1.5 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                COMPANY / FIRM
              </label>
              <input
                type="text"
                value={receiver.company || ''}
                onChange={(e) => setReceiver({ ...receiver, company: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                ADDRESS LINE 1 *
              </label>
              <input
                type="text"
                value={receiver.addressLine1}
                onChange={(e) => setReceiver({ ...receiver, addressLine1: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                ADDRESS LINE 2
              </label>
              <input
                type="text"
                value={receiver.addressLine2 || ''}
                onChange={(e) => setReceiver({ ...receiver, addressLine2: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                LANDMARK
              </label>
              <input
                type="text"
                value={receiver.landmark || ''}
                onChange={(e) => setReceiver({ ...receiver, landmark: toUpperClean(e.target.value) })}
                className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  CITY *
                </label>
                <input
                  type="text"
                  value={receiver.city}
                  onChange={(e) => setReceiver({ ...receiver, city: toUpperClean(e.target.value) })}
                  className="w-full uppercase text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  PIN CODE *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={receiver.pinCode}
                  onChange={(e) => setReceiver({ ...receiver, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  STATE *
                </label>
                <input
                  type="text"
                  value={receiver.state}
                  onChange={(e) => setReceiver({ ...receiver, state: toUpperClean(e.target.value) })}
                  className="w-full uppercase text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  MOBILE NO. *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={receiver.mobile || ''}
                  onChange={(e) => setReceiver({ ...receiver, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-md"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Both (Sender to FROM & Receiver to TO)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
