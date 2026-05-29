'use client';

import { motion } from 'framer-motion';

export default function GateScreen({ gateSubtitle, onOpen }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg cursor-pointer select-none overflow-hidden"
      onClick={onOpen}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Soft background aura */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-accent/10 blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Glowing Gift Box SVG */}
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [-2, 2, -2],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
        className="relative mb-10 z-10"
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boxGradientPink" x1="20" y1="70" x2="140" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6B2C42" />
              <stop offset="1" stopColor="#4A1D2D" />
            </linearGradient>
            <linearGradient id="ribbonGradientPink" x1="80" y1="40" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#D4AF37" />
            </linearGradient>
            <filter id="glowPink" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing shadow behind box */}
          <ellipse cx="80" cy="145" rx="55" ry="8" fill="#E2859B" opacity="0.25" filter="url(#glowPink)" />

          {/* Main Box Body */}
          <rect x="25" y="70" width="110" height="70" rx="6" fill="url(#boxGradientPink)" stroke="#E2859B" strokeWidth="2" />
          
          {/* Main Lid */}
          <rect x="18" y="55" width="124" height="20" rx="4" fill="url(#boxGradientPink)" stroke="#E2859B" strokeWidth="2" />

          {/* Vertical Ribbon */}
          <rect x="70" y="55" width="20" height="85" fill="url(#ribbonGradientPink)" />
          
          {/* Horizontal Ribbon on lid */}
          <rect x="18" y="60" width="124" height="10" fill="url(#ribbonGradientPink)" />

          {/* Beautiful Bow */}
          <g filter="url(#glowPink)">
            {/* Left Loop */}
            <path d="M75 55 C50 30, 20 40, 45 60 Z" fill="url(#ribbonGradientPink)" stroke="#FEF08A" strokeWidth="1" />
            {/* Right Loop */}
            <path d="M85 55 C110 30, 140 40, 115 60 Z" fill="url(#ribbonGradientPink)" stroke="#FEF08A" strokeWidth="1" />
            {/* Center Knot */}
            <circle cx="80" cy="56" r="8" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
          </g>
          
          {/* Sparkles */}
          <path d="M30 40 L35 30 L40 40 L50 45 L40 50 L35 60 L30 50 L20 45 Z" fill="#FDE68A" opacity="0.8" transform="scale(0.5) translate(10, 0)" />
          <path d="M120 35 L123 25 L126 35 L136 38 L126 41 L123 51 L120 41 L110 38 Z" fill="#FDE68A" opacity="0.6" transform="scale(0.6) translate(40, -10)" />
        </svg>
      </motion.div>

      {/* Subtitle */}
      <p className="font-serif italic text-base text-text-muted tracking-widest uppercase mb-12 z-10">
        {gateSubtitle}
      </p>

      {/* Tap hint */}
      <motion.p
        className="absolute bottom-16 text-[10px] text-accent tracking-[0.3em] uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        tap anywhere
      </motion.p>
    </motion.div>
  );
}
