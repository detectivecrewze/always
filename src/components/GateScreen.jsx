'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Flower image assets (PNG with transparent bg) ───────────────────────────
const LIGHT_FLOWER_SRCS = [
  '/assets/flowser-sunflower.png',
  '/assets/flower_daisy.png',
  '/assets/flower-rose.png',
  '/assets/flower_hydrangea.png',
];

const DARK_FLOWER_SRCS = [
  '/assets/flower_hydrangea.png',
  '/assets/indigo_anemone-removebg-preview.png',
  '/assets/dark_blue_rose-removebg-preview.png',
];

// ─── Sparkle data (idle only) ─────────────────────────────────────────────────
const SPARKLE_DATA = [
  { x: -70, y: -60, size: 5, delay: 0,   dur: 3.2 },
  { x:  65, y: -50, size: 4, delay: 0.8, dur: 2.8 },
  { x: -55, y:  30, size: 3, delay: 1.5, dur: 3.5 },
  { x:  72, y:  20, size: 4.5, delay: 0.4, dur: 3.0 },
  { x: -10, y: -80, size: 3.5, delay: 2.0, dur: 2.6 },
];

// ─── SparkleParticle ─────────────────────────────────────────────────────────
function SparkleParticle({ x, y, size, delay, dur, color }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: '50%', left: '50%', width: size, height: size }}
      initial={{ x, y, opacity: 0, scale: 0 }}
      animate={{
        x: [x, x + 8, x - 6, x],
        y: [y, y - 14, y - 8, y],
        opacity: [0, 1, 0.6, 0],
        scale: [0, 1.2, 0.8, 0],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
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

// ─── FountainFlower: single flower following parabolic arc ───────────────────
function FountainFlower({ src, size, xEnd, yPeak, yFinal, rotateDirection, rotateSpeed, delay, duration, zIndex, finalScale, exitPhase }) {
  const isLeft = xEnd < 0;
  const shouldSwipeLeft = isLeft && (exitPhase === 'left' || exitPhase === 'right');
  const shouldSwipeRight = !isLeft && exitPhase === 'right';
  const isSwiping = shouldSwipeLeft || shouldSwipeRight;

  return (
    <motion.img
      src={src}
      draggable={false}
      decoding="async"
      className="absolute pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        zIndex,
        willChange: 'transform, opacity',
      }}
      initial={{ x: 0, y: 0, scale: 0.12, opacity: 0, rotate: 0 }}
      animate={
        isSwiping
          ? {
              x: isLeft ? xEnd - 1500 : xEnd + 1500,
              y: yFinal,
              scale: finalScale,
              opacity: 0,
              rotate: 360 * rotateDirection,
            }
          : {
              x: [0, xEnd * 0.4, xEnd],
              y: [0, yPeak, yFinal],
              scale: [0.12, 0.85, finalScale],
              opacity: [0, 1, 1],
              rotate: [0, 360 * rotateDirection],
            }
      }
      transition={
        isSwiping
          ? {
              duration: 1.2,
              ease: 'easeIn',
            }
          : {
              default: {
                duration,
                delay,
                times: [0, 0.38, 1],
                ease: 'easeOut',
              },
              rotate: {
                duration: rotateSpeed,
                delay,
                repeat: Infinity,
                ease: 'linear',
              }
            }
      }
    />
  );
}

