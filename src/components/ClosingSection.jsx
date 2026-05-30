'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Confetti ──────────────────────────────────────────────────────
const COLORS = ['#F472B6', '#E11D48', '#FBBF24', '#A78BFA', '#34D399', '#FB7185', '#FDE68A'];
const SHAPES = ['heart', 'petal', 'circle', 'star'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function Confetti({ active }) {
  const particles = Array.from({ length: 60 }, (_, i) => {
    const angle = randomBetween(-80, 80);
    const distance = randomBetween(80, 320);
    const rad = (angle * Math.PI) / 180;
    return {
      i,
      x: Math.sin(rad) * distance,
      y: -Math.abs(Math.cos(rad)) * distance,
      shape: SHAPES[i % SHAPES.length],
      color: COLORS[i % COLORS.length],
      size: randomBetween(8, 18),
      delay: randomBetween(0, 0.3),
      duration: randomBetween(0.9, 1.6),
      rotate: randomBetween(-180, 180),
    };
  });
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center" style={{ zIndex: 10 }}>
          {particles.map((p) => (
            <motion.div key={p.i} className="absolute"
              initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
              animate={{ opacity: [1, 1, 0], x: p.x, y: p.y, scale: [1, 1.2, 0.5], rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            >
              {p.shape === 'heart' && <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
              {p.shape === 'petal' && <svg width={p.size} height={p.size * 1.5} viewBox="0 0 12 18" fill={p.color}><ellipse cx="6" cy="9" rx="5" ry="8" opacity="0.85"/></svg>}
              {p.shape === 'circle' && <div style={{ width: p.size * 0.7, height: p.size * 0.7, borderRadius: '50%', background: p.color, opacity: 0.9 }} />}
              {p.shape === 'star' && <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Glowing Heart ─────────────────────────────────────────────────
function GlowHeart() {
  return (
    <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <svg width="64" height="64" viewBox="0 0 120 120" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="closingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1"/>
            <feGaussianBlur stdDeviation="12" result="blur2"/>
            <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="closingGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6"/><stop offset="0.5" stopColor="#E11D48"/><stop offset="1" stopColor="#9D174D"/>
          </linearGradient>
        </defs>
        <g filter="url(#closingGlow)">
          <path d="M60 85 C60 85, 25 55, 25 35 C25 20, 45 15, 60 30 C75 15, 95 20, 95 35 C95 55, 60 85, 60 85 Z"
            stroke="url(#closingGrad)" strokeWidth="2.5" fill="rgba(225,29,72,0.15)" strokeLinecap="round"/>
        </g>
      </svg>
    </motion.div>
  );
}

// ── Floating Flowers ──────────────────────────────────────────────
const flowerColors = ['#F472B6', '#E11D48', '#FB7185', '#F9A8D4', '#FDE68A'];
function FloatingFlowers() {
  return (
    <div className="flex gap-3 justify-center mb-4">
      {flowerColors.map((color, i) => (
        <motion.svg key={i} width="28" height="28" viewBox="0 0 24 24" fill={color}
          animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.5, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}>
          <circle cx="12" cy="6" r="3.5"/><circle cx="17.6" cy="9.5" r="3.5"/>
          <circle cx="15.5" cy="16" r="3.5"/><circle cx="8.5" cy="16" r="3.5"/>
          <circle cx="6.4" cy="9.5" r="3.5"/><circle cx="12" cy="12" r="3" fill="#FFF8"/>
        </motion.svg>
      ))}
    </div>
  );
}

// ── Cinema Film Strip decoration ──────────────────────────────────
function FilmStrip({ side }) {
  const holes = Array.from({ length: 8 });
  return (
    <div className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-7 flex flex-col justify-around items-center py-2`}
      style={{ background: '#0a0a0a', borderRight: side === 'left' ? '1px solid #222' : 'none', borderLeft: side === 'right' ? '1px solid #222' : 'none' }}>
      {holes.map((_, i) => (
        <div key={i} className="w-3 h-2.5 rounded-[2px]" style={{ background: '#1a1a1a', border: '1px solid #333' }} />
      ))}
    </div>
  );
}

// ── Cinema Modal ──────────────────────────────────────────────────
function CinemaModal({ secretPhoto, secretCaption, onClose }) {
  const isVideo = secretPhoto && (secretPhoto.endsWith('.mp4') || secretPhoto.endsWith('.webm') || secretPhoto.endsWith('.mov'));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }} />

        {/* Cinema frame */}
        <motion.div
          className="relative z-10 w-full max-w-[380px]"
          initial={{ scale: 0.7, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top label — like a cinema reel */}
          <div className="text-center mb-3">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/30">✦ a secret just for you ✦</span>
          </div>

          {/* Main screen */}
          <div className="relative rounded-sm overflow-hidden" style={{ border: '2px solid #222', boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 0 8px #111, 0 0 0 9px #222' }}>
            {/* Film strips on sides */}
            <FilmStrip side="left" />
            <FilmStrip side="right" />

            {/* Content area */}
            <div className="mx-7">
              {/* Projector light glow at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(255,220,100,0.08) 0%, transparent 70%)' }} />

              {/* Photo or Video */}
              {secretPhoto && (
                isVideo ? (
                  <video
                    src={secretPhoto}
                    className="w-full aspect-[3/4] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={secretPhoto}
                    alt="secret"
                    className="w-full aspect-[3/4] object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )
              )}

              {/* Vignette overlay */}
              <div className="absolute inset-0 mx-7 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
            </div>
          </div>

          {/* Caption below like a movie card */}
          {secretCaption && (
            <motion.div
              className="text-center mt-5 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="font-serif italic text-sm md:text-base text-white/70 leading-relaxed">
                "{secretCaption}"
              </p>
            </motion.div>
          )}

          {/* Close button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="font-sans text-xs tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors"
            >
              close ✕
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ── Main Component ────────────────────────────────────────────────
export default function ClosingSection({ closingLine, sender, secretPhoto, secretCaption, closingPreTitle, closingTitle1, closingTitle2, closingParagraph, celebrateBtnText }) {
  const [celebrating, setCelebrating] = useState(false);
  const [celebrateCount, setCelebrateCount] = useState(0);
  const [showCinema, setShowCinema] = useState(false);

  const handleCelebrate = useCallback(() => {
    setCelebrating(true);
    setCelebrateCount((n) => n + 1);
    // After confetti, open cinema
    setTimeout(() => {
      setCelebrating(false);
      setShowCinema(true);
    }, 1800);
  }, []);

  return (
    <>
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 text-center overflow-hidden">
        <motion.div
          className="relative flex flex-col items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}><FloatingFlowers /></motion.div>

          <motion.span variants={itemVariants} className="font-serif italic text-sm md:text-base tracking-widest text-text-muted lowercase">
            {closingPreTitle || 'always & forever'}
          </motion.span>

          <motion.h2 variants={itemVariants} className="flex flex-col gap-1 md:gap-2">
            <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">{closingTitle1 || 'You Are Loved'}</span>
            <span className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">{closingTitle2 || 'Beyond Words'}</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="font-sans font-light text-sm md:text-base text-text-muted max-w-[400px] leading-relaxed mt-2 whitespace-pre-line">
            {closingParagraph || 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.'}
          </motion.p>

          <motion.p variants={itemVariants} className="font-serif italic text-base md:text-lg text-text-muted mt-2">— {sender}</motion.p>

          <motion.div variants={itemVariants}><GlowHeart /></motion.div>

          {/* Celebrate button */}
          <motion.div variants={itemVariants} className="relative mt-4">
            <Confetti active={celebrating} key={celebrateCount} />
            <motion.button
              onClick={handleCelebrate}
              disabled={celebrating}
              className="relative font-serif italic text-base md:text-lg px-8 py-3 rounded-full border border-accent/40 text-text overflow-hidden disabled:opacity-60"
              style={{ background: 'rgba(225, 29, 72, 0.1)', boxShadow: '0 0 24px rgba(225,29,72,0.2)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(225,29,72,0.45)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
              {celebrating ? 'celebrating...' : (celebrateBtnText || 'celebrate ✨')}
            </motion.button>
          </motion.div>

          {/* Re-open cinema hint after first view */}
          {celebrateCount > 0 && !celebrating && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCinema(true)}
              className="font-sans text-xs text-text-muted/40 hover:text-text-muted/70 transition-colors underline underline-offset-4"
            >
              view secret memory again
            </motion.button>
          )}
        </motion.div>
        <div className="h-28" />
      </section>

      {/* Cinema Modal — rendered outside the section for full-screen */}
      {showCinema && (
        <CinemaModal
          secretPhoto={secretPhoto}
          secretCaption={secretCaption}
          onClose={() => setShowCinema(false)}
        />
      )}
    </>
  );
}
