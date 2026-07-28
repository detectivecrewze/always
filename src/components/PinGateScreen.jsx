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

  const primaryColor = themeColors[0] || '#C084FC';
  const secondaryColor = themeColors[1] || '#F0ABFC';

  const handleDigitPress = useCallback((digit) => {
    if (isUnlocked) return;
    setIsError(false);

    setInputPin((prev) => {
      if (prev.length >= maxDigits) return prev;
      const next = prev + digit;

      if (next.length === maxDigits || next === targetPin) {
        if (next === targetPin) {
          setIsUnlocked(true);
          setTimeout(() => {
            if (onUnlock) onUnlock();
          }, 1200);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isUnlocked) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigitPress, handleBackspace, isUnlocked]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 backdrop-blur-2xl overflow-hidden select-none p-3 sm:p-6"
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 60, 0], x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0], x: ['5%', '-5%', '5%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-15"
          style={{ backgroundColor: secondaryColor }}
        />
      </div>

      {/* ── THE CARD ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[340px]"
        style={{
          /* Card must never exceed viewport height */
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRadius: '1.5rem',
          background: 'rgba(255,255,255,0.045)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: `0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.10)`,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        {/* Top shimmer */}
        <div className="sticky top-0 left-0 right-0 h-px z-20"
          style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}80, transparent)` }}
        />

        <div className="px-5 py-5 sm:px-7 sm:py-7 flex flex-col items-center gap-4 sm:gap-5">

          {/* Lock Icon */}
          <motion.div
            animate={
              isUnlocked
                ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
                : isError
                ? { x: [-6, 6, -4, 4, -2, 2, 0] }
                : { y: [0, -3, 0] }
            }
            transition={
              isUnlocked
                ? { duration: 0.8, ease: 'easeOut' }
                : isError
                ? { duration: 0.45 }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <div
              className="relative w-[58px] h-[58px] sm:w-[68px] sm:h-[68px] rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}0a 100%)`,
                border: `1.5px solid ${primaryColor}35`,
                boxShadow: `0 8px 32px ${primaryColor}25, inset 0 1px 0 ${primaryColor}20`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-50"
                style={{ background: `radial-gradient(circle at 50% 0%, ${primaryColor}30, transparent 70%)` }}
              />
              {isUnlocked ? (
                <svg className="relative z-10 w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                    fill={primaryColor}
                    fillOpacity="0.9"
                    stroke={primaryColor}
                    strokeWidth="0.5"
                  />
                </svg>
              ) : (
                <svg className="relative z-10 w-7 h-7" viewBox="0 0 24 24" fill="none" style={{ color: primaryColor }}>
                  <path d="M8 11V7.5a4 4 0 118 0V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="4.5" y="11" width="15" height="10" rx="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  <rect x="11.4" y="16" width="1.2" height="2" rx="0.6" fill="currentColor" />
                </svg>
              )}
            </div>
          </motion.div>

          {/* Title + subtitle */}
          <div className="text-center flex flex-col items-center gap-1">
            <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-text/95">
              {isUnlocked ? 'Unlocked ✨' : 'Secret Code'}
            </h2>
            <p className="text-[11.5px] sm:text-[12.5px] font-light text-text/45 tracking-wide">
              {isUnlocked ? 'Opening the memories...' : 'Enter the secret code to unlock.'}
            </p>
          </div>

          {/* Hint pill */}
          {pinHint && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10.5px] sm:text-[11px] font-medium tracking-wider uppercase"
              style={{
                background: `${primaryColor}12`,
                border: `1px solid ${primaryColor}25`,
                color: `${primaryColor}dd`,
              }}
            >
              <span>💡</span>
              <span>Hint: {pinHint}</span>
            </motion.div>
          )}

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* PIN Dots */}
          <div className="flex flex-col items-center gap-2 w-full">
            <motion.div
              className="flex items-center gap-3"
              animate={isError ? { x: [-7, 7, -5, 5, -2, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {Array.from({ length: maxDigits }).map((_, idx) => {
                const isFilled = idx < inputPin.length;
                return (
                  <div
                    key={idx}
                    className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                    }}
                  >
                    <AnimatePresence>
                      {(isFilled || isUnlocked) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="absolute inset-0 rounded-full"
                          style={{
                            backgroundColor: isUnlocked ? '#10b981' : isError ? '#f87171' : primaryColor,
                            boxShadow: `0 0 8px ${isUnlocked ? '#10b981' : isError ? '#f87171' : primaryColor}88`,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>

            {/* Error message */}
            <div className="h-3.5 flex items-center">
              <AnimatePresence>
                {isError && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] uppercase tracking-widest font-semibold text-red-400"
                  >
                    Incorrect Code
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Keypad */}
          <div className="w-full grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <KeypadButton
                key={digit}
                digit={digit}
                onClick={() => handleDigitPress(digit.toString())}
                disabled={isUnlocked}
                primaryColor={primaryColor}
              />
            ))}
            {/* Bottom row */}
            <div />
            <KeypadButton
              digit={0}
              onClick={() => handleDigitPress('0')}
              disabled={isUnlocked}
              primaryColor={primaryColor}
            />
            {/* Backspace */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleBackspace}
              disabled={isUnlocked || inputPin.length === 0}
              className="flex items-center justify-center h-11 sm:h-12 rounded-2xl transition-colors disabled:opacity-25"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <svg className="w-5 h-5 text-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Bottom shimmer */}
        <div
          className="sticky bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${secondaryColor}40, transparent)` }}
        />
      </motion.div>
    </motion.div>
  );
}

function KeypadButton({ digit, onClick, disabled, primaryColor }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      disabled={disabled}
      className="relative flex items-center justify-center h-11 sm:h-12 rounded-2xl transition-all duration-150 overflow-hidden group"
      style={{
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150"
        style={{ background: `${primaryColor}18` }}
      />
      <span
        className="relative z-10 text-xl sm:text-2xl font-serif font-light transition-colors duration-150"
        style={{ color: 'var(--color-text, #f0ece4)' }}
      >
        {digit}
      </span>
    </motion.button>
  );
}
