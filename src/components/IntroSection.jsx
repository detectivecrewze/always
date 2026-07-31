'use client';

import { motion } from 'framer-motion';

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

export default function IntroSection({ 
  introIcons, 
  introPreTitle, 
  introHeadline1, 
  introHeadline2, 
  introHeadline3, 
  introText, 
  introSignOff,
  isLocked
}) {
  // Normalize introText to an array so we can map over it
  const paragraphs = Array.isArray(introText) ? introText : [introText];

  return (
    <section className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24">
      <motion.div
        className="max-w-[560px] w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Dark candlelight letter card */}
        <div
          className="relative flex flex-col items-center text-center overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '2px',
            padding: '3rem 2.5rem 3.5rem',
            border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 0 60px color-mix(in srgb, var(--color-accent) 5%, transparent)',
          }}
        >
          {/* Subtle corner accent — top left */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
            style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', borderLeft: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}
          />
          {/* Subtle corner accent — top right */}
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
            style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}
          />
          {/* Subtle corner accent — bottom left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
            style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', borderLeft: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}
          />
          {/* Subtle corner accent — bottom right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
            style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}
          />

          {/* Soft central glow for elegance */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: '80%', height: '80%', background: 'radial-gradient(ellipse, color-mix(in srgb, var(--color-accent) 4%, transparent) 0%, transparent 60%)', filter: 'blur(20px)' }}
          />

          {/* Icons & Pretitle — ALWAYS UNBLURRED & FULLY VISIBLE */}
          <motion.div variants={itemVariants} className="mb-6 relative z-10">
            {introIcons && (
              <div className="flex gap-3 justify-center mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.svg
                    key={i}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="var(--color-accent)"/>
                  </motion.svg>
                ))}
              </div>
            )}
            {introPreTitle && (
              <span
                className="font-serif italic text-sm tracking-widest lowercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {introPreTitle}
              </span>
            )}
          </motion.div>

          {/* 3-line Headline — ALWAYS UNBLURRED & FULLY VISIBLE */}
          {(introHeadline1 || introHeadline2 || introHeadline3) && (
            <motion.h2 variants={itemVariants} className="relative z-10 flex flex-col gap-2 md:gap-3 mb-10">
              {introHeadline1 && (
                <span
                  className="block font-serif text-3xl md:text-4xl lg:text-5xl leading-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  {introHeadline1}
                </span>
              )}
              {introHeadline2 && (
                <span
                  className="block font-serif italic text-4xl md:text-5xl lg:text-6xl leading-tight"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {introHeadline2}
                </span>
              )}
              {introHeadline3 && (
                <span
                  className="block font-serif text-3xl md:text-4xl lg:text-5xl leading-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  {introHeadline3}
                </span>
              )}
            </motion.h2>
          )}

          {/* Letter Body Container: Blurred when isLocked */}
          <div className="relative w-full z-10">
            {/* Inner Content that gets blurred */}
            <div
              style={{
                filter: isLocked ? 'blur(8px)' : 'none',
                opacity: isLocked ? 0.35 : 1,
                userSelect: isLocked ? 'none' : 'auto',
                pointerEvents: isLocked ? 'none' : 'auto',
                transition: 'filter 0.4s ease, opacity 0.4s ease',
              }}
            >
              {/* Divider — ornamental */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8 w-40 mx-auto">
                <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' }} />
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="color-mix(in srgb, var(--color-accent) 50%, transparent)"/>
                </svg>
                <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' }} />
              </motion.div>

              {/* Paragraphs */}
              <motion.div variants={itemVariants} className="flex flex-col gap-5 md:gap-6">
                {paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="font-sans text-sm md:text-base text-center leading-[1.95]"
                    style={{ color: 'var(--color-text)', fontWeight: 300, letterSpacing: '0.01em' }}
                  >
                    {p}
                  </p>
                ))}
              </motion.div>

              {/* Sign Off */}
              {introSignOff && (
                <motion.p
                  variants={itemVariants}
                  className="font-serif italic text-lg md:text-xl text-center mt-10"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {introSignOff}
                </motion.p>
              )}
            </div>

            {/* Lock Overlay over Letter Body */}
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
                    Pesan cinta tersembunyi
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
        </div>
      </motion.div>
    </section>
  );
}
