'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBloomFlowerSources } from '@/lib/bloomFlowers';
import { getSecretMediaType } from '@/lib/secretMedia';

// ─── Timing ──────────────────────────────────────────────────────────────────
const BLOOM_PEAK_MS = 2000;
const CARD_RISE_MS  = 2300;
const SETTLE_MS     = 3500;

// ─── Garden layout: perfectly mirrored wings ─────────────────────────────────
const GARDEN_LAYOUT = [
  ...['left', 'right'].flatMap((side) =>
    Array.from({ length: 30 }, (_, index) => {
      const column = index % 6;
      const row    = Math.floor(index / 6);
      const edgePos = -5 + column * 11;
      const colFromCenter = 5 - column;
      const rowFromCenter = Math.abs(row - 2);
      return {
        id: `${side}-${row}-${column}`,
        side,
        edgePos: edgePos + (row % 2 === 0 ? 0 : 2.5),
        top:     -8 + row * 21.5 + (column % 2 === 0 ? 0 : 3.5),
        size:    0.92 + ((index * 7) % 8) * 0.06,
        delay:   0.03 + colFromCenter * 0.11 + rowFromCenter * 0.07,
        rotate:  (index * 47 + (side === 'right' ? 23 : 0)) % 360,
        spinDuration:  18 + ((index * 7) % 14) * 1.1,
        spinDirection: (index + (side === 'right' ? 1 : 0)) % 2 === 0 ? '360deg' : '-360deg',
      };
    })
  ),
];

const PETALS = Array.from({ length: 9 }, (_, i) => ({
  id: i, left: 6 + ((i * 19) % 88),
  delay: i * 0.65, duration: 7 + (i % 4) * 0.8,
  drift: i % 2 === 0 ? 32 : -28, size: 7 + (i % 3) * 2.5,
}));

