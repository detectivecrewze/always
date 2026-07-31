'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer({ music, isPlaying, onToggle, audioRef }) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      const { currentTime: ct, duration: dur } = audioRef.current;
      setCurrentTime(ct);
      setDuration(dur || 0);
      if (dur) setProgress((ct / dur) * 100);
    }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [audioRef, updateProgress]);

  const handleSeek = (e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 left-5 z-50"
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <AnimatePresence mode="wait">
            {isMinimized ? (
              /* ── MINIMIZED pill ── */
              <motion.button
                key="mini"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsMinimized(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10"
                style={{
                  background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {/* Pulsing music note */}
                <motion.svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className="text-accent"
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0 }}
                >
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" fill="currentColor"/>
                  <circle cx="18" cy="16" r="3" fill="currentColor"/>
                </motion.svg>
                <span className="font-sans text-xs text-text-muted max-w-[80px] truncate">
                  {music.title}
                </span>
              </motion.button>
            ) : (
              /* ── FULL player card ── */
              <motion.div
                key="full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{
                  width: '220px',
                  background: 'color-mix(in srgb, var(--color-surface) 95%, transparent)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                }}
              >
                {/* Top bar: minimize only */}
                <div className="flex justify-end gap-1.5 px-3 pt-3">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="w-4 h-4 rounded-full transition-colors flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-text) 20%, transparent)' }}
                    aria-label="Minimize"
                  >
                    <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                      <path d="M0 1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Album art */}
                <div className="px-4 pt-2 pb-0">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface">
                    {music.cover ? (
                      <img
                        src={music.cover}
                        alt={music.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-accent/40">
                          <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="6" cy="18" r="3" fill="currentColor"/>
                          <circle cx="18" cy="16" r="3" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Song info */}
                <div className="px-4 pt-3 text-center">
                  <p className="font-serif font-semibold text-sm text-text truncate">{music.title}</p>
                  <p className="font-sans text-[11px] text-text-muted tracking-widest uppercase mt-0.5 truncate">{music.artist}</p>
                </div>

                {/* Progress bar */}
                <div className="px-4 pt-3">
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="relative w-full h-1 rounded-full cursor-pointer"
                    style={{ background: 'color-mix(in srgb, var(--color-text) 15%, transparent)' }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: 'var(--color-accent)',
                      }}
                    />
                    {/* Scrubber dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md"
                      style={{ left: `calc(${progress}% - 5px)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-sans text-[10px] text-text-muted">{formatTime(currentTime)}</span>
                    <span className="font-sans text-[10px] text-text-muted">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between">
                  {/* Prev (rewind) */}
                  <button
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
                    className="text-text-muted hover:text-text transition-colors"
                    aria-label="Restart"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 20L9 12l10-8v16zM5 19V5"/>
                    </svg>
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={onToggle}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 text-white"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      boxShadow: '0 4px 20px color-mix(in srgb, var(--color-accent) 50%, transparent)',
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z"/>
                      </svg>
                    )}
                  </button>

                  {/* Loop indicator */}
                  <button
                    className="text-text-muted hover:text-accent transition-colors"
                    aria-label="Loop"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4"/>
                      <path d="M3 11V9a4 4 0 014-4h14"/>
                      <path d="M7 23l-4-4 4-4"/>
                      <path d="M21 13v2a4 4 0 01-4 4H3"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
