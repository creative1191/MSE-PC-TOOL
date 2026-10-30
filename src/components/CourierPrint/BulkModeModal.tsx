import React, { useState } from 'react';
import {
  CourierAddress,
  CourierPrintSettings,
} from '../../types/courierPrint';
import { parseRawAddressText, toUpperClean } from '../../utils/indianPostalData';
import { exportBatchEnvelopesToPdf } from '../../utils/envelopePdfExport';
import {
  Layers,
  FileDown,
  Printer,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface BulkModeModalProps {
  from: CourierAddress;
  settings: CourierPrintSettings;
  onClose: () => void;
  onDirectBatchPrint: (recipients: CourierAddress[]) => void;
}

export const BulkModeModal: React.FC<BulkModeModalProps> = ({
  from,
  settings,
  onClose,
  onDirectBatchPrint,
}) => {
  const [bulkRawText, setBulkRawText] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<CourierAddress[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleParseBatch = () => {
    if (!bulkRawText.trim()) return;

    // Split either by double newlines or lines starting with numbered entries like "1." or "2."
    const chunks = bulkRawText
      .split(/(?:\r?\n\s*\r?\n)|(?:^\s*\d+[\.\)]\s+)/m)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);

    const parsed: CourierAddress[] = chunks.map((chunk, idx) => {
      return parseRawAddressText(chunk, `bulk-${Date.now()}-${idx}`);
    });

    setParsedRecipients(parsed);
  };

  const handleDownloadBatchPdf = async () => {
    if (!parsedRecipients.length) return;
    setIsExporting(true);
    try {
      await exportBatchEnvelopesToPdf(parsedRecipients, from, settings);
    } catch (e) {
      console.error(e);
      alert('Failed to generate batch PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTriggerPrint = () => {
    if (!parsedRecipients.length) return;
    onDirectBatchPrint(parsedRecipients);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bulk Batch Envelope Printing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Batch parse multiple addresses separated by blank lines and export as a single multi-page PDF
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 flex-1 overflow-y-auto">
          {/* Left: Input Textarea */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Paste Multiple Addresses (Separate each with an empty line)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Double Newline Separated
              </span>
            </div>

            <textarea
              rows={12}
              value={bulkRawText}
              onChange={(e) => setBulkRawText(e.target.value)}
              placeholder={`Rajesh Sharma\nFlat 302, Sai Kripa Apts\nBengaluru, Karnataka 560037\n9845098765\n\nVikas Electronics\nShop 12, Nehru Place\nNew Delhi, Delhi 110019\n9811099887\n\nAnita Patel\n45 Ring Road, Navrangpura\nAhmedabad, Gujarat 380009`}
              className="w-full flex-1 p-3 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleParseBatch}
              disabled={!bulkRawText.trim()}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse Batch ({bulkRawText.split(/\n\s*\n/).filter(Boolean).length} entries detected)</span>
            </button>
          </div>

          {/* Right: Parsed Summary & Batch Actions */}
          <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Parsed Envelopes Queue ({parsedRecipients.length})
              </span>
              {parsedRecipients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setParsedRecipients([])}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[260px]">
              {parsedRecipients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No parsed envelopes yet. Paste your batch addresses on the left and click "Parse Batch".
                </div>
              ) : (
                parsedRecipients.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="p-2 rounded bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold uppercase text-slate-900 dark:text-slate-100">
                        {i + 1}. {rec.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {rec.city}, {rec.state} - {rec.pinCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setParsedRecipients(parsedRecipients.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Batch Output Buttons */}
            {parsedRecipients.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadBatchPdf}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>
                    {isExporting ? 'Generating Multi-Page PDF...' : `Download ${parsedRecipients.length} Envelopes PDF`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print All Envelopes Directly</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