// ─── Generate fountain particles (deterministic seeded positions) ─────────────
function buildParticles(count, themeName) {
  // Simple seeded-ish randomizer to keep it stable across renders
  let seed = 42;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

  const isDark = ['midnight-blue', 'midnight-rose', 'ocean-breeze'].includes(themeName);
  const FLOWER_SRCS = isDark ? DARK_FLOWER_SRCS : LIGHT_FLOWER_SRCS;

  const particles = [];
  for (let i = 0; i < count; i++) {
    const frac = i / count; // 0..1
    // ORIGINAL ANGLE LOGIC: Sweeping fan
    const spread = 240; // Widened slightly to guarantee extreme left/right coverage
    const baseAngleDeg = -90 + (frac - 0.5) * spread;
    const jitter = (rng() - 0.5) * 18;
    const angleDeg = baseAngleDeg + jitter;
    const angleRad = (angleDeg * Math.PI) / 180;

    // ORIGINAL ARC LOGIC: Scaled up to reach edges and bottom
    const sidePull = 1 + Math.abs(frac - 0.5) * 1.8; // Stronger pull to corners
    const dist = 300 + rng() * 550; // Pushed further out
    const xEnd = Math.cos(angleRad) * dist * sidePull + (rng() - 0.5) * 100;
    
    const yPeak = Math.sin(angleRad) * dist - 50 - rng() * 150;   // rises above emitter
    const yFinal = yPeak + 250 + rng() * 550;                     // falls deeply down to cover bottom gaps

    // EXACT SAME SIZES AS PREVIOUSLY APPROVED MEDIUM
    const size = 140 + rng() * 140;         // 140–280 px
    const finalScale = 1.0 + rng() * 0.6;   // 1.0–1.6 scale

    // CONTINUOUS ORGANIC ROTATION
    const rotateDirection = rng() > 0.5 ? 1 : -1;
    const rotateSpeed = 6 + rng() * 10; // Slow, graceful continuous spin (6 to 16 seconds per 360 deg)

    // DRAMATIC POPCORN: stagger over 1.6s so each flower pops one by one
    const delay = frac * 1.6 + rng() * 0.15;
    const duration = 2.0 + rng() * 1.6; // Longer flight = more dramatic arc
    const zIndex = Math.floor(i / 5) + 1;    // later particles on top

    particles.push({
      id: i,
      src: FLOWER_SRCS[i % FLOWER_SRCS.length],
      size, xEnd, yPeak, yFinal, finalScale,
      rotateDirection, rotateSpeed, delay, duration, zIndex,
    });
  }
  return particles;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function GateScreen({ gateSubtitle, onInteraction, onOpen, themeColors, themeName }) {
  const [phase, setPhase] = useState('idle'); // idle | fountain | done
  const [exitPhase, setExitPhase] = useState('none'); // none | left | right
  const timerRef = useRef(null);

  // Optimize particle count for mobile
  const [particleCount, setParticleCount] = useState(300);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setParticleCount(280);
    }
  }, []);
  const activeParticles = useMemo(() => buildParticles(particleCount, themeName), [particleCount, themeName]);

  const activeColor  = themeColors?.[0] || '#E2A9A3';
  const activeAccent = themeColors?.[1] || '#E2859B';
  const highlightColor = useMemo(
    () => `color-mix(in srgb, ${activeAccent} 50%, white)`,
    [activeAccent]
  );

  // Click handler: idle → fountain
  const handleClick = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('fountain');
    if (onInteraction) onInteraction();
    
    // Sequential swipe out animations — start after flowers have settled
    setTimeout(() => setExitPhase('left'), 4200);
    setTimeout(() => setExitPhase('right'), 4700);

    // After swipe out, transition to gift page
    timerRef.current = setTimeout(() => {
      setPhase('done');
      setTimeout(() => { if (onOpen) onOpen(); }, 400);
    }, 5500);
  }, [phase, onOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isFountain = phase === 'fountain' || phase === 'done';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'var(--color-bg)', cursor: phase === 'idle' ? 'pointer' : 'default' }}
      onClick={handleClick}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
    >
      {/* ── Idle background glow rings ─────────────────────────────────── */}
      <AnimatePresence>
        {!isFountain && (
          <motion.div
            key="idleglow"
            className="absolute rounded-full"
            style={{ width: 420, height: 420, background: `radial-gradient(circle, ${activeColor}18 0%, transparent 70%)` }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isFountain && (
          <motion.div
            key="idlering"
            className="absolute rounded-full"
            style={{ width: 200, height: 200, border: `1.5px solid ${activeAccent}` }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.35, 0], scale: [0.85, 1.3, 1.6] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* ── FOUNTAIN: all flowers erupt from box center ─────────────── */}
      <AnimatePresence>
        {isFountain && activeParticles.map((p) => (
          <FountainFlower key={p.id} {...p} exitPhase={exitPhase} />
        ))}
      </AnimatePresence>

      {/* ── Gift box: floats when idle, falls off when opened ──────────── */}
      <motion.div
        className="relative z-30"
        style={{ width: 200, height: 200 }}
        initial={{ y: 0, rotate: 0, scale: 1 }}
        animate={
          phase === 'idle'
            ? { y: [0, -14, 0], rotate: [-1.5, 1.5, -1.5], scale: [1, 1.03, 1] }
            : { scale: 0, opacity: 0 }
        }
        transition={
          phase === 'idle'
            ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.4, delay: 0.25, ease: 'backIn' }
        }
      >
        {/* Idle sparkles */}
        <AnimatePresence>
          {phase === 'idle' && SPARKLE_DATA.map((s, i) => (
            <SparkleParticle
              key={i} {...s}
              color={i % 2 === 0 ? activeColor : activeAccent}
            />
          ))}
        </AnimatePresence>

        {/* ── Box body SVG ─────────────────────────────────────────────── */}
        <svg className="absolute inset-0" width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gBoxBody" x1="30" y1="80" x2="170" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface) 85%, white)" />
              <stop offset="0.5" stopColor="var(--color-surface)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--color-surface) 90%, black)" />
            </linearGradient>
            <linearGradient id="gRibbon" x1="100" y1="70" x2="100" y2="175" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={activeAccent} />
              <stop offset="0.5" stopColor={activeColor} />
              <stop offset="1" stopColor={`color-mix(in srgb, ${activeAccent} 70%, black)`} />
            </linearGradient>
            <linearGradient id="gShimmer" x1="95" y1="80" x2="105" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0"    stopColor="white" stopOpacity="0" />
              <stop offset="0.35" stopColor="white" stopOpacity="0.35" />
              <stop offset="0.5"  stopColor="white" stopOpacity="0.1" />
              <stop offset="0.7"  stopColor="white" stopOpacity="0.3" />
              <stop offset="1"    stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id="gFloor" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {/* Floor shadow */}
          <motion.ellipse cx="100" cy="182" rx="60" ry="9" fill={activeAccent} filter="url(#gFloor)"
            animate={{ opacity: isFountain ? 0 : [0.15, 0.28, 0.15] }}
            transition={isFountain ? { duration: 0.3 } : { duration: 4, repeat: Infinity }}
          />
          {/* Box body */}
          <rect x="30" y="85" width="140" height="88" rx="7" fill="url(#gBoxBody)" stroke={activeAccent} strokeWidth="1.5" />
          <rect x="31" y="86" width="138" height="3" rx="2" fill="white" opacity="0.12" />
          <rect x="35" y="168" width="130" height="2" rx="1" fill="black" opacity="0.08" />
          {/* Vertical ribbon */}
          <rect x="88" y="85" width="24" height="88" fill="url(#gRibbon)" />
          <rect x="88" y="85" width="24" height="88" fill="url(#gShimmer)" />
          <rect x="88" y="85" width="1.5" height="88" fill="white" opacity="0.2" />
          <rect x="110.5" y="85" width="1.5" height="88" fill="black" opacity="0.1" />
          {/* Horizontal ribbon */}
          <rect x="30" y="118" width="140" height="18" fill="url(#gRibbon)" />
          <rect x="30" y="118" width="140" height="18" fill="url(#gShimmer)" opacity="0.5" />
          <rect x="30" y="118" width="140" height="1.5" fill="white" opacity="0.2" />
          <rect x="30" y="134.5" width="140" height="1.5" fill="black" opacity="0.08" />
          {/* Knot */}
          <rect x="88" y="118" width="24" height="18" fill={activeAccent} opacity="0.7" />
          <rect x="88" y="118" width="24" height="18" fill="url(#gShimmer)" />
        </svg>

        {/* ── Lid & Bow: snaps off instantly on click (Action 1) ──────── */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={isFountain
            ? { y: -220, rotate: -45, opacity: 0 }
            : { y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 0.55, ease: [0.55, 0, 1, 0.5] }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="gLidBody" x1="20" y1="65" x2="180" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="color-mix(in srgb, var(--color-surface) 80%, white)" />
                <stop offset="0.4" stopColor="var(--color-surface)" />
                <stop offset="1" stopColor="color-mix(in srgb, var(--color-surface) 88%, black)" />
              </linearGradient>
              <linearGradient id="gLidRibbon" x1="100" y1="65" x2="100" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={activeAccent} />
                <stop offset="1" stopColor={activeColor} />
              </linearGradient>
              <linearGradient id="gLidShimmer" x1="88" y1="70" x2="112" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="white" stopOpacity="0" />
                <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="gBow" cx="0.5" cy="0.4" r="0.6">
                <stop offset="0" stopColor={highlightColor} />
                <stop offset="0.5" stopColor={activeAccent} />
                <stop offset="1" stopColor={`color-mix(in srgb, ${activeAccent} 60%, black)`} />
              </radialGradient>
              <filter id="gBowGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>
            {/* Lid */}
            <rect x="22" y="68" width="156" height="22" rx="5" fill="url(#gLidBody)" stroke={activeAccent} strokeWidth="1.5" />
            <rect x="24" y="69" width="152" height="2.5" rx="1.5" fill="white" opacity="0.15" />
            <rect x="24" y="87" width="152" height="1.5" rx="1" fill="black" opacity="0.06" />
            {/* Lid ribbon */}
            <rect x="88" y="68" width="24" height="22" fill="url(#gLidRibbon)" />
            <rect x="88" y="68" width="24" height="22" fill="url(#gLidShimmer)" />
            {/* Bow */}
            <g filter="url(#gBowGlow)">
              <path d="M97 68 C92 58, 72 42, 55 50 C38 58, 42 70, 58 72 C68 73, 85 70, 97 68Z" fill="url(#gBow)" stroke={activeAccent} strokeWidth="0.8" />
              <path d="M93 65 C88 57, 74 47, 62 52 C55 56, 56 63, 65 66" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
              <path d="M103 68 C108 58, 128 42, 145 50 C162 58, 158 70, 142 72 C132 73, 115 70, 103 68Z" fill="url(#gBow)" stroke={activeAccent} strokeWidth="0.8" />
              <path d="M107 65 C112 57, 126 47, 138 52 C145 56, 144 63, 135 66" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
              <path d="M97 70 C90 76, 65 84, 55 78 C50 74, 58 68, 70 72" fill="url(#gBow)" stroke={activeAccent} strokeWidth="0.6" opacity="0.85" />
              <path d="M103 70 C110 76, 135 84, 145 78 C150 74, 142 68, 130 72" fill="url(#gBow)" stroke={activeAccent} strokeWidth="0.6" opacity="0.85" />
              <ellipse cx="100" cy="68" rx="9" ry="7" fill="url(#gBow)" stroke={activeAccent} strokeWidth="0.8" />
              <ellipse cx="98" cy="65" rx="4" ry="2.5" fill="white" opacity="0.25" />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      {/* ── Subtitle ─────────────────────────────────────────────────────── */}
      <motion.p
        className="font-serif italic text-base text-text-muted tracking-widest uppercase mb-12 z-10"
        animate={{ opacity: isFountain ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {gateSubtitle}
      </motion.p>

      {/* ── Tap hint ─────────────────────────────────────────────────────── */}
      <motion.p
        className="absolute bottom-16 text-[10px] text-accent tracking-[0.3em] uppercase z-10"
        animate={isFountain ? { opacity: 0 } : { opacity: [0.4, 1, 0.4] }}
        transition={isFountain ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        tap anywhere
      </motion.p>
    </motion.div>
  );
}
