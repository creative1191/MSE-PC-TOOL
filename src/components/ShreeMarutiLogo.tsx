import React from 'react';

interface ShreeMarutiLogoProps {
  className?: string;
  customLogoUrl?: string | null;
}

export const ShreeMarutiLogo: React.FC<ShreeMarutiLogoProps> = ({ className = 'h-8', customLogoUrl }) => {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Shree Maruti Logo"
        className={`${className} object-contain`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 340 70"
        className="h-full w-auto max-w-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Emblem: Green & Orange Circular Dynamic Motion */}
        <g transform="translate(6, 6)">
          <circle cx="28" cy="28" r="26" fill="#007A3D" />
          <path
            d="M 28 8 A 20 20 0 0 1 48 28 L 38 28 A 10 10 0 0 0 28 18 Z"
            fill="#FF8C00"
          />
          <path
            d="M 16 34 L 28 16 L 40 34 L 32 34 L 32 44 L 24 44 L 24 34 Z"
            fill="#FFFFFF"
          />
          <circle cx="28" cy="28" r="3" fill="#FF8C00" />
        </g>

        {/* Wordmark: SHREE MARUTI */}
        <text
          x="70"
          y="34"
          fontFamily="'Arial Black', Impact, sans-serif"
          fontWeight="900"
          fontSize="24"
          letterSpacing="0.5"
          fill="#007A3D"
        >
          SHREE MARUTI
        </text>

        {/* Subtitle: COURIER SERVICES / LOGISTICS */}
        <text
          x="72"
          y="50"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="800"
          fontSize="10"
          letterSpacing="2"
          fill="#FF8C00"
        >
          COURIER SERVICES
        </text>
      </svg>
    </div>
  );
};
