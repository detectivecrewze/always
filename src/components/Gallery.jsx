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

export default function Gallery({ photos, galleryTitle1, galleryTitle2 }) {
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
        {photos.map((photo, i) => {
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
              {/* Photo or Video */}
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkit-playsinline=""
                  preload="metadata"
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
                style={{
                  background: 'linear-gradient(to top, rgba(20,6,12,0.85) 0%, transparent 100%)',
                }}
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
      </motion.div>
    </section>
  );
}
