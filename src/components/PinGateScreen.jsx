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

  // Safe color access
  const primaryColor = themeColors[0] || 'var(--color-accent)';
  const secondaryColor = themeColors[1] || 'var(--color-text)';

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

  // Physical keyboard support
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
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg/85 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto overflow-x-hidden text-text select-none"
    >
      {/* Animated Organic Background Blooms */}
      <div className="fixed inset-0 pointer-events-none opacity-50 mix-blend-screen">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 90, 0],
            x: ['-10%', '10%', '-10%'],
            y: ['-10%', '15%', '-10%'],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60vh] h-[60vh] rounded-full blur-[100px] opacity-40"
          style={{ backgroundColor: primaryColor }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: ['10%', '-10%', '10%'],
            y: ['15%', '-15%', '15%'],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[10%] w-[70vh] h-[70vh] rounded-full blur-[120px] opacity-30"
          style={{ backgroundColor: secondaryColor }}
        />
      </div>

      {/* Main Content Layout - Safely Centered */}
      <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center justify-center gap-6 sm:gap-10 py-8 my-auto min-h-full">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center space-y-6 w-full">
          {/* Lock / Heart Icon */}
          <motion.div
            animate={
              isUnlocked
                ? { scale: [1, 1.15, 1], rotateY: [0, 180, 360] }
                : isError
                ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                : { y: [0, -4, 0] }
            }
            transition={
              isUnlocked
                ? { duration: 1, ease: "easeOut" }
                : isError
                ? { duration: 0.5 }
                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }
            className="w-16 h-16 sm:w-20 sm:h-20 mb-2 flex items-center justify-center rounded-2xl sm:rounded-[1.5rem] bg-white/5 border border-white/5 shadow-xl backdrop-blur-xl"
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: isUnlocked ? '#10b981' : isError ? '#ef4444' : primaryColor }}
            >
              {isUnlocked ? (
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" fill="currentColor" fillOpacity="0.25" />
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </>
              )}
            </svg>
          </motion.div>

          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-text/95">
              {isUnlocked ? "Unlocked" : "Secret Code"}
            </h2>
          </div>

          {pinHint && !isUnlocked && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-text/5 border border-text/10 text-[11px] sm:text-xs font-medium text-text-muted backdrop-blur-md"
            >
              <span className="opacity-70">💡</span>
              <span className="opacity-90 font-light tracking-wider uppercase">Hint: {pinHint}</span>
            </motion.div>
          )}
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center justify-center min-h-[44px]">
          <p className="text-[13px] sm:text-sm font-light text-text-muted/80 max-w-[260px] mx-auto leading-relaxed tracking-wide text-center mb-6">
            {isUnlocked
              ? "Opening the memories..."
              : "Enter the secret code to unlock."}
          </p>
          <motion.div 
            className="flex items-center gap-4 sm:gap-5"
            animate={isError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {Array.from({ length: maxDigits }).map((_, idx) => {
              const isFilled = idx < inputPin.length;
              return (
                <div key={idx} className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-text/5 border border-text/20">
                  <AnimatePresence>
                    {(isFilled || isUnlocked) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 rounded-full"
                        style={{ 
                          backgroundColor: isUnlocked ? '#10b981' : isError ? '#ef4444' : primaryColor,
                          boxShadow: `0 0 12px ${isUnlocked ? '#10b981' : isError ? '#ef4444' : primaryColor}`
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
          
          <div className="h-6 mt-1 flex items-center">
            <AnimatePresence>
              {isError && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] uppercase tracking-widest text-red-400 font-semibold"
                >
                  Incorrect Code
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimalist Keypad */}
        <div className="w-full max-w-[260px] grid grid-cols-3 gap-x-6 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <KeypadButton 
              key={digit} 
              digit={digit} 
              onClick={() => handleDigitPress(digit.toString())} 
              disabled={isUnlocked}
              primaryColor={primaryColor}
            />
          ))}
          <div /> {/* Empty space for bottom left */}
          <KeypadButton 
            digit={0} 
            onClick={() => handleDigitPress('0')} 
            disabled={isUnlocked}
            primaryColor={primaryColor}
          />
          <button
            onClick={handleBackspace}
            disabled={isUnlocked || inputPin.length === 0}
            className="flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full text-text-muted/60 hover:text-text/90 hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:text-text-muted/60 active:scale-95 duration-200"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function KeypadButton({ digit, onClick, disabled, primaryColor }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-transparent hover:bg-white/5 active:bg-white/10 transition-colors overflow-hidden group"
    >
      <span className="relative z-10 text-3xl sm:text-4xl font-light font-serif text-text/85 group-hover:text-text transition-colors">
        {digit}
      </span>
      <div 
        className="absolute inset-0 opacity-0 group-active:opacity-[0.15] transition-opacity"
        style={{ backgroundColor: primaryColor }}
      />
    </motion.button>
  );
}
