import React from 'react';

interface TrackonLogoProps {
  className?: string;
  customLogoUrl?: string | null;
}

export const TrackonLogo: React.FC<TrackonLogoProps> = ({ className = 'h-8', customLogoUrl }) => {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Trackon Logo"
        className={`${className} object-contain`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 70"
        className="h-full w-auto max-w-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Dynamic Forward Speed Chevrons */}
        <g transform="skewX(-15)">
          <path d="M 12 14 L 32 14 L 46 35 L 32 56 L 12 56 L 26 35 Z" fill="#D32F2F" />
          <path d="M 32 14 L 52 14 L 66 35 L 52 56 L 32 56 L 46 35 Z" fill="#0D233A" />

          {/* Bold TRACKON Lettering */}
          <text
            x="76"
            y="47"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontSize="38"
            letterSpacing="-0.5"
            fill="#D32F2F"
          >
            TRACKON
          </text>
        </g>

        {/* Subtitle Tagline */}
        <text
          x="100"
          y="64"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="700"
          fontSize="9.5"
          letterSpacing="3"
          fill="#0D233A"
        >
          COURIERS PVT. LTD.
        </text>
      </svg>
    </div>
  );
};
