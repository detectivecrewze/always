'use client';

import { motion } from 'framer-motion';

export default function IntroSection({ 
  introIcons, 
  introPreTitle, 
  introHeadline1, 
  introHeadline2, 
  introHeadline3, 
  introText, 
  introSignOff 
}) {
  // Normalize introText to an array so we can map over it
  const paragraphs = Array.isArray(introText) ? introText : [introText];

  return (
    <section className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24">
      <motion.div
        className="max-w-[560px] w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Dark candlelight letter card */}
        <div
          className="relative flex flex-col items-center text-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(42, 20, 12, 0.97) 0%, rgba(30, 12, 6, 0.99) 100%)',
            borderRadius: '2px',
            padding: '3rem 2.5rem 3.5rem',
            border: '1px solid rgba(200, 140, 80, 0.18)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 0 60px rgba(180,80,20,0.04)',
          }}
        >
          {/* Subtle corner accent — top left */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
            style={{ borderTop: '1px solid rgba(200,140,80,0.3)', borderLeft: '1px solid rgba(200,140,80,0.3)' }}
          />
          {/* Subtle corner accent — top right */}
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
            style={{ borderTop: '1px solid rgba(200,140,80,0.3)', borderRight: '1px solid rgba(200,140,80,0.3)' }}
          />
          {/* Subtle corner accent — bottom left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
            style={{ borderBottom: '1px solid rgba(200,140,80,0.3)', borderLeft: '1px solid rgba(200,140,80,0.3)' }}
          />
          {/* Subtle corner accent — bottom right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
            style={{ borderBottom: '1px solid rgba(200,140,80,0.3)', borderRight: '1px solid rgba(200,140,80,0.3)' }}
          />

          {/* Ruled lines — very subtle warm amber, like aged letter paper */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute left-10 right-10 pointer-events-none"
              style={{
                top: `${90 + i * 38}px`,
                height: '1px',
                background: 'rgba(200, 140, 80, 0.07)',
              }}
            />
          ))}

          {/* Left margin line — like a real letter */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: '48px', width: '1px', background: 'rgba(200, 120, 60, 0.1)' }}
          />

          {/* Warm candlelight glow at top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ width: '160px', height: '60px', background: 'radial-gradient(ellipse, rgba(200,100,30,0.12) 0%, transparent 70%)', filter: 'blur(8px)' }}
          />

          {/* Icons & Pretitle */}
          <div className="mb-6 relative z-10">
            {introIcons && (
              <div className="flex gap-3 justify-center mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.svg
                    key={i}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="#C9894A"/>
                  </motion.svg>
                ))}
              </div>
            )}
            {introPreTitle && (
              <span
                className="font-serif italic text-sm tracking-widest lowercase"
                style={{ color: '#C9A07A' }}
              >
                {introPreTitle}
              </span>
            )}
          </div>

          {/* 3-line Headline */}
          {(introHeadline1 || introHeadline2 || introHeadline3) && (
            <h2 className="relative z-10 flex flex-col gap-2 md:gap-3 mb-10">
              {introHeadline1 && (
                <span
                  className="block font-serif text-3xl md:text-4xl lg:text-5xl leading-tight"
                  style={{ color: '#F0DEC8' }}
                >
                  {introHeadline1}
                </span>
              )}
              {introHeadline2 && (
                <span
                  className="block font-serif italic text-4xl md:text-5xl lg:text-6xl leading-tight"
                  style={{ color: '#F472B6' }}
                >
                  {introHeadline2}
                </span>
              )}
              {introHeadline3 && (
                <span
                  className="block font-serif text-3xl md:text-4xl lg:text-5xl leading-tight"
                  style={{ color: '#F0DEC8' }}
                >
                  {introHeadline3}
                </span>
              )}
            </h2>
          )}

          {/* Divider — ornamental */}
          <div className="relative z-10 flex items-center gap-3 mb-8 w-40">
            <div className="flex-1 h-px" style={{ background: 'rgba(200,140,80,0.25)' }} />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="rgba(200,140,80,0.5)"/>
            </svg>
            <div className="flex-1 h-px" style={{ background: 'rgba(200,140,80,0.25)' }} />
          </div>

          {/* Paragraphs */}
          <div className="relative z-10 flex flex-col gap-5 md:gap-6">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="font-sans text-sm md:text-base text-center leading-[1.95]"
                style={{ color: '#C4A882', fontWeight: 300, letterSpacing: '0.01em' }}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Sign Off */}
          {introSignOff && (
            <p
              className="relative z-10 font-serif italic text-lg md:text-xl text-center mt-10"
              style={{ color: '#F472B6' }}
            >
              {introSignOff}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
