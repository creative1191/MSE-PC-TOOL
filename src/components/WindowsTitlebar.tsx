import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Printer, Settings, Sun, Moon, Home } from 'lucide-react';

interface WindowsTitlebarProps {
  onPrint?: () => void;
  onOpenSettings?: () => void;
  onGoHome?: () => void;
}

export const WindowsTitlebar: React.FC<WindowsTitlebarProps> = ({
  onPrint,
  onOpenSettings,
  onGoHome,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="bg-[#0b1329] text-white px-3.5 py-1.5 flex items-center justify-between select-none border-b border-slate-800/80 no-print transition-colors">
      {/* Left: Premium App Icon & Global Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-amber-400/90 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src="/assets/aistudio/logo_87b71685.jpg"
            alt="Maa Sharda Enterprises"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="font-semibold text-xs tracking-wide text-slate-100 flex items-center gap-2">
          <span className="font-bold text-amber-300">MAA SHARDA ENTERPRISES</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-200 hidden sm:inline">MSE Bill Generator</span>
          <span className="hidden md:inline-block text-[10px] text-blue-400 font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/60">
            Win 11 Fluent
          </span>
        </h1>
      </div>

      {/* Right: Actionable Controls & Window Chrome */}
      <div className="flex items-center gap-1.5">
        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            title="Go to Home Hub (All Sections)"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 px-2 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-medium">Home Hub</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded text-xs transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title="Custom Logo & Configuration"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 px-2 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-medium">Settings</span>
          </button>
        )}

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            title="Direct Print Document (Ctrl+P)"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Print</span>
            <kbd className="hidden md:inline font-mono text-[9px] bg-blue-700/80 px-1 py-0.2 rounded text-blue-100">
              Ctrl+P
            </kbd>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-700/60 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={() => {}}
          title="Minimize"
          className="w-7 h-6 flex items-center justify-center hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? 'Restore' : 'Maximize'}
          className="w-7 h-6 flex items-center justify-center hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Square className="w-2.5 h-2.5" />
        </button>

        <button
          type="button"
          onClick={() => {}}
          title="Close"
          className="w-7 h-6 flex items-center justify-center hover:bg-red-600 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
