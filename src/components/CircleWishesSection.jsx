'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Mic, Volume2 } from 'lucide-react';
import { isVideoMedia } from '@/lib/videoValidation';
import { formatAudioTime } from '@/lib/audioRecorder';

// Helper: detect if a URL points to an audio file (not a photo or video)
function isAudioUrl(url) {
  if (!url) return false;
  return /\.(mp3|m4a|ogg|aac|wav|opus|flac|webm)(\?.*)?$/i.test(url)
    && !/\.(mp4|mov)(\?.*)?$/i.test(url);
}

// Helper: check if a photoUrl is a valid displayable image/video (not an audio file)
function isDisplayableMedia(url) {
  if (!url) return false;
  if (isAudioUrl(url)) return false;
  return true;
}

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
  onVideoAudioChange,
}) {
  // Strict non-breaking guard
  if (!wishes || wishes.length === 0) {
    return null;
  }

  const [selectedWish, setSelectedWish] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const modalVideoRef = useRef(null);
  const modalAudioRef = useRef(null);

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

  // Toggle video sound with onVideoAudioChange notification
  const toggleMute = useCallback(() => {
    if (!modalVideoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    modalVideoRef.current.muted = nextMuted;

    if (!nextMuted) {
      modalVideoRef.current.play().catch(() => {});
      if (onVideoAudioChange) onVideoAudioChange(true);
    } else {
      if (onVideoAudioChange) onVideoAudioChange(false);
    }
  }, [isMuted, onVideoAudioChange]);

  // Unified modal close handler ensuring audio & video cleanup
  const closeModal = useCallback(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.muted = true;
    }
    if (modalAudioRef.current) {
      modalAudioRef.current.pause();
      modalAudioRef.current.currentTime = 0;
    }
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (onVideoAudioChange) onVideoAudioChange(false);
    }
    if (!isMuted) {
      setIsMuted(true);
      if (onVideoAudioChange) onVideoAudioChange(false);
    }
    setSelectedWish(null);
  }, [isMuted, isPlayingAudio, onVideoAudioChange]);

  // Toggle voice note audio play/pause with background music sync
  const toggleAudioPlay = useCallback(() => {
    if (!modalAudioRef.current) return;
    if (isPlayingAudio) {
      modalAudioRef.current.pause();
      setIsPlayingAudio(false);
      if (onVideoAudioChange) onVideoAudioChange(false);
    } else {
      modalAudioRef.current.play().then(() => {
        setIsPlayingAudio(true);
        if (onVideoAudioChange) onVideoAudioChange(true);
      }).catch(() => {});
    }
  }, [isPlayingAudio, onVideoAudioChange]);

  const handleAudioEnded = useCallback(() => {
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
    if (modalAudioRef.current) modalAudioRef.current.currentTime = 0;
    if (onVideoAudioChange) onVideoAudioChange(false);
  }, [onVideoAudioChange]);

  const handleSeekAudio = (e) => {
    if (!modalAudioRef.current || !audioDuration) return;
    const seekVal = Number(e.target.value);
    modalAudioRef.current.currentTime = seekVal;
    setAudioCurrentTime(seekVal);
  };

  // 1. Unmount cleanup only
  useEffect(() => {
    return () => {
      if (onVideoAudioChange) onVideoAudioChange(false);
    };
  }, [onVideoAudioChange]);

  // 2. Reset media states when selectedWish changes (new wish opened)
  useEffect(() => {
    if (selectedWish) {
      setIsMuted(true);
      setIsPlayingAudio(false);
      setAudioCurrentTime(0);
      setAudioDuration(selectedWish.audioDuration || 0);
    }
  }, [selectedWish]);

  // Lock body scroll when modal is open, and handle ESC key
  useEffect(() => {
    if (!selectedWish) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedWish, closeModal]);

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
          const isAudioWish = wish.mediaType === 'audio' || Boolean(wish.audioUrl);

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
              <div className="flex-1 flex flex-col justify-between">
                {/* Photo or Video Display or Audio Soundwave or Monogram */}
                {isDisplayableMedia(wish.photoUrl) ? (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-black/20 border border-white/10 relative">
                    {isVideoMedia(wish.photoUrl) ? (
                      <video
                        src={wish.photoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        webkit-playsinline=""
                        preload="metadata"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                      />
                    ) : (
                      <img
                        src={wish.photoUrl}
                        alt={wish.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    {isAudioWish && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 border border-white/20 text-[10px] text-white flex items-center gap-1 backdrop-blur-sm shadow-md">
                        <Mic size={10} className="text-accent" />
                        <span>{formatAudioTime(wish.audioDuration)}</span>
                      </div>
                    )}
                  </div>
                ) : isAudioWish ? (
                  <div
                    className="rounded-xl p-3.5 mb-4 border flex items-center justify-between gap-3"
                    style={{
                      background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-accent shrink-0 border"
                        style={{
                          background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
                        }}
                      >
                        <Mic size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-text">Voice Note</div>
                        <div className="text-[10px] text-text-muted">
                          {formatAudioTime(wish.audioDuration) || '0:30'}
                        </div>
                      </div>
                    </div>

                    {/* Mini waveform bars */}
                    <div className="flex items-center gap-1 h-5">
                      {[10, 18, 14, 8, 16, 12, 20, 9].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full bg-accent/60"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-base font-semibold shrink-0 border mb-4"
                    style={{
                      background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {(wish.name || 'F').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Wish Message Snippet */}
                {wish.message ? (
                  <p className="text-xs sm:text-sm text-text/90 italic leading-relaxed line-clamp-3 font-serif mb-4">
                    &ldquo;{wish.message}&rdquo;
                  </p>
                ) : isAudioWish ? (
                  <p className="text-xs sm:text-sm text-accent italic leading-relaxed font-serif mb-4 flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>Pesan suara dari {wish.name}</span>
                  </p>
                ) : null}

                {/* Sign-Off Bar (Postcard / Letter Style) */}
                <div className="flex items-center justify-between gap-2 mt-auto pt-1 mb-1">
                  <div className="font-serif text-sm text-accent font-medium tracking-wide truncate flex items-center gap-1.5">
                    <span className="opacity-50 select-none font-normal">&mdash;</span>
                    <span className="truncate">{wish.name}</span>
                  </div>
                  {formattedDate && (
                    <span className="text-[11px] text-text-muted shrink-0 font-sans">
                      {formattedDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Action Hint */}
              <div
                className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-medium transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                <span>{isAudioWish ? 'Dengarkan pesan suara' : 'Buka ucapan lengkap'}</span>
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
            onClick={closeModal}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
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
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-text flex items-center justify-center transition-colors z-10 text-xs font-semibold cursor-pointer"
                aria-label="Tutup dialog ucapan"
              >
                ✕
              </button>

              <div className="overflow-y-auto pr-1 space-y-5">
                {/* Full-size Photo or Video if present */}
                {isDisplayableMedia(selectedWish.photoUrl) && (
                  <div className="relative w-full max-h-[320px] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    {isVideoMedia(selectedWish.photoUrl) ? (
                      <>
                        <video
                          ref={modalVideoRef}
                          src={selectedWish.photoUrl}
                          autoPlay
                          loop
                          playsInline
                          webkit-playsinline=""
                          muted={isMuted}
                          preload="auto"
                          onClick={toggleMute}
                          onPlay={() => {
                            if (!isMuted && onVideoAudioChange) onVideoAudioChange(true);
                          }}
                          onPause={() => {
                            if (!isMuted && onVideoAudioChange) onVideoAudioChange(false);
                          }}
                          onEnded={() => {
                            if (!isMuted && onVideoAudioChange) onVideoAudioChange(false);
                          }}
                          className="w-full h-full max-h-[320px] object-contain mx-auto cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                          }}
                          className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer z-10"
                          style={{
                            background: isMuted
                              ? 'rgba(0, 0, 0, 0.75)'
                              : 'color-mix(in srgb, var(--color-accent) 85%, transparent)',
                            borderColor: isMuted ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-accent)',
                            color: '#ffffff',
                            boxShadow: isMuted
                              ? '0 4px 16px rgba(0,0,0,0.5)'
                              : '0 4px 20px color-mix(in srgb, var(--color-accent) 50%, transparent)',
                          }}
                          aria-label={isMuted ? 'Dengarkan dengan Suara' : 'Bisukan Video'}
                        >
                          {isMuted ? (
                            <>
                              <span className="text-sm">🔊</span>
                              <span>Dengarkan dengan Suara</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">🔇</span>
                              <span>Bisukan Video</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <img
                        src={selectedWish.photoUrl}
                        alt={selectedWish.name}
                        className="w-full h-full object-contain mx-auto"
                      />
                    )}
                  </div>
                )}

                {/* Voice Note Player if this wish is audio */}
                {(selectedWish.mediaType === 'audio' || selectedWish.audioUrl) && (
                  <>
                    <audio
                      ref={modalAudioRef}
                      src={selectedWish.audioUrl || selectedWish.mediaUrl}
                      onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime)}
                      onLoadedMetadata={(e) => {
                        const raw = e.target.duration;
                        // WebM blobs recorded via MediaRecorder often return Infinity — use stored audioDuration as fallback
                        const resolved = isFinite(raw) && raw > 0 ? raw : (selectedWish.audioDuration || 0);
                        setAudioDuration(resolved);
                      }}
                      onEnded={handleAudioEnded}
                      onPause={() => {
                        setIsPlayingAudio(false);
                        if (onVideoAudioChange) onVideoAudioChange(false);
                      }}
                      onPlay={() => {
                        setIsPlayingAudio(true);
                        if (onVideoAudioChange) onVideoAudioChange(true);
                      }}
                      preload="auto"
                      className="hidden"
                    />

                    <div
                      className="rounded-xl p-4 sm:p-5 border flex flex-col gap-3.5 shadow-lg"
                      style={{
                        background: 'color-mix(in srgb, var(--color-surface) 95%, #000)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={toggleAudioPlay}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, #000))',
                              boxShadow: '0 6px 20px color-mix(in srgb, var(--color-accent) 40%, transparent)',
                            }}
                            aria-label={isPlayingAudio ? 'Jeda Suara' : 'Dengarkan Suara'}
                          >
                            {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
                          </button>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-text flex items-center gap-1.5 truncate">
                              <Mic size={14} className="text-accent shrink-0" />
                              <span className="truncate">Pesan Suara · {selectedWish.name}</span>
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">
                              {isPlayingAudio ? 'Sedang memutar suara...' : 'Tekan tombol Play untuk mendengarkan'}
                            </div>
                          </div>
                        </div>

                        {/* Animated equalizer waves */}
                        <div className="flex items-center gap-1 h-6 pr-1 shrink-0">
                          {[10, 22, 14, 8, 20, 16, 24, 12, 18].map((h, i) => (
                            <motion.span
                              key={i}
                              animate={isPlayingAudio ? { height: [6, h, 6] } : { height: 6 }}
                              transition={{
                                duration: 0.5,
                                repeat: isPlayingAudio ? Infinity : 0,
                                delay: i * 0.05,
                                ease: 'easeInOut',
                              }}
                              className="w-1 rounded-full bg-accent"
                              style={{ height: '6px' }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Scrubber & Duration */}
                      <div className="space-y-1 pt-1">
                        <input
                          type="range"
                          min="0"
                          max={audioDuration || selectedWish.audioDuration || 30}
                          step="0.1"
                          value={audioCurrentTime}
                          onChange={handleSeekAudio}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-accent bg-white/10"
                        />
                        <div className="flex justify-between text-[11px] font-mono text-text-muted">
                          <span>{formatAudioTime(audioCurrentTime)}</span>
                          <span>{formatAudioTime(audioDuration || selectedWish.audioDuration || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Message Caption or Postcard Sign-Off */}
                {selectedWish.message ? (
                  <div
                    className="rounded-xl p-5 sm:p-6 border border-white/10 text-text font-serif leading-relaxed whitespace-pre-line"
                    style={{
                      background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
                    }}
                  >
                    <p className="italic text-sm sm:text-base leading-relaxed mb-4">
                      &ldquo;{selectedWish.message}&rdquo;
                    </p>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-accent font-medium text-base tracking-wide flex items-center gap-1.5 font-serif">
                        <span className="opacity-50 select-none font-normal">&mdash;</span>
                        <span>{selectedWish.name}</span>
                      </div>
                      {formatDate(selectedWish.createdAt) && (
                        <span className="text-xs text-text-muted font-sans">
                          {formatDate(selectedWish.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-xl p-4 border border-white/10 text-text flex items-center justify-between"
                    style={{
                      background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
                    }}
                  >
                    <div className="text-accent font-medium text-base tracking-wide flex items-center gap-1.5 font-serif">
                      <span className="opacity-50 select-none font-normal">&mdash;</span>
                      <span>{selectedWish.name}</span>
                    </div>
                    {formatDate(selectedWish.createdAt) && (
                      <span className="text-xs text-text-muted font-sans">
                        {formatDate(selectedWish.createdAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Close Button */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer"
                  style={{
                    color: 'var(--color-accent)',
                    borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
                    background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                  }}
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
