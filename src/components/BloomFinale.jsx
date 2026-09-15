'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBloomFlowerSources } from '@/lib/bloomFlowers';
import { getSecretMediaType } from '@/lib/secretMedia';

// ─── Timing ──────────────────────────────────────────────────────────────────
const BLOOM_PEAK_MS   = 1900;  // All flowers are on screen; curtain begins parting
const CARD_RISE_MS    = 2200;  // Card starts rising into the parting gap
const SETTLE_MS       = 3400;  // Curtain fully settled at 30vw offset; wings framing card

// ─── 60-flower dual-wing garden (30 per side) ────────────────────────────────
// Columns: left wing 0-55% | right wing 50-106%
// Row stagger and center-first bloom delay give the "ripple blossom" feel.
const GARDEN_LAYOUT = [
  ...['left', 'right'].flatMap((side) =>
    Array.from({ length: 30 }, (_, index) => {
      const column = index % 6;
      const row    = Math.floor(index / 6);

      const baseLeft =
        side === 'left'
          ? -5 + column * 11        // cols: -5% to 50%
          : 50 + column * 11;       // cols: 50% to 105%

      // Distance from center seam: closest column blooms first
      const colDistFromCenter = side === 'left' ? 5 - column : column;
      const rowDistFromCenter = Math.abs(row - 2);

      return {
        id: `${side}-${row}-${column}`,
        side,
        left:    baseLeft + (row % 2 === 0 ? 0 : 2.5),
        top:     -8 + row * 21.5 + (column % 2 === 0 ? 0 : 3.5),
        size:    0.86 + ((index * 7 + (side === 'right' ? 3 : 0)) % 8) * 0.055,
        delay:   0.04 + colDistFromCenter * 0.12 + rowDistFromCenter * 0.08,
        rotate:  -35 + ((index * 47 + (side === 'right' ? 23 : 0)) % 80),
        spinDuration:  18 + ((index * 7  + (side === 'right' ? 5  : 0)) % 14) * 1.1,
        spinDirection: (index + (side === 'right' ? 1 : 0)) % 2 === 0 ? '360deg' : '-360deg',
      };
    })
  ),
];

