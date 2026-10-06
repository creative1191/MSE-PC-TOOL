import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  showText?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  width = 1.6,
  height = 42,
  displayValue = false,
  showText = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const cleanValue = value ? value.trim().toUpperCase() : '7D134850071';
    try {
      JsBarcode(svgRef.current, cleanValue, {
        format: 'CODE128',
        width,
        height,
        displayValue,
        lineColor: '#000000',
        margin: 0,
        background: 'transparent',
      });
    } catch (e) {
      console.warn('Barcode generation warning:', e);
    }
  }, [value, width, height, displayValue]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
      {showText && (
        <span className="font-mono font-bold text-[8.5px] tracking-wider text-black mt-0.5">
          {value || '7D134850071'}
        </span>
      )}
    </div>
  );
};
