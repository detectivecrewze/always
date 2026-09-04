'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function CircleWishesSection({
  wishes,
  recipient,
  moment,
  circleTitle1,
  circleTitle2,
  circleSubtitle,
}) {
  // Strict non-breaking guard
  if (!wishes || wishes.length === 0) {
    return null;
  }

  const [selectedWish, setSelectedWish] = useState(null);

  // Helper to render dynamic subtitle with {recipient} placeholder support
  const renderSubtitle = () => {
    const rawSubtitle =
      circleSubtitle ??
      'Untaian pesan hangat dan kenangan manis dari teman-teman tersayang untuk {recipient}.';
    if (!rawSubtitle) return null;

    if (rawSubtitle.includes('{recipient}')) {
      const parts = rawSubtitle.split('{recipient}');
      return (
        <>
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="text-accent font-medium">{recipient || 'kamu'}</span>
              )}
            </span>
          ))}
        </>
      );
    }

    return rawSubtitle;
  };

  // Lock body scroll when modal is open, and handle ESC key
  useEffect(() => {
    if (!selectedWish) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedWish(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedWish]);

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12 md:mb-16 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2 className="flex flex-col gap-1 md:gap-2">
          <span className="block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text leading-tight">
            {circleTitle1 || 'Circle of'}
          </span>
          <span className="block font-serif italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">
            {circleTitle2 || 'Heartfelt Wishes'}
          </span>
        </h2>
        <p className="text-text-muted text-xs sm:text-sm mt-3 max-w-md mx-auto leading-relaxed">
          {renderSubtitle()}
        </p>
      </motion.div>

      {/* Bento / Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {wishes.map((wish, index) => {
          const isEven = index % 2 === 0;
          const tiltClass = isEven ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0';
          const formattedDate = formatDate(wish.createdAt);

          return (
            <motion.div
              key={wish.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (index % 6) * 0.08 }}
              onClick={() => setSelectedWish(wish)}
              className={`group cursor-pointer relative rounded-2xl p-5 border transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between ${tiltClass}`}
              style={{
                background: 'color-mix(in srgb, var(--color-surface) 65%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Card Body */}
              <div>
                {/* Photo Display or Monogram */}
                {wish.photoUrl ? (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-black/20 border border-white/10">
                    <img
                      src={wish.photoUrl}
                      alt={wish.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-base font-semibold shrink-0 border"
                      style={{
                        background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {(wish.name || 'F').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-text truncate">
                        {wish.name}
                      </h3>
                      {formattedDate && (
                        <span className="text-[11px] text-text-muted block">
                          {formattedDate}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Friend Name when Photo is Present */}
                {wish.photoUrl && (
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-accent font-serif tracking-wide truncate">
                      {wish.name}
                    </h3>
                    {formattedDate && (
                      <span className="text-[11px] text-text-muted shrink-0">
                        {formattedDate}
                      </span>
                    )}
                  </div>
                )}

                {/* Wish Message Snippet */}
                <p className="text-xs sm:text-sm text-text/85 italic leading-relaxed line-clamp-3 font-serif">
                  &ldquo;{wish.message}&rdquo;
                </p>
              </div>

              {/* Bottom Action Hint */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-accent/80 font-medium group-hover:text-accent transition-colors">
                <span>Buka ucapan lengkap</span>
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expandable Modal Dialog with Framer Motion */}
      <AnimatePresence>
        {selectedWish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWish(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-white/15 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              style={{
                background: 'color-mix(in srgb, var(--color-surface) 92%, #000)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedWish(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-text flex items-center justify-center transition-colors z-10 text-xs font-semibold cursor-pointer"
                aria-label="Tutup dialog ucapan"
              >
                ✕
              </button>

              <div className="overflow-y-auto pr-1 space-y-5">
                {/* Full-size Photo if present */}
                {selectedWish.photoUrl && (
                  <div className="w-full max-h-[340px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <img
                      src={selectedWish.photoUrl}
                      alt={selectedWish.name}
                      className="w-full h-full object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {!selectedWish.photoUrl && (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-semibold shrink-0 border"
                      style={{
                        background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {(selectedWish.name || 'F').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl text-text font-medium">
                      {selectedWish.name}
                    </h4>
                    {formatDate(selectedWish.createdAt) && (
                      <p className="text-xs text-text-muted">
                        Terkirim pada {formatDate(selectedWish.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Un-clamped Message */}
                <div
                  className="rounded-xl p-5 border border-white/10 text-text font-serif italic text-sm sm:text-base leading-relaxed whitespace-pre-line"
                  style={{
                    background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
                  }}
                >
                  &ldquo;{selectedWish.message}&rdquo;
                </div>
              </div>

              {/* Bottom Close Button */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedWish(null)}
                  className="px-5 py-2 rounded-xl text-xs font-medium border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
                >
                  Tutup Ucapan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
