'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

// ─── Flower confetti (unchanged) ────────────────────────────────────────────
const flowerPetals = Array.from({ length: 80 }, (_, i) => {
  const angle = (i / 80) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
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

// ─── Floating sparkle particles ─────────────────────────────────────────────
const sparkleData = [
  { x: -70, y: -60, size: 5, delay: 0, dur: 3.2 },
  { x: 65, y: -50, size: 4, delay: 0.8, dur: 2.8 },
  { x: -55, y: 30, size: 3, delay: 1.5, dur: 3.5 },
  { x: 72, y: 20, size: 4.5, delay: 0.4, dur: 3.0 },
  { x: -10, y: -80, size: 3.5, delay: 2.0, dur: 2.6 },
];

function SparkleParticle({ x, y, size, delay, dur, color }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        width: size,
        height: size,
      }}
      initial={{ x, y, opacity: 0, scale: 0 }}
      animate={{
        x: [x, x + 8, x - 6, x],
        y: [y, y - 14, y - 8, y],
        opacity: [0, 1, 0.6, 0],
        scale: [0, 1.2, 0.8, 0],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg width={size * 3} height={size * 3} viewBox="0 0 20 20" fill="none">
        <path
          d="M10 0 L11.8 7.2 L18 5.5 L12.8 10 L18 14.5 L11.8 12.8 L10 20 L8.2 12.8 L2 14.5 L7.2 10 L2 5.5 L8.2 7.2 Z"
          fill={color}
          opacity="0.85"
        />
      </svg>
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function GateScreen({ gateSubtitle, onOpen, themeColors }) {
  const [isOpened, setIsOpened] = useState(false);

  const activeColor = themeColors?.[0] || '#E2A9A3';
  const activeAccent = themeColors?.[1] || '#E2859B';

  // A lighter tint for highlights
  const highlightColor = useMemo(() => {
    // blend toward white for shimmer
    return `color-mix(in srgb, ${activeAccent} 50%, white)`;
  }, [activeAccent]);

  const handleClick = () => {
    if (isOpened) return;
    setIsOpened(true);
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
      {/* ─── Layered background glows ──────────────────────────────── */}
      {/* Outermost warm radial glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 420,
          height: 420,
          background: `radial-gradient(circle, ${activeColor}18 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0.5, scale: 1 }}
        animate={
          isOpened
            ? { opacity: 0, scale: 0.6 }
            : { scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }
        }
        transition={
          isOpened
            ? { duration: 0.5 }
            : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      {/* Mid glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${activeAccent}22 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0.4, scale: 1 }}
        animate={
          isOpened
            ? { opacity: 0, scale: 0 }
            : { scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={
          isOpened
            ? { duration: 0.4 }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      {/* Inner soft glow */}
      <motion.div
        className="absolute rounded-full blur-[60px]"
        style={{
          width: 180,
          height: 180,
          backgroundColor: activeAccent,
        }}
        initial={{ opacity: 0.12 }}
        animate={
          isOpened
            ? { opacity: 0 }
            : { opacity: [0.1, 0.2, 0.1] }
        }
        transition={
          isOpened
            ? { duration: 0.3 }
            : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {/* ─── Pulsing halo ring ─────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              border: `1.5px solid ${activeAccent}`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.35, 0],
              scale: [0.85, 1.3, 1.6],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              border: `1px solid ${activeColor}`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.25, 0],
              scale: [0.9, 1.2, 1.5],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              delay: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Floating gift box container ───────────────────────────── */}
      <motion.div
        initial={{ y: 0, rotate: 0, scale: 1 }}
        animate={
          isOpened
            ? { y: 0, rotate: 0, scale: 1 }
            : { y: [0, -14, 0], rotate: [-1.5, 1.5, -1.5], scale: [1, 1.03, 1] }
        }
        transition={
          isOpened
            ? { duration: 0 }
            : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative mb-10 z-10"
        style={{ width: 200, height: 200 }}
      >
        {/* ─── Floating sparkle particles ──────────────────────────── */}
        <AnimatePresence>
          {!isOpened &&
            sparkleData.map((s, i) => (
              <SparkleParticle
                key={i}
                {...s}
                color={i % 2 === 0 ? activeColor : activeAccent}
              />
            ))}
        </AnimatePresence>

        {/* ─── Main gift box SVG ───────────────────────────────────── */}
        <svg
          className="absolute inset-0"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Box body gradient – subtle luxury feel */}
            <linearGradient id="premBoxBody" x1="30" y1="80" x2="170" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface) 85%, white)" />
              <stop offset="0.5" stopColor="var(--color-surface)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--color-surface) 90%, black)" />
            </linearGradient>

            {/* Ribbon gradient */}
            <linearGradient id="premRibbon" x1="100" y1="70" x2="100" y2="175" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={activeAccent} />
              <stop offset="0.5" stopColor={activeColor} />
              <stop offset="1" stopColor={`color-mix(in srgb, ${activeAccent} 70%, black)`} />
            </linearGradient>

            {/* Shimmer highlight for ribbon */}
            <linearGradient id="premShimmer" x1="95" y1="80" x2="105" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="0.35" stopColor="white" stopOpacity="0.35" />
              <stop offset="0.5" stopColor="white" stopOpacity="0.1" />
              <stop offset="0.7" stopColor="white" stopOpacity="0.3" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Inner shadow for box depth */}
            <filter id="premInnerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset dx="0" dy="3" result="offsetBlur" />
              <feFlood floodColor="#000000" floodOpacity="0.15" />
              <feComposite in2="offsetBlur" operator="in" result="shadow" />
              <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>

            {/* Soft glow filter */}
            <filter id="premGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Floor shadow filter */}
            <filter id="premFloorBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>

            {/* Lid gradient */}
            <linearGradient id="premLidBody" x1="20" y1="65" x2="180" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface) 80%, white)" />
              <stop offset="0.4" stopColor="var(--color-surface)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--color-surface) 88%, black)" />
            </linearGradient>

            {/* Bow gradient */}
            <radialGradient id="premBowGrad" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0" stopColor={highlightColor} />
              <stop offset="0.5" stopColor={activeAccent} />
              <stop offset="1" stopColor={`color-mix(in srgb, ${activeAccent} 60%, black)`} />
            </radialGradient>

            {/* Bow highlight shimmer */}
            <linearGradient id="premBowHighlight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="0.4" stopColor="white" stopOpacity="0.4" />
              <stop offset="0.6" stopColor="white" stopOpacity="0.1" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Floor shadow ── */}
          <motion.ellipse
            cx="100" cy="182" rx="60" ry="9"
            fill={activeAccent}
            filter="url(#premFloorBlur)"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: isOpened ? 0 : [0.15, 0.28, 0.15] }}
            transition={isOpened ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Box body ── */}
          <rect
            x="30" y="85" width="140" height="88" rx="7"
            fill="url(#premBoxBody)"
            stroke={activeAccent}
            strokeWidth="1.5"
            filter="url(#premInnerShadow)"
          />

          {/* Box inner top highlight – light edge */}
          <rect
            x="31" y="86" width="138" height="3" rx="2"
            fill="white" opacity="0.12"
          />

          {/* Box bottom subtle shadow line */}
          <rect
            x="35" y="168" width="130" height="2" rx="1"
            fill="black" opacity="0.08"
          />

          {/* ── Vertical ribbon ── */}
          <rect x="88" y="85" width="24" height="88" fill="url(#premRibbon)" />
          {/* Ribbon shimmer overlay */}
          <rect x="88" y="85" width="24" height="88" fill="url(#premShimmer)" />
          {/* Ribbon left edge highlight */}
          <rect x="88" y="85" width="1.5" height="88" fill="white" opacity="0.2" />
          {/* Ribbon right edge shadow */}
          <rect x="110.5" y="85" width="1.5" height="88" fill="black" opacity="0.1" />

          {/* ── Horizontal ribbon ── */}
          <rect x="30" y="118" width="140" height="18" rx="0" fill="url(#premRibbon)" />
          {/* Horizontal ribbon shimmer */}
          <rect x="30" y="118" width="140" height="18" rx="0" fill="url(#premShimmer)" opacity="0.5" />
          {/* Horizontal ribbon top highlight */}
          <rect x="30" y="118" width="140" height="1.5" fill="white" opacity="0.2" />
          {/* Horizontal ribbon bottom shadow */}
          <rect x="30" y="134.5" width="140" height="1.5" fill="black" opacity="0.08" />

          {/* Cross-ribbon center knot */}
          <rect x="88" y="118" width="24" height="18" fill={activeAccent} opacity="0.7" />
          <rect x="88" y="118" width="24" height="18" fill="url(#premShimmer)" />
        </svg>

        {/* ─── Lid & Bow – pops off ────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={
            isOpened
              ? { y: -160, rotate: -30, opacity: 0 }
              : { y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 0.85, ease: 'easeOut' }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            {/* Re-declare defs for the lid SVG context */}
            <defs>
              <linearGradient id="premLidBodyL" x1="20" y1="65" x2="180" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface) 80%, white)" />
                <stop offset="0.4" stopColor="var(--color-surface)" />
                <stop offset="1" stopColor="color-mix(in srgb, var(--color-surface) 88%, black)" />
              </linearGradient>
              <linearGradient id="premRibbonL" x1="100" y1="65" x2="100" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={activeAccent} />
                <stop offset="1" stopColor={activeColor} />
              </linearGradient>
              <linearGradient id="premShimmerL" x1="88" y1="70" x2="112" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="white" stopOpacity="0" />
                <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="premBowGradL" cx="0.5" cy="0.4" r="0.6">
                <stop offset="0" stopColor={highlightColor} />
                <stop offset="0.5" stopColor={activeAccent} />
                <stop offset="1" stopColor={`color-mix(in srgb, ${activeAccent} 60%, black)`} />
              </radialGradient>
              <filter id="premBowGlowL" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* ── Lid body ── */}
            <rect
              x="22" y="68" width="156" height="22" rx="5"
              fill="url(#premLidBodyL)"
              stroke={activeAccent}
              strokeWidth="1.5"
            />
            {/* Lid top highlight */}
            <rect x="24" y="69" width="152" height="2.5" rx="1.5" fill="white" opacity="0.15" />
            {/* Lid bottom edge */}
            <rect x="24" y="87" width="152" height="1.5" rx="1" fill="black" opacity="0.06" />

            {/* ── Lid ribbon ── */}
            <rect x="88" y="68" width="24" height="22" fill="url(#premRibbonL)" />
            <rect x="88" y="68" width="24" height="22" fill="url(#premShimmerL)" />

            {/* ── Premium bow ── */}
            <g filter="url(#premBowGlowL)">
              {/* Left loop – elegant cubic curves */}
              <path
                d="M97 68 C92 58, 72 42, 55 50 C38 58, 42 70, 58 72 C68 73, 85 70, 97 68Z"
                fill="url(#premBowGradL)"
                stroke={activeAccent}
                strokeWidth="0.8"
              />
              {/* Left loop highlight */}
              <path
                d="M93 65 C88 57, 74 47, 62 52 C55 56, 56 63, 65 66"
                fill="none"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* Right loop – mirror */}
              <path
                d="M103 68 C108 58, 128 42, 145 50 C162 58, 158 70, 142 72 C132 73, 115 70, 103 68Z"
                fill="url(#premBowGradL)"
                stroke={activeAccent}
                strokeWidth="0.8"
              />
              {/* Right loop highlight */}
              <path
                d="M107 65 C112 57, 126 47, 138 52 C145 56, 144 63, 135 66"
                fill="none"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* Left tail */}
              <path
                d="M97 70 C90 76, 65 84, 55 78 C50 74, 58 68, 70 72"
                fill="url(#premBowGradL)"
                stroke={activeAccent}
                strokeWidth="0.6"
                opacity="0.85"
              />

              {/* Right tail */}
              <path
                d="M103 70 C110 76, 135 84, 145 78 C150 74, 142 68, 130 72"
                fill="url(#premBowGradL)"
                stroke={activeAccent}
                strokeWidth="0.6"
                opacity="0.85"
              />

              {/* Center knot */}
              <ellipse cx="100" cy="68" rx="9" ry="7" fill="url(#premBowGradL)" stroke={activeAccent} strokeWidth="0.8" />
              {/* Knot highlight */}
              <ellipse cx="98" cy="65" rx="4" ry="2.5" fill="white" opacity="0.25" />
            </g>
          </svg>
        </motion.div>

        {/* ─── Flower confetti burst (unchanged) ───────────────────── */}
        <AnimatePresence>
          {isOpened &&
            flowerPetals.map((petal) => (
              <motion.div
                key={petal.id}
                className="absolute pointer-events-none z-10"
                style={{
                  top: '50%',
                  left: '50%',
                  marginLeft: '-14px',
                  marginTop: '-14px',
                }}
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
                  ease: 'easeOut',
                  times: [0, 0.2, 1],
                }}
              >
                <FlowerSVG color={activeColor} size={28} />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* ─── Subtitle ─────────────────────────────────────────────── */}
      <motion.p
        className="font-serif italic text-base text-text-muted tracking-widest uppercase mb-12 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: isOpened ? 0 : 1 }}
      >
        {gateSubtitle}
      </motion.p>

      {/* ─── Tap hint ─────────────────────────────────────────────── */}
      <motion.p
        className="absolute bottom-16 text-[10px] text-accent tracking-[0.3em] uppercase"
        initial={{ opacity: 0.4 }}
        animate={
          isOpened ? { opacity: 0 } : { opacity: [0.4, 1, 0.4] }
        }
        transition={
          isOpened
            ? { duration: 0.3 }
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        tap anywhere
      </motion.p>
    </motion.div>
  );
}
