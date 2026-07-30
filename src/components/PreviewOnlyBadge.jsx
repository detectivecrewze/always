'use client';

import { motion } from 'framer-motion';

export default function PreviewOnlyBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none w-max max-w-[90vw]">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '999px',
            background: 'rgba(15, 15, 20, 0.78)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Lock icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          {/* Preview Only */}
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '0.03em',
          }}>
            Preview Only
          </span>

          {/* Divider */}
          <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '12px' }}>•</span>

          {/* Subtitle */}
          <span style={{
            fontSize: '11px',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.75)',
            letterSpacing: '0.01em',
          }}>
            Hubungi tim untuk unlock kado
          </span>
        </div>
      </motion.div>
    </div>
  );
}
