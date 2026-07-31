'use client';

import { motion } from 'framer-motion';

/**
 * LockedSection — Premium content gate wrapper.
 * When isLocked=true: renders children with blur + dark overlay + lock icon.
 * When isLocked=false: renders children normally (zero overhead).
 */
export default function LockedSection({ isLocked, label, children }) {
  if (!isLocked) return children;

  return (
    <div className="relative">
      {/* Blurred children */}
      <div
        style={{
          filter: 'blur(7px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.55,
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center z-20"
        style={{ pointerEvents: 'none' }}
      >
        {/* Glassmorphism pill */}
        <div
          style={{
            background: 'rgba(10, 6, 12, 0.72)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(225, 29, 72, 0.22)',
            borderRadius: '20px',
            padding: '20px 28px',
            maxWidth: '280px',
            textAlign: 'center',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 24px rgba(225,29,72,0.1)',
          }}
        >
          {/* Animated lock icon */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(225,29,72,0.8)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </motion.div>

          {/* Label */}
          <p
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontStyle: 'italic',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.5,
              marginBottom: '6px',
            }}
          >
            {label || 'Konten ini tersembunyi'}
          </p>

          {/* CTA */}
          <p
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.68rem',
              color: 'rgba(225, 29, 72, 0.75)',
              letterSpacing: '0.03em',
            }}
          >
            Hubungi admin untuk unlock kado lengkap
          </p>
        </div>
      </motion.div>
    </div>
  );
}
