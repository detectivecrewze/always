'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const BloomFinale = dynamic(() => import('@/components/BloomFinale'), {
  ssr: false,
  loading: () => null,
});

function GlowHeart() {
  return (
    <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <svg width="64" height="64" viewBox="0 0 120 120" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="closingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="closingGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-particle)" /><stop offset="0.5" stopColor="var(--color-accent)" /><stop offset="1" stopColor="var(--color-text-muted)" />
          </linearGradient>
        </defs>
        <g filter="url(#closingGlow)">
          <path d="M60 85 C60 85, 25 55, 25 35 C25 20, 45 15, 60 30 C75 15, 95 20, 95 35 C95 55, 60 85, 60 85 Z"
            stroke="var(--color-particle)" strokeWidth="2.5" fill="var(--color-accent)" fillOpacity="0.15" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  );
}

const flowerColors = ['var(--color-accent)', 'var(--color-particle)', 'var(--color-text-muted)', 'var(--color-accent)', 'var(--color-particle)'];
function FloatingFlowers() {
  return (
    <div className="mb-4 flex justify-center gap-3">
      {flowerColors.map((color, index) => (
        <motion.svg key={index} width="28" height="28" viewBox="0 0 24 24" fill={color}
          animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.5, delay: index * 0.15, repeat: Infinity, ease: 'easeInOut' }}>
          <circle cx="12" cy="6" r="3.5" /><circle cx="17.6" cy="9.5" r="3.5" />
          <circle cx="15.5" cy="16" r="3.5" /><circle cx="8.5" cy="16" r="3.5" />
          <circle cx="6.4" cy="9.5" r="3.5" /><circle cx="12" cy="12" r="3" fill="#FFF8" />
        </motion.svg>
      ))}
    </div>
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
  finaleTitle,
  finaleMessage,
  finaleSignoff,
  themeName,
  onCinemaToggle,
  isLocked,
}) {
  const [showFinale, setShowFinale] = useState(false);
  const [finaleCount, setFinaleCount] = useState(0);
  const triggerButtonRef = useRef(null);

  const resolvedFinaleTitle = finaleTitle?.trim()
    || [closingTitle1, closingTitle2].filter(Boolean).join(' ')
    || 'You Are Loved Beyond Words';
  const resolvedFinaleMessage = finaleMessage?.trim()
    || closingParagraph
    || 'May this little garden keep blooming for you, always.';
  const resolvedFinaleSignoff = finaleSignoff?.trim() || (closingLine?.trim() ?? '') || '';

  const handleCelebrate = useCallback(() => {
    if (isLocked || showFinale) return;
    setFinaleCount((count) => count + 1);
    setShowFinale(true);
  }, [isLocked, showFinale]);

  const handleCloseFinale = useCallback(() => {
    setShowFinale(false);
  }, []);

  useEffect(() => {
    if (showFinale || finaleCount === 0) return undefined;
    const frame = window.requestAnimationFrame(() => {
      triggerButtonRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showFinale, finaleCount]);

  return (
    <>
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <motion.div
          className="relative flex w-full max-w-[560px] flex-col items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}><FloatingFlowers /></motion.div>

          <motion.span variants={itemVariants} className="font-serif text-sm italic lowercase tracking-widest text-text-muted md:text-base">
            {closingPreTitle || 'always & forever'}
          </motion.span>

          <motion.h2 variants={itemVariants} className="flex flex-col gap-1 md:gap-2">
            <span className="block font-serif text-4xl leading-tight text-text md:text-5xl lg:text-6xl">{closingTitle1 || 'You Are Loved'}</span>
            <span className="block font-serif text-5xl italic leading-tight text-accent md:text-6xl lg:text-7xl">{closingTitle2 || 'Beyond Words'}</span>
          </motion.h2>

          <div className="relative mt-2 flex w-full flex-col items-center gap-6">
            <div
              className="flex w-full flex-col items-center gap-6"
              style={{
                filter: isLocked ? 'blur(8px)' : 'none',
                opacity: isLocked ? 0.35 : 1,
                userSelect: isLocked ? 'none' : 'auto',
                pointerEvents: isLocked ? 'none' : 'auto',
                transition: 'filter 0.4s ease, opacity 0.4s ease',
              }}
            >
              <motion.p variants={itemVariants} className="max-w-[400px] whitespace-pre-line font-sans text-sm font-light leading-relaxed text-text-muted md:text-base">
                {closingParagraph || 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.'}
              </motion.p>

              {sender && (
                <motion.p variants={itemVariants} className="mt-1 font-serif text-base italic text-text-muted md:text-lg">
                  — {sender}
                </motion.p>
              )}

              <motion.div variants={itemVariants}><GlowHeart /></motion.div>

              <motion.div variants={itemVariants} className="relative mt-2">
                <motion.button
                  ref={triggerButtonRef}
                  type="button"
                  onClick={handleCelebrate}
                  disabled={showFinale || isLocked}
                  className="relative overflow-hidden rounded-full border border-accent/40 px-8 py-3 font-serif text-base italic text-text disabled:opacity-60 md:text-lg"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', boxShadow: '0 0 24px color-mix(in srgb, var(--color-accent) 20%, transparent)' }}
                  whileHover={isLocked ? {} : { scale: 1.05 }}
                  whileTap={isLocked ? {} : { scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10">{showFinale ? 'opening the final bloom...' : (celebrateBtnText || 'celebrate our love ✨')}</span>
                </motion.button>
              </motion.div>
            </div>

            {isLocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center p-4"
              >
                <div className="max-w-[270px] rounded-2xl border border-accent/25 bg-black/75 px-6 py-[18px] text-center shadow-2xl backdrop-blur-xl">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="mb-2 flex justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </motion.div>
                  <p className="mb-1 font-serif text-[0.8rem] italic leading-snug text-white/75">Kejutan akhir tersembunyi</p>
                  <p className="font-sans text-[0.68rem] text-accent/80">Hubungi admin untuk unlock kado</p>
                </div>
              </motion.div>
            )}
          </div>

          {!isLocked && secretPhoto && finaleCount > 0 && !showFinale && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleCelebrate}
              className="font-sans text-xs text-text-muted/50 underline underline-offset-4 transition-colors hover:text-text-muted/80"
            >
              view the final bloom again
            </motion.button>
          )}
        </motion.div>
        <div className="h-28" />
      </section>

      {showFinale && !isLocked && (
        <BloomFinale
          key={finaleCount}
          themeName={themeName}
          secretPhoto={secretPhoto}
          secretCaption={secretCaption}
          secretVideoMuted={secretVideoMuted}
          finaleTitle={resolvedFinaleTitle}
          finaleMessage={resolvedFinaleMessage}
          finaleSignoff={resolvedFinaleSignoff}
          sender={sender}
          onClose={handleCloseFinale}
          onCinemaToggle={onCinemaToggle}
        />
      )}
    </>
  );
}