function GardenFlower({ flower, src, reducedMotion }) {
  const posStyle = flower.side === 'left'
    ? { left: `${flower.edgePos}%` }
    : { right: `${flower.edgePos}%` };
  return (
    <motion.div
      className="pointer-events-none absolute select-none"
      style={{ ...posStyle, top: `${flower.top}%`, width: `calc(clamp(120px, 21vmax, 260px) * ${flower.size})`, aspectRatio: '1', transformOrigin: '50% 50%' }}
      initial={reducedMotion ? false : { scale: 0.04, opacity: 0 }}
      animate={{ scale: reducedMotion ? 1 : [0.04, 1.18, 1], opacity: [0, 1, 1] }}
      transition={{ duration: reducedMotion ? 0 : 1.25, delay: reducedMotion ? 0 : flower.delay, times: [0, 0.68, 1], ease: [0.2, 0.72, 0.2, 1] }}
    >
      <div
        className="memoria-flower-spin h-full w-full"
        style={{
          backgroundImage: `url("${src}")`, backgroundSize: 'contain',
          backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          '--flower-angle': `${flower.rotate}deg`,
          '--flower-turn': flower.spinDirection,
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
        <motion.span key={p.id} className="absolute block bg-accent/55"
          style={{ left: `${p.left}%`, top: '-4%', width: p.size, height: p.size * 1.55, borderRadius: '75% 15% 70% 25%' }}
          animate={{ x: [0, p.drift, p.drift * -0.3, p.drift * 0.8], y: ['-8vh', '112vh'], rotate: [0, 190, 410], opacity: [0, 0.75, 0.6, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// ─── Ornamental divider ───────────────────────────────────────────────────────
function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-4" aria-hidden="true">
      <div style={{ height: '1px', width: 36, background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-accent) 55%, transparent))' }} />
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
        <path d="M12 2 L13.8 8.5 L20 7 L14.5 11.5 L20 16 L13.8 14.5 L12 21 L10.2 14.5 L4 16 L9.5 11.5 L4 7 L10.2 8.5 Z" fill="currentColor"/>
      </svg>
      <div style={{ height: '1px', width: 36, background: 'linear-gradient(to left, transparent, color-mix(in srgb, var(--color-accent) 55%, transparent))' }} />
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
  const [phase, setPhase]             = useState('blooming');
  const [showCard, setShowCard]       = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const closeButtonRef  = useRef(null);
  const cinemaToggleRef = useRef(onCinemaToggle);
  const reducedMotion   = useReducedMotion();
  const flowerSources   = useMemo(() => getBloomFlowerSources(themeName), [themeName]);
  const mediaUrl        = typeof secretPhoto === 'string' ? secretPhoto.trim() : '';
  const mediaType       = getSecretMediaType(mediaUrl);
  const isCurtainOpen   = phase === 'curtain' || phase === 'settled';
  const curtainX        = (side) => isCurtainOpen ? (side === 'left' ? '-30vw' : '30vw') : '0vw';

  useEffect(() => {
    cinemaToggleRef.current = onCinemaToggle;
  }, [onCinemaToggle]);

  useEffect(() => {
    flowerSources.forEach((src) => { const img = new window.Image(); img.src = src; });
  }, [flowerSources]);

  useEffect(() => {
    if (reducedMotion) { setPhase('settled'); setShowCard(true); return undefined; }
    const t1 = window.setTimeout(() => setPhase('curtain'), BLOOM_PEAK_MS);
    const t2 = window.setTimeout(() => setShowCard(true),   CARD_RISE_MS);
    const t3 = window.setTimeout(() => setPhase('settled'), SETTLE_MS);
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
      cinemaToggleRef.current?.(false);
    };
  }, []);

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

  const handleVideoAudio = (active) => { if (!secretVideoMuted) cinemaToggleRef.current?.(active); };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden select-none" role="dialog" aria-modal="true" aria-labelledby="finale-title">
      {/* ── Stage backdrop ── */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: 'var(--color-bg)' }} />

      {/* ── Left floral wing ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true"
        animate={{ x: curtainX('left') }}
        transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {GARDEN_LAYOUT.filter((f) => f.side === 'left').map((flower) => {
          const idx = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
          return <GardenFlower key={flower.id} flower={flower} src={flowerSources[idx % flowerSources.length]} reducedMotion={reducedMotion} />;
        })}
      </motion.div>

      {/* ── Right floral wing ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true"
        animate={{ x: curtainX('right') }}
        transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {GARDEN_LAYOUT.filter((f) => f.side === 'right').map((flower) => {
          const idx = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
          return <GardenFlower key={flower.id} flower={flower} src={flowerSources[idx % flowerSources.length]} reducedMotion={reducedMotion} />;
        })}
      </motion.div>

      {/* ── Theatrical vignette: dark oval behind card for separation from flowers ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{ background: 'radial-gradient(ellipse 54% 78% at 50% 50%, transparent 18%, rgba(0,0,0,0.52) 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showCard ? 1 : 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        aria-hidden="true"
      />

      {/* ── Floating petals ── */}
      <FloatingPetals active={showCard} reducedMotion={reducedMotion} />

      {/* ── Memory Card ── */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 44, scale: 0.92 }}
        animate={showCard ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 44, scale: 0.92 }}
        transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: showCard ? 'auto' : 'none' }}
      >
        <article
          className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden"
          style={{
            borderRadius: 20,
            background: 'color-mix(in srgb, var(--color-surface) 92%, var(--color-bg))',
            backgroundImage: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, transparent 50%), repeating-linear-gradient(0deg, rgba(53,40,35,0.022) 0 1px, transparent 1px 5px)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 28%, transparent)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.14) inset, 0 32px 80px rgba(0,0,0,0.38), 0 0 60px color-mix(in srgb, var(--color-accent) 10%, transparent)',
          }}
        >
          {/* Close button — top right, frosted */}
          <button
            ref={closeButtonRef} type="button" onClick={onClose}
            className="absolute right-3 top-3 z-30 flex min-h-11 min-w-11 items-center justify-center transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-4 sm:top-4"
            style={{
              borderRadius: '50%',
              background: 'rgba(15,12,10,0.62)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Tutup ending"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="overflow-y-auto overscroll-contain px-6 pb-6 pt-12 text-center sm:px-8 sm:pb-7 sm:pt-10">

            {/* ── Header: ornament label ── */}
            <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
              <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-accent)', opacity: 0.6 }}>✦</span>
              <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font-sans, sans-serif)' }}>
                a final bloom
              </p>
              <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-accent)', opacity: 0.6 }}>✦</span>
            </div>

            {/* ── Title ── */}
            <h2
              id="finale-title"
              className="mx-auto break-words leading-tight"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.25rem)', color: 'var(--color-text)', maxWidth: 460 }}
            >
              {finaleTitle}
            </h2>

            {/* ── Ornamental divider ── */}
            <OrnamentDivider />

            {/* ── Media or message ── */}
            {showCard && mediaUrl ? (
              <div>
                <div
                  className="relative mx-auto flex max-h-[52dvh] min-h-[160px] w-full items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: 12,
                    border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
                    boxShadow: 'inset 0 0 0 3px color-mix(in srgb, var(--color-bg) 80%, transparent), 0 8px 28px rgba(0,0,0,0.22)',
                    background: 'color-mix(in srgb, var(--color-bg) 60%, transparent)',
                  }}
                >
                  {!mediaFailed && mediaType === 'video' && (
                    <video
                      src={mediaUrl} className="max-h-[52dvh] w-full object-contain"
                      autoPlay controls playsInline muted={secretVideoMuted} preload="metadata"
                      onPlay={() => handleVideoAudio(true)}
                      onError={() => setMediaFailed(true)}
                    />
                  )}
                  {!mediaFailed && mediaType === 'image' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt="Secret memory" className="max-h-[52dvh] w-full object-contain" onError={() => setMediaFailed(true)} />
                  )}
                  {(mediaFailed || mediaType === 'link') && (
                    <div className="flex min-h-[200px] w-full flex-col items-center justify-center px-6 py-8">
                      <span className="mb-3 text-3xl" aria-hidden="true">✦</span>
                      <p style={{ fontFamily: 'var(--font-serif, serif)', color: 'var(--color-text)' }}>
                        {mediaFailed ? 'Media belum dapat ditampilkan.' : 'Ada tautan spesial untukmu.'}
                      </p>
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-11 items-center px-5"
                        style={{ borderRadius: 999, border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)', fontFamily: 'var(--font-sans, sans-serif)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text)' }}
                      >
                        Buka tautan
                      </a>
                    </div>
                  )}
                </div>
                {secretCaption && (
                  <p className="mx-auto mt-4 max-w-sm whitespace-pre-line break-words italic leading-relaxed"
                    style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', color: 'var(--color-text-muted)' }}>
                    {secretCaption}
                  </p>
                )}
              </div>
            ) : (
              <p className="mx-auto max-h-[40dvh] overflow-y-auto whitespace-pre-line break-words px-1 leading-7"
                style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: 'clamp(0.8125rem, 2vw, 0.9375rem)', fontWeight: 300, color: 'var(--color-text-muted)', maxWidth: 420 }}>
                {finaleMessage}
              </p>
            )}

            {/* ── Signature ── */}
            {(finaleSignoff || sender) && (
              <div className="mt-5">
                <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
                  <div style={{ height: '1px', flex: 1, maxWidth: 52, background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-accent) 35%, transparent))' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 50%, transparent)' }} />
                  <div style={{ height: '1px', flex: 1, maxWidth: 52, background: 'linear-gradient(to left, transparent, color-mix(in srgb, var(--color-accent) 35%, transparent))' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-serif, serif)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                  {finaleSignoff && <p className="whitespace-pre-line break-words text-sm sm:text-base">{finaleSignoff}</p>}
                  {sender && <p className="mt-1 break-words text-lg sm:text-xl" style={{ color: 'var(--color-accent)' }}>&#8212; {sender}</p>}
                </div>
              </div>
            )}

            {/* ── CTA Button ── */}
            <div className="mt-6 mb-1">
              <button
                type="button" onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center px-7 transition-transform hover:scale-[1.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={{
                  borderRadius: 999,
                  background: 'transparent',
                  border: '1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                &#8592;&ensp;kembali ke kado
              </button>
            </div>
          </div>
        </article>
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {phase === 'settled' ? 'Kartu penutup telah terbuka.' : showCard ? 'Tirai bunga sedang terbuka.' : 'Bunga sedang mekar.'}
      </p>
    </div>
  );
}
