'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildBloomFlowers } from '@/lib/bloomFlowers';
import { getSecretMediaType } from '@/lib/secretMedia';

const BLOOM_DURATION_MS = 3800;
const CURTAIN_DURATION_MS = 1200;

const PETALS = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: 6 + ((index * 17) % 88),
  delay: index * 0.45,
  duration: 6.5 + (index % 4) * 0.8,
  drift: index % 2 === 0 ? 32 : -28,
  size: 8 + (index % 3) * 3,
}));

function FloatingPetals({ active, reducedMotion }) {
  if (!active || reducedMotion) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {PETALS.map((petal) => (
        <motion.span
          key={petal.id}
          className="absolute block bg-accent/55"
          style={{
            left: `${petal.left}%`,
            top: '-4%',
            width: petal.size,
            height: petal.size * 1.55,
            borderRadius: '75% 15% 70% 25%',
          }}
          animate={{
            x: [0, petal.drift, petal.drift * -0.3, petal.drift * 0.8],
            y: ['-8vh', '112vh'],
            rotate: [0, 190, 410],
            opacity: [0, 0.75, 0.6, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

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
  const [phase, setPhase] = useState('bloom'); // 'bloom' | 'curtain' | 'settled'
  const [mediaFailed, setMediaFailed] = useState(false);
  const closeButtonRef = useRef(null);
  const bloomFlowers = useMemo(() => buildBloomFlowers(themeName), [themeName]);
  const mediaUrl = typeof secretPhoto === 'string' ? secretPhoto.trim() : '';
  const mediaType = getSecretMediaType(mediaUrl);
  const reducedMotion = useReducedMotion();

  const isCurtainOrSettled = phase === 'curtain' || phase === 'settled';
  const showCard = isCurtainOrSettled;
  const settled = phase === 'settled';

  useEffect(() => {
    if (reducedMotion) {
      setPhase('settled');
      return undefined;
    }

    const timer1 = window.setTimeout(() => {
      setPhase('curtain');
    }, BLOOM_DURATION_MS);

    const timer2 = window.setTimeout(() => {
      setPhase('settled');
    }, BLOOM_DURATION_MS + CURTAIN_DURATION_MS);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      if (onCinemaToggle) onCinemaToggle(false);
    };
  }, [onCinemaToggle]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!settled) return undefined;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [settled]);

  const handleVideoAudio = (active) => {
    if (!secretVideoMuted && onCinemaToggle) onCinemaToggle(active);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
    >
      {/* ── Background reveal: circular expansion from button position ── */}
      <motion.div
        className="pointer-events-none absolute inset-[-40vmax] rounded-full z-0"
        style={{
          background: 'var(--color-bg)',
          transformOrigin: '50% 75%',
          willChange: 'transform',
        }}
        initial={reducedMotion ? false : { scale: 0.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ── Background Curtain Panels: split left & right when curtain parts ── */}
      {['left', 'right'].map((side) => (
        <motion.div
          key={side}
          className="pointer-events-none absolute inset-y-0 z-[1]"
          style={{
            [side]: 0,
            width: 'calc(50% + 1px)',
            background: 'var(--color-bg)',
            willChange: isCurtainOrSettled ? 'transform' : 'auto',
          }}
          animate={{ x: isCurtainOrSettled ? (side === 'left' ? '-100%' : '100%') : '0%' }}
          transition={{ duration: CURTAIN_DURATION_MS / 1000, ease: [0.32, 0, 0.2, 1] }}
        />
      ))}

      {/* ── Dynamic Radial Bloom: concentric rotating flowers from center ── */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2]"
        style={{
          width: '115vmax',
          height: '115vmax',
          marginLeft: '-57.5vmax',
          marginTop: '-57.5vmax',
          willChange: 'transform, opacity',
        }}
        initial={{ scale: 0.09 }}
        animate={isCurtainOrSettled
          ? { scale: 1 }
          : { scale: [0.09, 0.28, 0.58, 1] }}
        transition={{
          duration: BLOOM_DURATION_MS / 1000,
          times: [0, 0.26, 0.56, 1],
          ease: [0.18, 0.7, 0.2, 1],
        }}
      >
        {['left', 'right'].map((side) => (
          <motion.div
            key={side}
            className="absolute inset-0"
            animate={{ x: isCurtainOrSettled ? (side === 'left' ? '-100vw' : '100vw') : '0vw' }}
            transition={{ duration: CURTAIN_DURATION_MS / 1000, ease: [0.32, 0, 0.2, 1] }}
          >
            {bloomFlowers
              .filter((flower) => (side === 'left' ? flower.x < 0 : flower.x >= 0))
              .map((flower) => (
                <motion.div
                  key={flower.id}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${flower.size}%`,
                    height: `${flower.size}%`,
                    marginLeft: `-${flower.size / 2}%`,
                    marginTop: `-${flower.size / 2}%`,
                  }}
                  initial={{ x: 0, y: 0, scale: 0.04, opacity: 0 }}
                  animate={{
                    x: `${flower.x}vmax`,
                    y: `${flower.y}vmax`,
                    scale: [0.04, 1.18, 1],
                    opacity: [0, 1, 1],
                  }}
                  transition={{
                    duration: 1.25,
                    delay: flower.delay * 0.75,
                    times: [0, 0.72, 1],
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                >
                  <div
                    className="memoria-flower-spin h-full w-full"
                    style={{
                      backgroundImage: `url("${flower.src}")`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      '--flower-angle': `${flower.rotate}deg`,
                      '--flower-turn': flower.spinDirection,
                      '--flower-spin-duration': `${flower.spinDuration}s`,
                    }}
                  />
                </motion.div>
              ))}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Ambient Petals: gentle floating drift once curtain opens ── */}
      <FloatingPetals active={showCard} reducedMotion={reducedMotion} />

      {/* ── Finale Memory Card: revealed cleanly in the center ── */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 32, scale: 0.94 }}
        animate={showCard ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.94 }}
        transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.22, 0.75, 0.24, 1] }}
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
                      autoPlay
                      controls
                      playsInline
                      muted={secretVideoMuted}
                      preload="metadata"
                      onPlay={() => handleVideoAudio(true)}
                      onPause={() => handleVideoAudio(false)}
                      onEnded={() => handleVideoAudio(false)}
                      onError={() => {
                        setMediaFailed(true);
                        handleVideoAudio(false);
                      }}
                    />
                  )}
                  {!mediaFailed && mediaType === 'image' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt="Secret memory"
                      className="max-h-[58dvh] w-full object-contain"
                      onError={() => setMediaFailed(true)}
                    />
                  )}
                  {(mediaFailed || mediaType === 'link') && (
                    <div className="flex min-h-[220px] w-full flex-col items-center justify-center px-6 py-8">
                      <span className="mb-3 text-3xl" aria-hidden="true">✦</span>
                      <p className="font-serif text-lg text-text">
                        {mediaFailed ? 'Media belum dapat ditampilkan.' : 'Ada tautan spesial untukmu.'}
                      </p>
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-11 items-center rounded-full border border-accent/40 px-5 font-sans text-xs font-semibold uppercase tracking-widest text-text"
                      >
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
        {settled ? 'Kartu penutup telah terbuka.' : showCard ? 'Tirai bunga sedang terbuka.' : 'Bunga mekar sedang berlangsung.'}
      </p>
    </div>
  );
}
