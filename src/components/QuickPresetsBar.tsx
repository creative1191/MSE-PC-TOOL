import React from 'react';
import { Package, RotateCcw, Leaf } from 'lucide-react';
import { PresetLabel, DTDCBillData, CourierConfig } from '../types';

interface QuickPresetsBarProps {
  currentConfig: CourierConfig;
  currentPresets: PresetLabel[];
  activePresetId: string;
  onApplyPreset: (preset: PresetLabel) => void;
  layoutMode: DTDCBillData['layoutMode'];
  paperSaveMode?: boolean;
  onUpdateField: (field: keyof DTDCBillData, value: any) => void;
  onClearAll?: () => void;
}

export const QuickPresetsBar: React.FC<QuickPresetsBarProps> = React.memo(({
  currentConfig,
  currentPresets,
  activePresetId,
  onApplyPreset,
  layoutMode,
  paperSaveMode,
  onUpdateField,
  onClearAll,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-2xs mb-3 flex flex-wrap items-center justify-between gap-2 no-print">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentConfig.shortName} Presets:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                activePresetId === preset.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs font-semibold">
          <button
            type="button"
            onClick={() => onUpdateField('layoutMode', '3_COPIES_PORTRAIT')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              layoutMode === '3_COPIES_PORTRAIT'
                ? 'bg-white text-blue-900 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            3 Copies Portrait (A4)
          </button>
          <button
            type="button"
            onClick={() => onUpdateField('layoutMode', 'SINGLE_LANDSCAPE')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              layoutMode === 'SINGLE_LANDSCAPE'
                ? 'bg-white text-blue-900 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single Landscape (A4)
          </button>
        </div>

        {/* Paper Save Mode Toggle - Always Visible */}
        <button
          type="button"
          onClick={() => {
            if (layoutMode !== '3_COPIES_PORTRAIT') {
              onUpdateField('layoutMode', '3_COPIES_PORTRAIT');
            }
            onUpdateField('paperSaveMode', !paperSaveMode);
          }}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer shadow-2xs ${
            paperSaveMode && layoutMode === '3_COPIES_PORTRAIT'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}
          title="Print only top copy and leave bottom copies blank to save paper"
        >
          <Leaf className={`w-3.5 h-3.5 ${paperSaveMode && layoutMode === '3_COPIES_PORTRAIT' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Paper Save: {paperSaveMode && layoutMode === '3_COPIES_PORTRAIT' ? 'ON (1 Copy)' : 'OFF'}</span>
        </button>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-md border border-red-300 cursor-pointer transition-colors shadow-2xs"
            title="Clear all fields in the entire invoice"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        )}
      </div>
    </div>
  );
});
