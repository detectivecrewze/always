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
            <stop stopColor="var(--color-particle)"/><stop offset="0.5" stopColor="var(--color-accent)"/><stop offset="1" stopColor="var(--color-text-muted)"/>
          </linearGradient>
        </defs>
        <g filter="url(#closingGlow)">
          <path d="M60 85 C60 85, 25 55, 25 35 C25 20, 45 15, 60 30 C75 15, 95 20, 95 35 C95 55, 60 85, 60 85 Z"
            stroke="var(--color-particle)" strokeWidth="2.5" fill="var(--color-accent)" fillOpacity="0.15" strokeLinecap="round"/>
        </g>
      </svg>
    </motion.div>
  );
}

// ── Floating Flowers (Exact 5 Animated Flower Icons from Commit 7b5fe30) ──
const flowerColors = ['var(--color-accent)', 'var(--color-particle)', 'var(--color-text-muted)', 'var(--color-accent)', 'var(--color-particle)'];
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

// ── Fullscreen Cinema Modal ───────────────────────────────────────
function CinemaModal({ secretPhoto, secretCaption, secretVideoMuted, onClose }) {
  const isVideo = secretPhoto && (secretPhoto.endsWith('.mp4') || secretPhoto.endsWith('.webm') || secretPhoto.endsWith('.mov'));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 px-4 overflow-hidden"
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 right-6 z-20 text-white/60 hover:text-white transition-colors p-2 rounded-full bg-white/10 backdrop-blur-md"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </motion.button>

        {/* Secret Media Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative max-w-2xl max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15"
        >
          {secretPhoto && (
            isVideo ? (
              <video
                src={secretPhoto}
                className="w-full h-full max-h-[75vh] object-contain"
                autoPlay
                controls
                playsInline
                muted={secretVideoMuted}
              />
            ) : (secretPhoto.match(/\.(jpeg|jpg|gif|png|webp)$/i) || secretPhoto.includes('for-you-always') || secretPhoto.includes('cloudinary')) ? (
              <img
                src={secretPhoto}
                alt="Secret Memory"
                className="w-full h-full max-h-[75vh] object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-[#111] flex flex-col items-center justify-center text-center p-6">
                <span className="text-3xl mb-4">🔗</span>
                <h3 className="font-serif text-[18px] text-[#e5e5e5] mb-2">Sebuah Tautan Rahasia</h3>
                <p className="font-sans text-[12px] text-white/60 mb-6">Seseorang meninggalkan pesan atau kenangan untukmu di tautan ini.</p>
                <a href={secretPhoto} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full border border-white/20 text-white/80 font-sans text-[11px] uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Buka Tautan
                </a>
              </div>
            )
          )}
        </motion.div>

        {/* Secret Caption */}
        {secretCaption && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-serif italic text-lg md:text-xl text-white/80 text-center max-w-md mt-6"
          >
            {secretCaption}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] } },
};

