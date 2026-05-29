'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

const cinematic = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function HeroSection({ heroPreTitle, heroLine1, heroLine2, heroSubtitle }) {
  const { scrollY } = useScroll();
  // Fades out and moves down slightly as the user scrolls the first 400px
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const yScroll = useTransform(scrollY, [0, 400], [0, 100]);

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center">
      <motion.div style={{ opacity, y: yScroll }} className="w-full flex justify-center">
        <motion.div
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
        {/* Pretitle */}
        {heroPreTitle && (
          <span className="font-serif italic text-lg md:text-xl text-text-muted tracking-widest lowercase">
            {heroPreTitle}
          </span>
        )}

        {/* 2-line Headline */}
        <h1 className="flex flex-col gap-2 md:gap-3">
          {heroLine1 && (
            <span className="block font-serif text-5xl md:text-6xl lg:text-7xl text-text leading-tight">
              {heroLine1}
            </span>
          )}
          {heroLine2 && (
            <span className="block font-serif italic text-6xl md:text-7xl lg:text-8xl text-accent leading-tight">
              {heroLine2}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        {heroSubtitle && (
          <p className="font-sans font-light text-sm md:text-base text-text-muted mt-4">
            {heroSubtitle}
          </p>
        )}

        {/* Beautiful Symmetrical Neon Heart */}
        <motion.div
          className="mt-16 relative"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="90" height="90" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="10" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="neonGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F472B6" />
                <stop offset="0.5" stopColor="#E11D48" />
                <stop offset="1" stopColor="#9D174D" />
              </linearGradient>
            </defs>
            <g filter="url(#neonGlow)">
              
              {/* Left Half of Wireframe Heart (Draws symmetrically) */}
              <motion.path 
                d="M60 100 C60 100, 15 65, 15 35 C15 15, 40 10, 60 30" 
                stroke="url(#neonGradient)" 
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Right Half of Wireframe Heart (Draws symmetrically) */}
              <motion.path 
                d="M60 100 C60 100, 105 65, 105 35 C105 15, 80 10, 60 30" 
                stroke="url(#neonGradient)" 
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Inner Pulsing Heart (Perfectly Straight & Symmetrical) */}
              <motion.path 
                d="M60 85 C60 85, 25 55, 25 35 C25 20, 45 15, 60 30 C75 15, 95 20, 95 35 C95 55, 60 85, 60 85 Z" 
                stroke="#F9A8D4" 
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="rgba(225, 29, 72, 0.15)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              
              {/* Center Sparkle */}
              <motion.circle
                cx="60" cy="40" r="2.5" fill="#FFF"
                animate={{ scale: [1, 3, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </g>
          </svg>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-2 text-text-muted/70"
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase font-light">Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16M18 13l-6 7-6-7"/>
          </svg>
        </motion.div>
      </motion.div>
      </motion.div>
    </section>
  );
}
