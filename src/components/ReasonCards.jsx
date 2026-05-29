'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Animated Icons ────────────────────────────────────────────────
function AnimatedHeart() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
    </motion.svg>
  );
}
function AnimatedStar() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
      <path d="M12 2L15 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9 9L12 2Z" fill="currentColor"/>
    </motion.svg>
  );
}
function AnimatedFlower() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ rotate: [0, 45, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <path d="M12 2C10 2 10 7 12 10C14 7 14 2 12 2ZM12 22C14 22 14 17 12 14C10 17 10 22 12 22ZM2 12C2 14 7 14 10 12C7 10 2 10 2 12ZM22 12C22 10 17 10 14 12C17 14 22 14 22 12Z" fill="currentColor"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </motion.svg>
  );
}
function AnimatedMoon() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
    </motion.svg>
  );
}
function AnimatedMusic() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
    </motion.svg>
  );
}
function AnimatedSparkle() {
  return (
    <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent"
      animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" fill="currentColor"/>
    </motion.svg>
  );
}

const icons = [AnimatedHeart, AnimatedStar, AnimatedFlower, AnimatedMoon, AnimatedMusic, AnimatedSparkle];

// ── Locked placeholder card ───────────────────────────────────────
function LockedCard({ index, onReveal }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center cursor-pointer select-none min-h-[140px] border border-accent/10"
      style={{ background: 'color-mix(in srgb, var(--color-text) 5%, transparent)' }}
      onClick={onReveal}
      whileHover={{ scale: 1.03, borderColor: 'rgba(225,29,72,0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Lock icon */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
        className="mb-2"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent/50">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </motion.div>
      <p className="font-serif italic text-xs text-accent/50 tracking-wide">tap to reveal</p>
    </motion.div>
  );
}

// ── Revealed card ─────────────────────────────────────────────────
function RevealedCard({ reason, index }) {
  const Icon = icons[index % icons.length];
  return (
    <motion.div
      layout
      key={`revealed-${index}`}
      initial={{ opacity: 0, scale: 0.85, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass rounded-2xl p-5 md:p-6"
      style={{ perspective: '800px' }}
    >
      <div className="mb-3"><Icon /></div>
      <h3 className="font-serif font-bold text-sm md:text-base text-text mb-1">{reason.title}</h3>
      <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed font-light">{reason.desc}</p>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function ReasonCards({ reasons, reasonsTitle1, reasonsTitle2 }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const allRevealed = revealedCount >= reasons.length;

  const revealNext = () => {
    if (revealedCount < reasons.length) {
      setRevealedCount((n) => n + 1);
    }
  };

  return (
    <section className="relative z-10 px-6 py-16 md:py-24 flex flex-col items-center">

      {/* Section Title */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2 className="flex flex-col gap-1 md:gap-2">
          <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">{reasonsTitle1 || 'The Reasons'}</span>
          <span className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">{reasonsTitle2 || 'I Love You'}</span>
        </h2>
      </motion.div>

      {/* Counter hint */}
      <motion.p
        className="font-serif italic text-sm text-text-muted/60 mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        {allRevealed
          ? '✨ all reasons revealed ✨'
          : `${revealedCount} of ${reasons.length} revealed — tap a card to unlock`}
      </motion.p>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 md:gap-4 max-w-[480px] w-full"
        layout
      >
        {reasons.map((reason, i) =>
          i < revealedCount ? (
            <RevealedCard key={i} reason={reason} index={i} />
          ) : (
            <LockedCard key={i} index={i} onReveal={revealNext} />
          )
        )}
      </motion.div>

      {/* "Reveal all" shortcut after first reveal */}
      <AnimatePresence>
        {revealedCount > 0 && !allRevealed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setRevealedCount(reasons.length)}
            className="mt-8 font-sans text-xs text-text-muted/40 hover:text-text-muted/70 transition-colors underline underline-offset-4"
          >
            reveal all at once
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
