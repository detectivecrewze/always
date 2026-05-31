'use client';

import React, { useMemo } from 'react';
import QRCode from 'qrcode';

// Pseudo-random generator for stable decorative dots
const randomDot = (x, y) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) > 0.45; // 55% density
};

// Math formula for a heart shape
const isInsideHeart = (gx, gy, G) => {
  // Normalize to -1.3 to 1.3 range to ensure the entire heart fits inside the grid with a tiny bit of breathing room
  const x = (gx - G / 2) / (G / 2) * 1.3;
  const y = -(gy - G / 2) / (G / 2) * 1.3; 
  
  const x2 = x * x;
  const y2 = y * y;
  const term1 = x2 + y2 - 1;
  const val = term1 * term1 * term1 - x2 * y2 * y; 
  return val <= 0;
};

export default function AestheticQRCode({ url, themeConfig, size = 300 }) {
  const qrData = useMemo(() => {
    if (!url) return null;
    try {
      // Use H (High) error correction so we can place a logo in the middle safely
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
          background: 'transparent',
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

  const N = qrData.size;
  // Make the grid large enough to form a beautiful heart around the QR code
  const G = Math.floor(N * 2.5); 
  // Perfectly center the QR code inside the grid
  const offsetX = Math.floor((G - N) / 2);
  const offsetY = Math.floor((G - N) / 2);

  const cells = [];
  const decorativeCells = [];
  
  // Padding around the central QR code (creates the white border)
  const padding = 2;

  // Standard finder patterns are 7x7 at the corners of the inner QR code
  const isFinder = (x, y) => {
    const isTopLeft = x < 7 && y < 7;
    const isTopRight = x >= N - 7 && y < 7;
    const isBottomLeft = x < 7 && y >= N - 7;
    return isTopLeft || isTopRight || isBottomLeft;
  };

  // Build the grid
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      // Check if coordinate is in the QR zone (including padding)
      const inQrZoneX = gx >= offsetX - padding && gx < offsetX + N + padding;
      const inQrZoneY = gy >= offsetY - padding && gy < offsetY + N + padding;
      
      if (inQrZoneX && inQrZoneY) {
        // Inside the QR Zone
        const inActualQrX = gx >= offsetX && gx < offsetX + N;
        const inActualQrY = gy >= offsetY && gy < offsetY + N;
        
        if (inActualQrX && inActualQrY) {
          const qx = gx - offsetX;
          const qy = gy - offsetY;
          
          if (!isFinder(qx, qy)) {
            if (qrData.get(qx, qy)) {
              cells.push({ x: gx, y: gy });
            }
          }
        }
        // If it's in the padding zone but not in actual QR, we do nothing (leaves it blank)
      } else {
        // Outside the QR Zone - check if in heart shape
        if (isInsideHeart(gx, gy, G)) {
          if (randomDot(gx, gy)) {
            decorativeCells.push({ x: gx, y: gy });
          }
        }
      }
    }
  }

  const renderFinder = (x, y) => {
    const absX = x + offsetX;
    const absY = y + offsetY;
    return (
      <g transform={`translate(${absX}, ${absY})`}>
        {/* Outer square (7x7) */}
        <rect x="0" y="0" width="7" height="7" rx="1.5" fill={themeConfig.accent} />
        {/* Inner whitespace (5x5) */}
        <rect x="1" y="1" width="5" height="5" rx="1" fill={themeConfig.bg} />
        {/* Inner dot (3x3) */}
        <rect x="2" y="2" width="3" height="3" rx="0.5" fill={themeConfig.accent} />
      </g>
    );
  };

  // 10x10 Heart path for center logo
  const heartPath = "M5 9.5 C5 9.5 0.5 6 0.5 3 C0.5 1 2.5 0 5 2.5 C7.5 0 9.5 1 9.5 3 C9.5 6 5 9.5 5 9.5 Z";

  return (
    <div 
      style={{ 
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg 
        id="aesthetic-qr-svg"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`0 0 ${G} ${G}`} 
        width={size} 
        height={size}
        style={{ display: 'block' }}
      >
        {/* Optional background for SVG export to ensure it's not transparent if user doesn't want it, but we handle that in canvas. We leave it transparent here so the shape is truly the heart. */}
        <rect width="100%" height="100%" fill="transparent" />

        {/* Decorative Dots (forming the outer heart shape) */}
        <g fill={themeConfig.accent} opacity="0.8">
          {decorativeCells.map((cell, i) => (
             <rect key={`dec-${i}`} x={cell.x + 0.1} y={cell.y + 0.1} width="0.8" height="0.8" rx="0.3" />
          ))}
        </g>

        {/* The Central QR Code */}
        {/* Background base for the QR code (creates the white/theme-bg border) */}
        <rect 
          x={offsetX - padding} 
          y={offsetY - padding} 
          width={N + padding * 2} 
          height={N + padding * 2} 
          fill={themeConfig.bg} 
          rx="4"
        />

        {/* Finder Patterns */}
        {renderFinder(0, 0)} {/* Top Left */}
        {renderFinder(N - 7, 0)} {/* Top Right */}
        {renderFinder(0, N - 7)} {/* Bottom Left */}

        {/* Data Modules */}
        <g fill={themeConfig.text}>
          {cells.map((cell, i) => (
             <rect key={`data-${i}`} x={cell.x + 0.05} y={cell.y + 0.05} width="0.9" height="0.9" rx="0.3" />
          ))}
        </g>

        {/* Center Logo/Heart - we carve out a 5x5 block in the center and overlay a beautiful big heart */}
        <g transform={`translate(${offsetX + Math.floor(N/2) - 2.5}, ${offsetY + Math.floor(N/2) - 2.5})`}>
          <rect x="-0.5" y="-0.5" width="6" height="6" fill={themeConfig.bg} />
          <g transform="scale(0.5)">
            <path d={heartPath} fill={themeConfig.accent} />
          </g>
        </g>
      </svg>
    </div>
  );
}
