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

  const maxDigits = Math.min(Math.max(pinCode.toString().length || 4, 4), 6);
  const targetPin = pinCode.toString();

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
          }, 700);
        } else if (next.length === maxDigits) {
          setIsError(true);
          setTimeout(() => {
            setInputPin('');
            setIsError(false);
          }, 800);
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
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-xl px-4 py-8 overflow-hidden select-none"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-30 transition-all duration-700"
          style={{ backgroundColor: themeColors[1] || 'var(--color-accent)' }}
        />
        <div 
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: themeColors[0] || 'var(--color-particle)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Aesthetic Glassmorphic Padlock Icon */}
        <motion.div
          animate={
            isUnlocked
              ? { scale: [1, 1.2, 0.9], rotate: [0, -10, 10, 0] }
              : isError
              ? { x: [-12, 12, -8, 8, -4, 4, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            isUnlocked
              ? { duration: 0.6 }
              : isError
              ? { duration: 0.5 }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative mb-6 flex items-center justify-center"
        >
          {/* Outer Ring Glow */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-500"
            style={{
              backgroundColor: isUnlocked
                ? '#10b981'
                : isError
                ? '#ef4444'
                : 'var(--color-accent)'
            }}
          />

          {/* Glass Card Container */}
          <div className="relative w-24 h-24 rounded-3xl bg-surface/40 backdrop-blur-md border border-text/10 shadow-2xl flex items-center justify-center">
            <svg
              className={`w-12 h-12 transition-all duration-500 ${
                isUnlocked
                  ? 'text-emerald-400 scale-110'
                  : isError
                  ? 'text-red-400'
                  : 'text-accent'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isUnlocked ? (
                // Unlock Icon
                <g>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </g>
              ) : (
                // Lock Icon
                <g>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </g>
              )}
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-semibold tracking-wide text-text mb-1">
          {isUnlocked ? 'Access Granted ✨' : 'Secret Security Lock'}
        </h2>
        <p className="text-xs text-text-muted mb-6 max-w-xs font-light">
          {isUnlocked
            ? 'Opening your special gift...'
            : recipientName
            ? `Masukkan PIN rahasia untuk membuka hadiah ${recipientName}`
            : 'Masukkan PIN rahasia untuk membuka hadiah'}
        </p>

        {/* Hint text if present */}
        {pinHint && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] tracking-wide flex items-center gap-1.5"
          >
            <span>💡 Hint:</span>
            <span className="font-medium">{pinHint}</span>
          </motion.div>
        )}

        {/* PIN Indicators Dots */}
        <motion.div
          animate={isError ? { x: [-10, 10, -6, 6, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          {Array.from({ length: maxDigits }).map((_, idx) => {
            const isFilled = idx < inputPin.length;
            return (
              <motion.div
                key={idx}
                animate={
                  isUnlocked
                    ? { scale: [1, 1.2, 1], backgroundColor: '#10b981' }
                    : isFilled
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border ${
                  isUnlocked
                    ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : isError
                    ? 'bg-red-400/80 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : isFilled
                    ? 'bg-accent border-accent shadow-[0_0_10px_var(--color-accent)]'
                    : 'bg-surface/50 border-text/20'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error message text */}
        <div className="h-5 mb-3 flex items-center justify-center">
          <AnimatePresence>
            {isError && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-red-400 font-medium tracking-wide"
              >
                PIN salah, silakan coba lagi 🙏
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Touch Keypad */}
        <div className="w-full max-w-[260px] grid grid-cols-3 gap-3 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleDigitPress(digit)}
              disabled={isUnlocked}
              className="h-14 rounded-2xl bg-surface/40 hover:bg-surface/60 active:bg-accent/20 border border-text/10 text-text font-sans font-medium text-xl flex items-center justify-center backdrop-blur-md transition-colors shadow-sm"
            >
              {digit}
            </motion.button>
          ))}

          {/* Bottom Row: Clear, 0, Backspace */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleClear}
            disabled={isUnlocked || inputPin.length === 0}
            className="h-14 rounded-2xl bg-surface/20 hover:bg-surface/40 border border-text/5 text-text-muted font-sans text-xs uppercase tracking-wider flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            Clear
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleDigitPress('0')}
            disabled={isUnlocked}
            className="h-14 rounded-2xl bg-surface/40 hover:bg-surface/60 active:bg-accent/20 border border-text/10 text-text font-sans font-medium text-xl flex items-center justify-center backdrop-blur-md transition-colors shadow-sm"
          >
            0
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBackspace}
            disabled={isUnlocked || inputPin.length === 0}
            className="h-14 rounded-2xl bg-surface/20 hover:bg-surface/40 border border-text/5 text-text-muted flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