// ── Main Component ────────────────────────────────────────────────
export default function ClosingSection({
  closingLine,
  sender,
  secretPhoto,
  secretCaption,
  secretVideoMuted,
  closingPreTitle,
  closingTitle1,
  closingTitle2,
  closingParagraph,
  celebrateBtnText,
  onCinemaToggle,
  isLocked
}) {
  const [celebrating, setCelebrating] = useState(false);
  const [celebrateCount, setCelebrateCount] = useState(0);
  const [showCinema, setShowCinema] = useState(false);

  const handleCelebrate = useCallback(() => {
    if (isLocked) return;
    setCelebrating(true);
    setCelebrateCount((n) => n + 1);
    setTimeout(() => {
      setCelebrating(false);
      if (secretPhoto) {
        setShowCinema(true);
        if (onCinemaToggle) onCinemaToggle(true);
      }
    }, 1800);
  }, [secretPhoto, isLocked, onCinemaToggle]);

  return (
    <>
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 text-center overflow-hidden">
        <motion.div
          className="relative flex flex-col items-center gap-6 w-full max-w-[560px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Animated 5-Flower Icons from commit 7b5fe30 */}
          <motion.div variants={itemVariants}><FloatingFlowers /></motion.div>

          {/* PreTitle & Main Titles — ALWAYS UNBLURRED & CLEAR */}
          <motion.span variants={itemVariants} className="font-serif italic text-sm md:text-base tracking-widest text-text-muted lowercase">
            {closingPreTitle || 'always & forever'}
          </motion.span>

          <motion.h2 variants={itemVariants} className="flex flex-col gap-1 md:gap-2">
            <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">{closingTitle1 || 'You Are Loved'}</span>
            <span className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">{closingTitle2 || 'Beyond Words'}</span>
          </motion.h2>

          {/* Container for Paragraph, Sender Signature (- Daffa), GlowHeart & Celebrate Button */}
          <div className="relative w-full flex flex-col items-center gap-6 mt-2">
            {/* Blurred content wrapper when isLocked */}
            <div
              className="flex flex-col items-center gap-6 w-full"
              style={{
                filter: isLocked ? 'blur(8px)' : 'none',
                opacity: isLocked ? 0.35 : 1,
                userSelect: isLocked ? 'none' : 'auto',
                pointerEvents: isLocked ? 'none' : 'auto',
                transition: 'filter 0.4s ease, opacity 0.4s ease',
              }}
            >
              {/* Closing Description Paragraph */}
              <motion.p variants={itemVariants} className="font-sans font-light text-sm md:text-base text-text-muted max-w-[400px] leading-relaxed whitespace-pre-line">
                {closingParagraph || 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.'}
              </motion.p>

              {/* Sender Signature — BELOW Paragraph (Correct Order!) */}
              {sender && (
                <motion.p variants={itemVariants} className="font-serif italic text-base md:text-lg text-text-muted mt-1">
                  — {sender}
                </motion.p>
              )}

              <motion.div variants={itemVariants}><GlowHeart /></motion.div>

              {/* Celebrate button */}
              <motion.div variants={itemVariants} className="relative mt-2">
                <Confetti active={celebrating} key={celebrateCount} />
                <motion.button
                  onClick={handleCelebrate}
                  disabled={celebrating || isLocked}
                  className="relative font-serif italic text-base md:text-lg px-8 py-3 rounded-full border border-accent/40 text-text overflow-hidden disabled:opacity-60"
                  style={{ background: 'rgba(225, 29, 72, 0.1)', boxShadow: '0 0 24px rgba(225,29,72,0.2)' }}
                  whileHover={isLocked ? {} : { scale: 1.05, boxShadow: '0 0 40px rgba(225,29,72,0.45)' }}
                  whileTap={isLocked ? {} : { scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10">{celebrating ? 'celebrating...' : (celebrateBtnText || 'celebrate our love ✨')}</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Lock Overlay */}
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-4"
              >
                <div
                  style={{
                    background: 'rgba(10, 6, 12, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(225, 29, 72, 0.25)',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    maxWidth: '270px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center mb-2"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(225,29,72,0.85)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </motion.div>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.75)',
                      lineHeight: 1.4,
                      marginBottom: '4px',
                    }}
                  >
                    Kejutan akhir tersembunyi
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans, sans-serif)',
                      fontSize: '0.68rem',
                      color: 'rgba(225, 29, 72, 0.8)',
                    }}
                  >
                    Hubungi admin untuk unlock kado
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Re-open cinema hint after first view */}
          {!isLocked && secretPhoto && celebrateCount > 0 && !celebrating && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setShowCinema(true);
                if (onCinemaToggle) onCinemaToggle(true);
              }}
              className="font-sans text-xs text-text-muted/40 hover:text-text-muted/70 transition-colors underline underline-offset-4"
            >
              view secret memory again
            </motion.button>
          )}
        </motion.div>
        <div className="h-28" />
      </section>

      {/* Cinema Modal — rendered outside the section for full-screen */}
      {showCinema && !isLocked && (
        <CinemaModal
          secretPhoto={secretPhoto}
          secretCaption={secretCaption}
          secretVideoMuted={secretVideoMuted}
          onClose={() => {
            setShowCinema(false);
            if (onCinemaToggle) onCinemaToggle(false);
          }}
        />
      )}
    </>
  );
}
