'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PinGateScreen({
  pinCode = '',
  pinHint = '',
  onUnlock,
  themeColors = [],
  recipientName = ''
}) {
  const [inputPin, setInputPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const safePinCode = String(pinCode || '');
  const maxDigits = Math.min(Math.max(safePinCode.length || 4, 4), 6);
  const targetPin = safePinCode;

  const handleDigitPress = useCallback((digit) => {
    if (isUnlocked) return;
    setIsError(false);

    setInputPin((prev) => {
      if (prev.length >= maxDigits) return prev;
      const next = prev + digit;
      
      // Auto-validate when maxDigits reached
      if (next.length === maxDigits || next === targetPin) {
        if (next === targetPin) {
          setIsUnlocked(true);
          setTimeout(() => {
            if (onUnlock) onUnlock();
          }, 850);
        } else if (next.length === maxDigits) {
          setIsError(true);
          setTimeout(() => {
            setInputPin('');
            setIsError(false);
          }, 700);
        }
      }
      return next;
    });
  }, [isUnlocked, maxDigits, targetPin, onUnlock]);

  const handleBackspace = useCallback(() => {
    if (isUnlocked) return;
    setIsError(false);
    setInputPin((prev) => prev.slice(0, -1));
  }, [isUnlocked]);

  const handleClear = useCallback(() => {
    if (isUnlocked) return;
    setIsError(false);
    setInputPin('');
  }, [isUnlocked]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isUnlocked) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigitPress, handleBackspace, handleClear, isUnlocked]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-bg/95 backdrop-blur-2xl px-4 py-8 overflow-y-auto select-none font-sans"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full blur-[130px] opacity-35 transition-all duration-1000"
          style={{ backgroundColor: themeColors[1] || 'var(--color-accent)' }}
        />
        <div 
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full blur-[130px] opacity-25 transition-all duration-1000"
          style={{ backgroundColor: themeColors[0] || 'var(--color-particle)' }}
        />

        {/* Ambient Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
            className="absolute rounded-full bg-accent/40 blur-[1px]"
            style={{
              top: `${12 + i * 14}%`,
              left: `${15 + (i * 15) % 70}%`,
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Top Header Section */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center mt-2 shrink-0">
        {/* Heart Lock Emblem Container */}
        <motion.div
          animate={
            isUnlocked
              ? { scale: [1, 1.25, 0.95], rotate: [0, -8, 8, 0] }
              : isError
              ? { x: [-12, 12, -8, 8, -4, 4, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            isUnlocked
              ? { duration: 0.7, ease: 'easeOut' }
              : isError
              ? { duration: 0.5 }
              : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative mb-5 flex items-center justify-center flex-none shrink-0"
        >
          {/* Glowing Aura */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50 transition-all duration-700"
            style={{
              backgroundColor: isUnlocked
                ? '#10b981'
                : isError
                ? '#ef4444'
                : 'var(--color-accent)'
            }}
          />

          {/* Fixed Dimensions Outer Ring */}
          <div 
            className="relative p-1 rounded-full bg-gradient-to-b from-text/25 via-text/10 to-transparent backdrop-blur-md shadow-2xl border border-text/20 flex-none shrink-0 aspect-square"
            style={{ width: '96px', height: '96px' }}
          >
            {/* Fixed Dimensions Inner Glass Orb */}
            <div 
              className="relative rounded-full bg-surface/60 backdrop-blur-xl border border-text/15 flex items-center justify-center shadow-inner overflow-hidden flex-none shrink-0 aspect-square"
              style={{ width: '88px', height: '88px' }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-text/10 to-transparent opacity-60 pointer-events-none" />

              {/* Heart Lock SVG */}
              <svg
                className={`w-10 h-10 transition-all duration-700 ${
                  isUnlocked
                    ? 'text-emerald-400 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                    : isError
                    ? 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                    : 'text-accent drop-shadow-[0_0_12px_var(--color-accent)]'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isUnlocked ? (
                  <g>
                    <path d="M7 10V7a5 5 0 0 1 9.9-1" className="transition-all duration-500" />
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" fillOpacity="0.18" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <path d="M12 13.5v3" strokeWidth="2" />
                  </g>
                ) : (
                  <g>
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" fillOpacity="0.18" />
                    <circle cx="12" cy="13" r="1.25" fill="currentColor" />
                    <path d="M12 14.25v2.5" strokeWidth="2" />
                  </g>
                )}
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2 
          key={isUnlocked ? 'unlocked' : 'locked'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-serif tracking-tight font-medium text-text mb-1"
        >
          {isUnlocked ? 'Love Unlocked ✨' : 'Locked With Love'}
        </motion.h2>
        
        <p className="text-xs text-text-muted max-w-xs font-light tracking-wide leading-relaxed px-2">
          {isUnlocked
            ? 'Membuka rahasia manis di dalamnya...'
            : recipientName
            ? `Masukkan PIN rahasia untuk membuka pesan hangat ${recipientName}`
            : 'Masukkan PIN rahasia untuk membuka pesan hangat'}
        </p>

        {/* Hint Badge */}
        {pinHint && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 px-4 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-sm backdrop-blur-md"
          >
            <span>💡 Hint:</span>
            <span className="font-semibold text-text">{pinHint}</span>
          </motion.div>
        )}
      </div>

      {/* Center PIN Dots */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center my-4 shrink-0">
        <motion.div
          animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-3.5"
        >
          {Array.from({ length: maxDigits }).map((_, idx) => {
            const isFilled = idx < inputPin.length;
            return (
              <motion.div
                key={idx}
                animate={
                  isUnlocked
                    ? { scale: [1, 1.3, 1], backgroundColor: '#10b981' }
                    : isFilled
                    ? { scale: [1, 1.25, 1] }
                    : { scale: 1 }
                }
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-emerald-400 border border-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]'
                    : isError
                    ? 'bg-red-400/90 border border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    : isFilled
                    ? 'bg-accent border border-accent/80 shadow-[0_0_14px_var(--color-accent)]'
                    : 'bg-text/5 border border-text/30 shadow-inner'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error Message */}
        <div className="h-5 mt-2 flex items-center justify-center">
          <AnimatePresence>
            {isError && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-red-400 font-medium tracking-wide flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>PIN belum sesuai, silakan coba lagi</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Luxury Circular Keypad (Guaranteed Round & Centered) */}
      <div className="relative z-10 w-full max-w-[260px] sm:max-w-[280px] mx-auto mb-2 shrink-0 flex flex-col items-center">
        <div className="grid grid-cols-3 gap-x-5 gap-y-3.5 w-full place-items-center justify-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleDigitPress(digit)}
              disabled={isUnlocked}
              style={{ width: '60px', height: '60px' }}
              className="rounded-full bg-text/5 hover:bg-text/15 active:bg-accent/30 border border-text/15 text-text font-serif font-light text-2xl flex items-center justify-center backdrop-blur-xl transition-all duration-200 shadow-md group relative overflow-hidden flex-none shrink-0 aspect-square"
            >
              <span className="relative z-10">{digit}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}

          {/* Bottom Row: Clear, 0, Backspace */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleClear}
            disabled={isUnlocked || inputPin.length === 0}
            style={{ width: '60px', height: '60px' }}
            className="rounded-full bg-transparent hover:bg-text/10 text-text-muted font-sans text-[10px] font-medium uppercase tracking-wider flex items-center justify-center disabled:opacity-20 transition-all flex-none shrink-0 aspect-square"
          >
            CLEAR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleDigitPress('0')}
            disabled={isUnlocked}
            style={{ width: '60px', height: '60px' }}
            className="rounded-full bg-text/5 hover:bg-text/15 active:bg-accent/30 border border-text/15 text-text font-serif font-light text-2xl flex items-center justify-center backdrop-blur-xl transition-all duration-200 shadow-md group relative overflow-hidden flex-none shrink-0 aspect-square"
          >
            <span className="relative z-10">0</span>
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBackspace}
            disabled={isUnlocked || inputPin.length === 0}
            style={{ width: '60px', height: '60px' }}
            className="rounded-full bg-transparent hover:bg-text/10 text-text-muted flex items-center justify-center disabled:opacity-20 transition-all flex-none shrink-0 aspect-square"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
