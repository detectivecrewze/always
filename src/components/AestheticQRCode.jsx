'use client';

import React, { useMemo } from 'react';
import QRCode from 'qrcode';

export default function AestheticQRCode({ url, themeConfig, size = 300 }) {
  const qrData = useMemo(() => {
    if (!url) return null;
    try {
      // Generate QR matrix
      // We use errorCorrectionLevel H (High) because custom shapes degrade readability slightly
      const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
      return qr.modules;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [url]);

  if (!qrData) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          background: themeConfig.bg,
          border: `1px dashed ${themeConfig.accent}50`,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: themeConfig.textMuted,
          fontSize: '0.85rem'
        }}
      >
        Enter a URL to generate QR
      </div>
    );
  }

  const moduleCount = qrData.size;
  // A standard QR code requires quiet zone (padding). We'll add 2 modules of padding.
  const padding = 2;
  const viewBoxSize = moduleCount + padding * 2;
  
  const cells = [];
  
  // Helper to check if a coordinate is inside a finder pattern
  const isFinder = (x, y) => {
    const isTopLeft = x < 7 && y < 7;
    const isTopRight = x >= moduleCount - 7 && y < 7;
    const isBottomLeft = x < 7 && y >= moduleCount - 7;
    return isTopLeft || isTopRight || isBottomLeft;
  };

  // Build the data modules
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (isFinder(x, y)) continue; // Handled separately
      
      const isDark = qrData.get(x, y);
      if (isDark) {
        cells.push({ x: x + padding, y: y + padding });
      }
    }
  }

  // 10x10 Heart path
  const heartPath = "M5 9.5 C5 9.5 0.5 6 0.5 3 C0.5 1 2.5 0 5 2.5 C7.5 0 9.5 1 9.5 3 C9.5 6 5 9.5 5 9.5 Z";

  const renderFinder = (startX, startY) => (
    <g transform={`translate(${startX + padding}, ${startY + padding})`}>
      {/* Outer rounded rect */}
      <rect 
        x="0.5" y="0.5" 
        width="6" height="6" 
        rx="2" ry="2" 
        fill="none" 
        stroke={themeConfig.accent} 
        strokeWidth="1" 
      />
      {/* Inner Heart! We translate by 2,2 (the center 3x3 block) and scale to fit */}
      <g transform="translate(2, 2) scale(0.3)">
        <path d={heartPath} fill={themeConfig.accent} />
      </g>
    </g>
  );

  return (
    <div 
      style={{ 
        background: themeConfig.bg, 
        padding: '1.5rem', 
        borderRadius: '24px',
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px ${themeConfig.accent}20`,
        display: 'inline-block'
      }}
    >
      <svg 
        id="aesthetic-qr-svg"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        width={size} 
        height={size}
        style={{ display: 'block' }}
      >
        {/* Background is handled by the wrapper for HTML, but for SVG export we need a rect */}
        <rect width="100%" height="100%" fill={themeConfig.bg} />

        {/* Finder Patterns */}
        {renderFinder(0, 0)} {/* Top Left */}
        {renderFinder(moduleCount - 7, 0)} {/* Top Right */}
        {renderFinder(0, moduleCount - 7)} {/* Bottom Left */}

        {/* Data Modules (Hearts) */}
        <g fill={themeConfig.text}>
          {cells.map((cell, i) => (
            <g key={i} transform={`translate(${cell.x}, ${cell.y}) scale(0.1)`}>
              <path d={heartPath} />
            </g>
          ))}
        </g>
        
        {/* Center Logo/Heart - we carve out a 5x5 block in the center and overlay a beautiful big heart */}
        <g transform={`translate(${viewBoxSize/2 - 2.5}, ${viewBoxSize/2 - 2.5})`}>
          <rect x="-0.5" y="-0.5" width="6" height="6" fill={themeConfig.bg} />
          <g transform="scale(0.5)">
            <path d={heartPath} fill={themeConfig.accent} />
            <path d={heartPath} fill="none" stroke={themeConfig.particle} strokeWidth="0.5" opacity="0.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