// ─── Ambient petals ──────────────────────────────────────────────────────────
const PETALS = Array.from({ length: 9 }, (_, i) => ({
  id:       i,
  left:     6 + ((i * 19) % 88),
  delay:    i * 0.65,
  duration: 7 + (i % 4) * 0.8,
  drift:    i % 2 === 0 ? 32 : -28,
  size:     7 + (i % 3) * 2.5,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function GardenFlower({ flower, src, index, reducedMotion }) {
  return (
    <motion.div
      className="pointer-events-none absolute select-none"
      style={{
        left:          `${flower.left}%`,
        top:           `${flower.top}%`,
        width:         `calc(clamp(115px, 20vmax, 240px) * ${flower.size})`,
        aspectRatio:   '1',
        zIndex:        index % 6 === 0 ? 3 : 1,
        transformOrigin: '50% 50%',
      }}
      initial={reducedMotion ? false : { scale: 0.04, opacity: 0 }}
      animate={{ scale: reducedMotion ? 1 : [0.04, 1.16, 1], opacity: [0, 1, 1] }}
      transition={{
        duration: reducedMotion ? 0 : 1.25,
        delay:    reducedMotion ? 0 : flower.delay,
        times:    [0, 0.68, 1],
        ease:     [0.2, 0.72, 0.2, 1],
      }}
    >
      <div
        className="memoria-flower-spin h-full w-full"
        style={{
          backgroundImage:    `url("${src}")`,
          backgroundSize:     'contain',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
          '--flower-angle':        `${flower.rotate}deg`,
          '--flower-turn':          flower.spinDirection,
          '--flower-spin-duration': `${flower.spinDuration}s`,
        }}
      />
    </motion.div>
  );
}

function FloatingPetals({ active, reducedMotion }) {
  if (!active || reducedMotion) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {PETALS.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block bg-accent/55"
          style={{ left: `${p.left}%`, top: '-4%', width: p.size, height: p.size * 1.55, borderRadius: '75% 15% 70% 25%' }}
          animate={{ x: [0, p.drift, p.drift * -0.3, p.drift * 0.8], y: ['-8vh', '112vh'], rotate: [0, 190, 410], opacity: [0, 0.75, 0.6, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BloomFinale({
  themeName,
  secretPhoto,
  secretCaption,
  secretVideoMuted,
  finaleTitle,
  finaleMessage,
  finaleSignoff,
  sender,
  onClose,
  onCinemaToggle,
}) {
  const [phase, setPhase] = useState('blooming'); // 'blooming' | 'curtain' | 'settled'
  const [showCard, setShowCard]   = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const closeButtonRef  = useRef(null);
  const reducedMotion   = useReducedMotion();
  const flowerSources   = useMemo(() => getBloomFlowerSources(themeName), [themeName]);
  const mediaUrl        = typeof secretPhoto === 'string' ? secretPhoto.trim() : '';
  const mediaType       = getSecretMediaType(mediaUrl);

  const isCurtainOpen = phase === 'curtain' || phase === 'settled';

  // Curtain travel: 30vw — flowers stay visible as framing wings on both sides
  const curtainX = (side) => isCurtainOpen ? (side === 'left' ? '-30vw' : '30vw') : '0vw';

  // ─── Preload images
  useEffect(() => {
    flowerSources.forEach((src) => { const img = new window.Image(); img.src = src; });
  }, [flowerSources]);

  // ─── Orchestrate bloom → curtain → settled
  useEffect(() => {
    if (reducedMotion) { setPhase('settled'); setShowCard(true); return undefined; }

    const t1 = window.setTimeout(() => setPhase('curtain'),        BLOOM_PEAK_MS);
    const t2 = window.setTimeout(() => setShowCard(true),          CARD_RISE_MS);
    const t3 = window.setTimeout(() => setPhase('settled'),        SETTLE_MS);

    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [reducedMotion]);

  // ─── Scroll lock & cinema cleanup
  useEffect(() => {
    const prevO  = document.body.style.overflow;
    const prevOS = document.body.style.overscrollBehavior;
    document.body.style.overflow          = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow          = prevO;
      document.body.style.overscrollBehavior = prevOS;
      if (onCinemaToggle) onCinemaToggle(false);
    };
  }, [onCinemaToggle]);

  // ─── Keyboard escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ─── Focus close button once card appears
  useEffect(() => {
    if (!showCard) return undefined;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [showCard]);

  const handleVideoAudio = (active) => { if (!secretVideoMuted && onCinemaToggle) onCinemaToggle(active); };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
    >
      {/* ── Full-screen stage backdrop ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'var(--color-bg)' }}
      />

      {/* ── Theatrical Curtain Panels + Floral Wings ── */}
      {/* z-[2] so wings sit above backdrop but behind card z-10 */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
        {['left', 'right'].map((side) => (
          <motion.div
            key={side}
            className="absolute inset-0"
            animate={{ x: curtainX(side) }}
            transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Solid curtain half-panel behind the flowers */}
            <div
              className="absolute inset-y-0"
              style={{
                [side]:    0,
                width:     'calc(50% + 2px)',
                background: 'var(--color-bg)',
                boxShadow:
                  side === 'left'
                    ? '14px 0 35px rgba(0,0,0,0.42)'
                    : '-14px 0 35px rgba(0,0,0,0.42)',
              }}
            />

            {/* 30 spinning flowers per wing */}
            {GARDEN_LAYOUT.filter((f) => f.side === side).map((flower) => {
              const index = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
              return (
                <GardenFlower
                  key={flower.id}
                  flower={flower}
                  index={index}
                  src={flowerSources[index % flowerSources.length]}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </motion.div>
        ))}
      </div>

      {/* ── Floating ambient petals ── */}
      <FloatingPetals active={showCard} reducedMotion={reducedMotion} />

      {/* ── Memory Card: rises into the curtain gap ── */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 40, scale: 0.93 }}
        animate={showCard ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.93 }}
        transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: showCard ? 'auto' : 'none' }}
      >
        <article
          className="theme-paper-card relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-[26px] border border-accent/35 bg-surface text-text shadow-2xl"
          style={{ boxShadow: '0 28px 90px color-mix(in srgb, var(--color-text) 28%, transparent)' }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-30 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-accent/35 bg-bg/85 text-text transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-4 sm:top-4"
            aria-label="Tutup ending"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="overflow-y-auto overscroll-contain px-5 pb-5 pt-16 text-center sm:px-8 sm:pb-7 sm:pt-8">
            <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
              a final bloom
            </p>
            <h2 id="finale-title" className="mx-auto max-w-[520px] break-words font-serif text-3xl leading-tight text-text sm:text-4xl">
              {finaleTitle}
            </h2>

            {showCard && mediaUrl ? (
              <div className="mt-5">
                <div className="relative mx-auto flex max-h-[58dvh] min-h-[180px] w-full items-center justify-center overflow-hidden rounded-2xl border border-accent/25 bg-bg/70 shadow-inner">
                  {!mediaFailed && mediaType === 'video' && (
                    <video
                      src={mediaUrl}
                      className="max-h-[58dvh] w-full object-contain"
                      autoPlay controls playsInline
                      muted={secretVideoMuted}
                      preload="metadata"
                      onPlay={() => handleVideoAudio(true)}
                      onPause={() => handleVideoAudio(false)}
                      onEnded={() => handleVideoAudio(false)}
                      onError={() => { setMediaFailed(true); handleVideoAudio(false); }}
                    />
                  )}
                  {!mediaFailed && mediaType === 'image' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt="Secret memory" className="max-h-[58dvh] w-full object-contain" onError={() => setMediaFailed(true)} />
                  )}
                  {(mediaFailed || mediaType === 'link') && (
                    <div className="flex min-h-[220px] w-full flex-col items-center justify-center px-6 py-8">
                      <span className="mb-3 text-3xl" aria-hidden="true">✦</span>
                      <p className="font-serif text-lg text-text">
                        {mediaFailed ? 'Media belum dapat ditampilkan.' : 'Ada tautan spesial untukmu.'}
                      </p>
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-accent/40 px-5 font-sans text-xs font-semibold uppercase tracking-widest text-text">
                        Buka tautan
                      </a>
                    </div>
                  )}
                </div>
                {secretCaption && (
                  <p className="mx-auto mt-4 max-w-md whitespace-pre-line break-words font-serif text-base italic leading-relaxed text-text-muted sm:text-lg">
                    {secretCaption}
                  </p>
                )}
              </div>
            ) : (
              <p className="mx-auto mt-5 max-h-[42dvh] max-w-lg overflow-y-auto whitespace-pre-line break-words px-1 font-sans text-sm font-light leading-7 text-text-muted sm:text-base">
                {finaleMessage}
              </p>
            )}

            <div className="mt-6 font-serif italic text-text-muted">
              {finaleSignoff && <p className="whitespace-pre-line break-words text-sm sm:text-base">{finaleSignoff}</p>}
              {sender && <p className="mt-1 break-words text-lg text-accent sm:text-xl">— {sender}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-accent/35 bg-accent/10 px-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-text transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Kembali ke kado
            </button>
          </div>
        </article>
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {phase === 'settled' ? 'Kartu penutup telah terbuka.' : showCard ? 'Tirai bunga sedang terbuka.' : 'Bunga sedang mekar.'}
      </p>
    </div>
  );
}
