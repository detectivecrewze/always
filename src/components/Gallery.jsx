'use client';

import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ── Locked photo placeholder (premium gate) ────────────────────────
function LockedPhotoCard({ index }) {
  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl aspect-[4/5]"
      style={{
        background: 'rgba(225,29,72,0.04)',
        border: '1px dashed rgba(225,29,72,0.2)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(0,0,0,0.15) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(225,29,72,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </motion.div>
        <p style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: '0.65rem', color: 'rgba(225,29,72,0.45)', letterSpacing: '0.04em',
        }}>
          premium only
        </p>
      </div>
    </motion.div>
  );
}

export default function Gallery({ photos, galleryTitle1, galleryTitle2, freeCount }) {
  const hasFreeLimit = freeCount != null && freeCount < photos.length;
  const visiblePhotos = hasFreeLimit ? photos.slice(0, freeCount) : photos;
  const hiddenCount = hasFreeLimit ? photos.length - freeCount : 0;

  return (
    <section className="relative z-10 px-6 py-16 md:py-24 flex flex-col items-center">

      {/* Section Title */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2 className="flex flex-col gap-1 md:gap-2">
          <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">
            {galleryTitle1 || 'Our Beautiful'}
          </span>
          <span className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">
            {galleryTitle2 || 'Memories'}
          </span>
        </h2>
      </motion.div>

      {/* Photo Grid — uniform 2-col, all same size */}
      <motion.div
        className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-[700px]"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Visible photos */}
        {visiblePhotos.map((photo, i) => {
          const url = typeof photo === 'string' ? photo : photo.url;
          const caption = typeof photo === 'string' ? '' : photo.caption;
          const isVideo = url && /\.(mp4|webm|mov)$/i.test(url);

          return (
            <motion.div
              key={i}
              variants={item}
              className="relative group overflow-hidden rounded-2xl aspect-[4/5] border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              }}
            >
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  autoPlay loop muted playsInline webkit-playsinline="" preload="metadata"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              ) : (
                <img
                  src={url}
                  alt={caption || `Memory ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              )}

              {/* Bottom gradient for caption */}
              <div
                className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(20,6,12,0.85) 0%, transparent 100%)' }}
              />

              {/* Caption */}
              {caption && (
                <motion.p
                  className="absolute bottom-4 inset-x-0 text-center font-serif italic text-lg md:text-xl text-white/80"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {caption}
                </motion.p>
              )}
            </motion.div>
          );
        })}

        {/* Locked photo placeholders — show up to 2 lock cards */}
        {hasFreeLimit && Array.from({ length: Math.min(hiddenCount, 2) }).map((_, i) => (
          <LockedPhotoCard key={`locked-${i}`} index={i} />
        ))}
      </motion.div>

      {/* "X more memories hidden" hint badge */}
      {hasFreeLimit && hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            marginTop: '24px',
            padding: '10px 20px',
            borderRadius: '999px',
            background: 'rgba(225,29,72,0.06)',
            border: '1px dashed rgba(225,29,72,0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(225,29,72,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontSize: '0.72rem', color: 'rgba(225,29,72,0.6)',
          }}>
            {hiddenCount} more {hiddenCount === 1 ? 'memory' : 'memories'} hidden — unlock for full access
          </span>
        </motion.div>
      )}
    </section>
  );
}
