'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

// Generate random flower petals for the burst
const flowerPetals = Array.from({ length: 15 }, (_, i) => {
  const angle = (i / 15) * Math.PI * 2;
  const distance = 80 + Math.random() * 80;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotate: Math.random() * 360,
    scale: 0.6 + Math.random() * 0.8,
    color: '#E2A9A3',
  };
});

function PetalSVG({ color, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="6" ry="10" fill={color} opacity="0.8" />
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
                x: petal.x,
                y: petal.y,
                scale: petal.scale,
                opacity: [0, 1, 1, 0],
                rotate: petal.rotate + 180,
              }}
              transition={{
                duration: 1.5,
                delay: 0.1 + Math.random() * 0.2,
                ease: [0.25, 0.1, 0.25, 1],
                opacity: { times: [0, 0.2, 0.8, 1] },
              }}
            >
              <PetalSVG color={activeColor} size={24} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
