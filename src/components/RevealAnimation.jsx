'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

// Generate random flowers for the confetti burst
const flowerPetals = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
  // Spread them wider
  const distance = 100 + Math.random() * 150;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - (50 + Math.random() * 50), // slightly biased upwards initially
    rotate: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.7,
    color: '#E2A9A3',
  };
});

function FlowerSVG({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 5-petal flower path */}
      <path
        d="M12 2C10 2 8.5 5 12 9C15.5 5 14 2 12 2Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M12 22C10 22 8.5 19 12 15C15.5 19 14 22 12 22Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M22 12C22 14 19 15.5 15 12C19 8.5 22 10 22 12Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M2 12C2 10 5 8.5 9 12C5 15.5 2 14 2 12Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M19 19C17.5 21 15 19 13.5 16.5C16.5 15 19 17.5 19 19Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M5 5C6.5 3 9 5 10.5 7.5C7.5 9 5 6.5 5 5Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M19 5C21 6.5 19 9 16.5 10.5C15 7.5 17.5 5 19 5Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M5 19C3 17.5 5 15 7.5 13.5C9 16.5 6.5 19 5 19Z"
        fill={color}
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="2.5" fill="color-mix(in srgb, var(--color-surface) 60%, transparent)" />
    </svg>
  );
}

export default function RevealAnimation({ isRevealing, onComplete, themeColors }) {
  useEffect(() => {
    if (isRevealing) {
      const timer = setTimeout(onComplete, 1800);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, onComplete]);

  const activeColor = themeColors?.[0] || '#E2A9A3';
  const activeAccent = themeColors?.[1] || '#E2859B';

  return (
    <AnimatePresence>
      {isRevealing && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gift box body (stays on ground) - Matching Dark Rosewood theme */}
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            className="absolute"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <defs>
              <linearGradient id="boxGradientPinkRev" x1="20" y1="70" x2="140" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="color-mix(in srgb, var(--color-surface) 60%, transparent)" />
                <stop offset="1" stopColor="var(--color-surface)" />
              </linearGradient>
              <linearGradient id="ribbonGradientPinkRev" x1="80" y1="40" x2="80" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor={activeAccent} />
                <stop offset="1" stopColor="color-mix(in srgb, var(--color-accent) 60%, black)" />
              </linearGradient>
            </defs>
            <rect x="25" y="70" width="110" height="70" rx="6" fill="url(#boxGradientPinkRev)" stroke={activeAccent} strokeWidth="2" />
            <rect x="70" y="70" width="20" height="70" fill="url(#ribbonGradientPinkRev)" />
          </svg>

          {/* Lid lifting with the beautiful bow */}
          <motion.div
            className="absolute"
            style={{ top: '50%', left: '50%', marginLeft: '-80px', marginTop: '-80px' }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: -120, rotate: -25, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
              <rect x="18" y="55" width="124" height="20" rx="4" fill="url(#boxGradientPinkRev)" stroke={activeAccent} strokeWidth="2" />
              <rect x="18" y="60" width="124" height="10" fill="url(#ribbonGradientPinkRev)" />
              {/* Bow */}
              <g>
                <path d="M75 55 C50 30, 20 40, 45 60 Z" fill="url(#ribbonGradientPinkRev)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <path d="M85 55 C110 30, 140 40, 115 60 Z" fill="url(#ribbonGradientPinkRev)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <circle cx="80" cy="56" r="8" fill={activeAccent} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              </g>
            </svg>
          </motion.div>

          {/* Petal burst */}
          {flowerPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute"
              style={{ top: '50%', left: '50%', marginLeft: '-12px', marginTop: '-12px' }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: [0, petal.x, petal.x + (Math.random() * 40 - 20)],
                y: [0, petal.y, petal.y + 80 + Math.random() * 100], // drift down after burst
                scale: [0, petal.scale, petal.scale * 0.8],
                opacity: [0, 1, 1, 0],
                rotate: [0, petal.rotate + 180, petal.rotate + 360],
              }}
              transition={{
                duration: 2.2, // longer duration for drifting
                delay: 0.1 + Math.random() * 0.2,
                ease: "easeOut",
                times: [0, 0.4, 1], // burst quickly, then drift
                opacity: { times: [0, 0.2, 0.7, 1] },
              }}
            >
              <FlowerSVG color={activeColor} size={28} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
