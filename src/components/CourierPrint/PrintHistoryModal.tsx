import React, { useState, useEffect } from 'react';
import { CourierAddress, CourierPrintSettings, PrintLogItem } from '../../types/courierPrint';
import { History, Printer, Trash2, X, RefreshCw, Calendar, MapPin, User } from 'lucide-react';

interface PrintHistoryModalProps {
  onReprint: (item: PrintLogItem) => void;
  onClose: () => void;
}

const STORAGE_KEY = 'courierprint_print_history_v1';

export function addPrintHistoryLog(
  to: CourierAddress,
  from: CourierAddress,
  settings: CourierPrintSettings
) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newItem: PrintLogItem = {
      id: `print-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      recipientName: to.name,
      recipientCity: to.city,
      senderName: from.name,
      preset: settings.preset,
      trackingNo: settings.showBarcode ? settings.barcodeValue : undefined,
      envelopeData: { to, from, settings },
    };
    const updated = [newItem, ...existing.slice(0, 49)]; // Keep last 50 prints
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not record print history', e);
  }
}

export const PrintHistoryModal: React.FC<PrintHistoryModalProps> = ({
  onReprint,
  onClose,
}) => {
  const [logs, setLogs] = useState<PrintLogItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleClearHistory = () => {
    if (confirm('Clear all print logs?')) {
      localStorage.removeItem(STORAGE_KEY);
      setLogs([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Print History & Dispatch Logs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {logs.length} previous print jobs logged • 1-click instant reprinting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No print jobs logged yet. Whenever you print an envelope or export a PDF, it will appear here.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-700 transition-colors flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase">
                      {log.recipientName}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono font-bold">
                      {log.preset}
                    </span>
                    {log.trackingNo && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono">
                        AWB: {log.trackingNo}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{log.recipientCity || 'CITY'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onReprint(log);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
