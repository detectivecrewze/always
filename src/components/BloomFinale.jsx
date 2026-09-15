'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBloomFlowerSources } from '@/lib/bloomFlowers';
import { getSecretMediaType } from '@/lib/secretMedia';

const CURTAIN_CLOSE_MS = 3200;
const CURTAIN_REVEAL_MS = 3800;
const CURTAIN_SETTLE_MS = 4800;

const GARDEN_LAYOUT = [
  ...['left', 'right'].flatMap((side) =>
    Array.from({ length: 30 }, (_, index) => {
      const column = index % 6;
      const row = Math.floor(index / 6);
      const baseLeft = side === 'left' ? -5 + column * 11 : 50 + column * 11;
      return {
        id: `${side}-${row}-${column}`,
        side,
        left: baseLeft + (row % 2 === 0 ? 0 : 2.8),
        top: -9 + row * 21 + (column % 2 === 0 ? 0 : 4),
        size: 0.82 + ((index * 7 + (side === 'right' ? 3 : 0)) % 8) * 0.065,
        delay: 0.08 + row * 0.2 + column * 0.1 + (side === 'right' ? 0.12 : 0),
        rotate: -32 + ((index * 47 + (side === 'right' ? 19 : 0)) % 76),
      };
    })
  ),
];

const PETALS = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 17) % 84),
  delay: index * 0.7,
  duration: 7 + (index % 4) * 0.85,
  drift: index % 2 === 0 ? 34 : -30,
  size: 7 + (index % 3) * 2,
}));

function GardenFlower({ flower, src, index, settled, reducedMotion }) {
  const drifting = index % 4 === 0;
  const startX = flower.side === 'left' ? -110 - (index % 3) * 25 : 110 + (index % 3) * 25;
  const curveX = flower.side === 'left' ? 18 + (index % 4) * 7 : -18 - (index % 4) * 7;
  const startY = 95 + (index % 5) * 20;

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${flower.left}%`,
        top: `${flower.top}%`,
        width: `calc(clamp(104px, 19vmax, 230px) * ${flower.size})`,
        aspectRatio: '1',
        zIndex: index % 7 === 0 ? 3 : 1,
        transformOrigin: '50% 88%',
        willChange: settled && !drifting ? 'auto' : 'transform, opacity',
      }}
      initial={reducedMotion ? false : {
        opacity: 0,
        scale: 0.04,
        x: startX,
        y: startY,
        rotate: flower.rotate + (flower.side === 'left' ? -65 : 65),
      }}
      animate={{
        opacity: 1,
        scale: reducedMotion ? 1 : [0.04, 1.16, 1],
        x: reducedMotion ? 0 : [startX, curveX, 0],
        y: reducedMotion ? 0 : [startY, -14 - (index % 3) * 5, 0],
        rotate: reducedMotion ? flower.rotate : [
          flower.rotate + (flower.side === 'left' ? -65 : 65),
          flower.rotate + (flower.side === 'left' ? 16 : -16),
          flower.rotate,
        ],
      }}
      transition={{
        duration: reducedMotion ? 0 : 1.3,
        delay: reducedMotion ? 0 : flower.delay,
        times: [0, 0.72, 1],
        ease: [0.16, 0.78, 0.22, 1],
      }}
    >
      <motion.img
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
        animate={settled && drifting && !reducedMotion ? {
          y: [0, -7, 0],
          rotate: [0, index % 2 === 0 ? 5 : -5, 0],
          scale: [1, 1.025, 1],
        } : {}}
        transition={settled && drifting && !reducedMotion ? {
          duration: 5.2 + (index % 4) * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      />
    </motion.div>
  );
}

function FloatingPetals({ active, reducedMotion }) {
  if (!active || reducedMotion) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden="true">
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
  const [phase, setPhase] = useState('growing');
  const [mediaFailed, setMediaFailed] = useState(false);
  const closeButtonRef = useRef(null);
  const flowerSources = useMemo(() => getBloomFlowerSources(themeName), [themeName]);
  const mediaUrl = typeof secretPhoto === 'string' ? secretPhoto.trim() : '';
  const mediaType = getSecretMediaType(mediaUrl);
  const reducedMotion = useReducedMotion();
  const showCard = phase === 'revealing' || phase === 'revealed';
  const settled = phase === 'revealed';

  useEffect(() => {
    if (reducedMotion) {
      setPhase('revealed');
      return undefined;
    }
    const timers = [
      window.setTimeout(() => setPhase('closing'), CURTAIN_CLOSE_MS),
      window.setTimeout(() => setPhase('revealing'), CURTAIN_REVEAL_MS),
      window.setTimeout(() => setPhase('revealed'), CURTAIN_SETTLE_MS),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
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

  const curtainOffset = (side) => {
    if (phase === 'closing') return side === 'left' ? '5vw' : '-5vw';
    if (showCard) return side === 'left' ? '-30vw' : '30vw';
    return '0vw';
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
    >
      <motion.div
        className="absolute inset-[-40vmax] rounded-full bg-bg"
        style={{ transformOrigin: '50% 74%', willChange: 'transform, border-radius' }}
        initial={reducedMotion ? false : { scale: 0.025, borderRadius: '50%' }}
        animate={{ scale: 1, borderRadius: '0%' }}
        transition={{ duration: reducedMotion ? 0 : 1.45, ease: [0.2, 0.72, 0.2, 1] }}
      />

      <div className="absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
        {['left', 'right'].map((side) => (
          <motion.div
            key={side}
            className="absolute inset-0"
            animate={{ x: curtainOffset(side), scale: phase === 'closing' ? 1.045 : 1 }}
            transition={{
              duration: reducedMotion ? 0 : phase === 'closing' ? 0.6 : showCard ? 1 : 0.25,
              ease: phase === 'closing' ? [0.45, 0, 0.3, 1] : [0.2, 0.75, 0.2, 1],
            }}
          >
            {GARDEN_LAYOUT.filter((flower) => flower.side === side).map((flower) => {
              const index = GARDEN_LAYOUT.findIndex((item) => item.id === flower.id);
              return (
                <GardenFlower
                  key={flower.id}
                  flower={flower}
                  index={index}
                  src={flowerSources[index % flowerSources.length]}
                  settled={settled}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </motion.div>
        ))}
      </div>

      <FloatingPetals active={showCard} reducedMotion={reducedMotion} />

      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 38, scale: 0.94 }}
        animate={showCard ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 38, scale: 0.94 }}
        transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.22, 0.75, 0.24, 1] }}
        style={{ pointerEvents: showCard ? 'auto' : 'none' }}
      >
        <article
          className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] border border-accent/40 bg-surface text-text shadow-2xl"
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
        {settled ? 'Kartu penutup telah terbuka.' : showCard ? 'Tirai bunga sedang terbuka.' : 'Taman bunga sedang tumbuh.'}
      </p>
    </div>
  );
}
