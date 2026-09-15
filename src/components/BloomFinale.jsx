'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBloomFlowerSources } from '@/lib/bloomFlowers';
import { getSecretMediaType } from '@/lib/secretMedia';

// ─── Timing ──────────────────────────────────────────────────────────────────
const BLOOM_PEAK_MS = 2000;   // Flowers fully on screen
const CARD_RISE_MS  = 2300;   // Card starts appearing
const SETTLE_MS     = 3500;   // Transition complete

// ─── Garden layout: perfectly mirrored wings ─────────────────────────────────
// Left  wing: left:  -5% (outer) → left:  50% (center seam)
// Right wing: right: -5% (outer) → right: 50% (center seam)  ← mirror!
// 6 columns × 5 rows = 30 flowers per wing = 60 total
const GARDEN_LAYOUT = [
  ...['left', 'right'].flatMap((side) =>
    Array.from({ length: 30 }, (_, index) => {
      const column = index % 6;
      const row    = Math.floor(index / 6);

      // Same formula for both sides → same coverage → perfect symmetry
      const edgePos = -5 + column * 11; // -5% (outer) to 50% (center)

      // Center column (col 5, edgePos 50%) blooms FIRST — ripple out to edge
      const colFromCenter = 5 - column;  // 0 = center, 5 = outer edge
      const rowFromCenter = Math.abs(row - 2);

      return {
        id:    `${side}-${row}-${column}`,
        side,
        // Left uses CSS `left`, right uses CSS `right` — perfect mirror
        edgePos: edgePos + (row % 2 === 0 ? 0 : 2.5),
        top:     -8 + row * 21.5 + (column % 2 === 0 ? 0 : 3.5),
        size:    0.92 + ((index * 7) % 8) * 0.06,   // same for both sides
        delay:   0.03 + colFromCenter * 0.11 + rowFromCenter * 0.07,
        rotate:  (index * 47 + (side === 'right' ? 23 : 0)) % 360,
        spinDuration:  18 + ((index * 7) % 14) * 1.1,
        spinDirection: (index + (side === 'right' ? 1 : 0)) % 2 === 0 ? '360deg' : '-360deg',
      };
    })
  ),
];

// ─── Ambient petals ──────────────────────────────────────────────────────────
const PETALS = Array.from({ length: 9 }, (_, i) => ({
  id: i, left: 6 + ((i * 19) % 88),
  delay: i * 0.65, duration: 7 + (i % 4) * 0.8,
  drift: i % 2 === 0 ? 32 : -28, size: 7 + (i % 3) * 2.5,
}));

// ─── GardenFlower ─────────────────────────────────────────────────────────────
// Uses CSS `left` OR `right` based on side → guaranteed mirror symmetry
function GardenFlower({ flower, src, reducedMotion }) {
  const posStyle = flower.side === 'left'
    ? { left: `${flower.edgePos}%` }
    : { right: `${flower.edgePos}%` };

  return (
    <motion.div
      className="pointer-events-none absolute select-none"
      style={{
        ...posStyle,
        top:             `${flower.top}%`,
        width:           `calc(clamp(120px, 21vmax, 260px) * ${flower.size})`,
        aspectRatio:     '1',
        transformOrigin: '50% 50%',
      }}
      initial={reducedMotion ? false : { scale: 0.04, opacity: 0 }}
      animate={{ scale: reducedMotion ? 1 : [0.04, 1.18, 1], opacity: [0, 1, 1] }}
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
  const [phase, setPhase]         = useState('blooming');
  const [showCard, setShowCard]   = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const closeButtonRef  = useRef(null);
  const reducedMotion   = useReducedMotion();
  const flowerSources   = useMemo(() => getBloomFlowerSources(themeName), [themeName]);
  const mediaUrl        = typeof secretPhoto === 'string' ? secretPhoto.trim() : '';
  const mediaType       = getSecretMediaType(mediaUrl);

  const isCurtainOpen = phase === 'curtain' || phase === 'settled';
  // 30vw curtain travel — wings stay visible on both sides framing the card
  const curtainX = (side) => isCurtainOpen ? (side === 'left' ? '-30vw' : '30vw') : '0vw';

  useEffect(() => {
    flowerSources.forEach((src) => { const img = new window.Image(); img.src = src; });
  }, [flowerSources]);

  useEffect(() => {
    if (reducedMotion) { setPhase('settled'); setShowCard(true); return undefined; }
    const t1 = window.setTimeout(() => setPhase('curtain'),    BLOOM_PEAK_MS);
    const t2 = window.setTimeout(() => setShowCard(true),      CARD_RISE_MS);
    const t3 = window.setTimeout(() => setPhase('settled'),    SETTLE_MS);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [reducedMotion]);

  useEffect(() => {
    const prevO  = document.body.style.overflow;
    const prevOS = document.body.style.overscrollBehavior;
    document.body.style.overflow           = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow           = prevO;
      document.body.style.overscrollBehavior = prevOS;
      if (onCinemaToggle) onCinemaToggle(false);
    };
  }, [onCinemaToggle]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!showCard) return undefined;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [showCard]);

  const handleVideoAudio = (active) => { if (!secretVideoMuted && onCinemaToggle) onCinemaToggle(active); };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden select-none"
      role="dialog" aria-modal="true" aria-labelledby="finale-title"
    >
      {/* ── Solid stage backdrop ── */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: 'var(--color-bg)' }} />

      {/* ── Left wing: flowers bloom from center seam outward ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
        animate={{ x: curtainX('left') }}
        transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {GARDEN_LAYOUT.filter((f) => f.side === 'left').map((flower) => {
          const idx = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
          return (
            <GardenFlower
              key={flower.id}
              flower={flower}
              src={flowerSources[idx % flowerSources.length]}
              reducedMotion={reducedMotion}
            />
          );
        })}
      </motion.div>

      {/* ── Right wing: perfect mirror of left wing ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
        animate={{ x: curtainX('right') }}
        transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {GARDEN_LAYOUT.filter((f) => f.side === 'right').map((flower) => {
          const idx = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
          return (
            <GardenFlower
              key={flower.id}
              flower={flower}
              src={flowerSources[idx % flowerSources.length]}
              reducedMotion={reducedMotion}
            />
          );
        })}
      </motion.div>

      {/* ── Floating petals once card is visible ── */}
      <FloatingPetals active={showCard} reducedMotion={reducedMotion} />

      {/* ── Memory card rises into the opening gap ── */}
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
            ref={closeButtonRef} type="button" onClick={onClose}
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
                      src={mediaUrl} className="max-h-[58dvh] w-full object-contain"
                      autoPlay controls playsInline muted={secretVideoMuted} preload="metadata"
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
              {sender && <p className="mt-1 break-words text-lg text-accent sm:text-xl">&#8212; {sender}</p>}
            </div>

            <button
              type="button" onClick={onClose}
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
