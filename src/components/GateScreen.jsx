'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Generate random flowers for the confetti burst
const flowerPetals = Array.from({ length: 80 }, (_, i) => {
  const angle = (i / 80) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
  // Spread them wider
  const distance = 80 + Math.random() * 160;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - (60 + Math.random() * 60),
    driftX: Math.random() * 100 - 50,
    driftY: 100 + Math.random() * 120,
    rotate: Math.random() * 360,
    scale: 0.4 + Math.random() * 0.7,
    delay: Math.random() * 0.2,
  };
});

function FlowerSVG({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C10 2 8.5 5 12 9C15.5 5 14 2 12 2Z" fill={color} opacity="0.9" />
      <path d="M12 22C10 22 8.5 19 12 15C15.5 19 14 22 12 22Z" fill={color} opacity="0.9" />
      <path d="M22 12C22 14 19 15.5 15 12C19 8.5 22 10 22 12Z" fill={color} opacity="0.9" />
      <path d="M2 12C2 10 5 8.5 9 12C5 15.5 2 14 2 12Z" fill={color} opacity="0.9" />
      <path d="M19 19C17.5 21 15 19 13.5 16.5C16.5 15 19 17.5 19 19Z" fill={color} opacity="0.9" />
      <path d="M5 5C6.5 3 9 5 10.5 7.5C7.5 9 5 6.5 5 5Z" fill={color} opacity="0.9" />
      <path d="M19 5C21 6.5 19 9 16.5 10.5C15 7.5 17.5 5 19 5Z" fill={color} opacity="0.9" />
      <path d="M5 19C3 17.5 5 15 7.5 13.5C9 16.5 6.5 19 5 19Z" fill={color} opacity="0.9" />
      <circle cx="12" cy="12" r="2.5" fill="color-mix(in srgb, var(--color-surface) 60%, transparent)" />
    </svg>
  );
}

export default function GateScreen({ gateSubtitle, onOpen, themeColors }) {
  const [isOpened, setIsOpened] = useState(false);

  const activeColor = themeColors?.[0] || '#E2A9A3';
  const activeAccent = themeColors?.[1] || '#E2859B';

  const handleClick = () => {
    if (isOpened) return;
    setIsOpened(true);
    // Wait for the lid to pop and flowers to burst, then crossfade to main content
    setTimeout(() => {
      if (onOpen) onOpen();
    }, 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg select-none overflow-hidden"
      style={{ cursor: isOpened ? 'default' : 'pointer' }}
      onClick={handleClick}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Soft background aura - fades out quickly on open */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-accent/10 blur-[80px]"
        initial={{ opacity: 0.3, scale: 1 }}
        animate={isOpened ? { opacity: 0, scale: 0 } : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={isOpened ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Glowing Gift Box Container */}
      <motion.div
        initial={{ y: 0, rotate: 0, scale: 1 }}
        animate={isOpened ? { y: 0, rotate: 0, scale: 1 } : { y: [0, -12, 0], rotate: [-2, 2, -2], scale: [1, 1.02, 1] }}
        transition={isOpened ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-10 z-10 w-[160px] h-[160px]"
      >
        {/* Main Body SVG */}
        <svg
          className="absolute inset-0"
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boxGradientPink" x1="20" y1="70" x2="140" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="color-mix(in srgb, var(--color-surface) 60%, transparent)" />
              <stop offset="1" stopColor="var(--color-surface)" />
            </linearGradient>
            <linearGradient id="ribbonGradientPink" x1="80" y1="40" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor={activeAccent} />
              <stop offset="1" stopColor="color-mix(in srgb, var(--color-accent) 60%, black)" />
            </linearGradient>
            <filter id="glowPink" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing shadow behind box - fades out on open */}
          <motion.ellipse 
            cx="80" cy="145" rx="55" ry="8" fill={activeAccent} filter="url(#glowPink)" 
            initial={{ opacity: 0.25 }}
            animate={{ opacity: isOpened ? 0 : 0.25 }}
          />

          {/* Main Box Body */}
          <rect x="25" y="70" width="110" height="70" rx="6" fill="url(#boxGradientPink)" stroke={activeAccent} strokeWidth="2" />
          <rect x="70" y="70" width="20" height="70" fill="url(#ribbonGradientPink)" />
          
          {/* Sparkles - hide on open */}
          <motion.g initial={{ opacity: 1 }} animate={{ opacity: isOpened ? 0 : 1 }}>
            <path d="M30 40 L35 30 L40 40 L50 45 L40 50 L35 60 L30 50 L20 45 Z" fill={activeColor} opacity="0.8" transform="scale(0.5) translate(10, 0)" />
            <path d="M120 35 L123 25 L126 35 L136 38 L126 41 L123 51 L120 41 L110 38 Z" fill={activeColor} opacity="0.6" transform="scale(0.6) translate(40, -10)" />
          </motion.g>
        </svg>

        {/* Lid & Bow - Pops off when opened */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={isOpened ? { y: -140, rotate: -35, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            <rect x="18" y="55" width="124" height="20" rx="4" fill="url(#boxGradientPink)" stroke={activeAccent} strokeWidth="2" />
            <rect x="18" y="60" width="124" height="10" fill="url(#ribbonGradientPink)" />
            
            <g filter="url(#glowPink)">
              <path d="M75 55 C50 30, 20 40, 45 60 Z" fill="url(#ribbonGradientPink)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M85 55 C110 30, 140 40, 115 60 Z" fill="url(#ribbonGradientPink)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <circle cx="80" cy="56" r="8" fill={activeAccent} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            </g>
          </svg>
        </motion.div>

        {/* Confetti Burst */}
        <AnimatePresence>
          {isOpened && flowerPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute pointer-events-none z-10"
              style={{ top: '50%', left: '50%', marginLeft: '-14px', marginTop: '-14px' }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: [0, petal.x, petal.x + petal.driftX],
                y: [0, petal.y, petal.y + petal.driftY],
                scale: [0, petal.scale, petal.scale * 0.8],
                opacity: [0, 1, 0],
                rotate: [0, petal.rotate + 180, petal.rotate + 360],
              }}
              transition={{
                duration: 3.5,
                delay: petal.delay,
                ease: "easeOut",
                times: [0, 0.2, 1],
              }}
            >
              <FlowerSVG color={activeColor} size={28} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Subtitle - fade out on open */}
      <motion.p 
        className="font-serif italic text-base text-text-muted tracking-widest uppercase mb-12 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: isOpened ? 0 : 1 }}
      >
        {gateSubtitle}
      </motion.p>

      {/* Tap hint - fade out on open */}
      <motion.p
        className="absolute bottom-16 text-[10px] text-accent tracking-[0.3em] uppercase"
        initial={{ opacity: 0.4 }}
        animate={isOpened ? { opacity: 0 } : { opacity: [0.4, 1, 0.4] }}
        transition={isOpened ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        tap anywhere
      </motion.p>
    </motion.div>
  );
}
