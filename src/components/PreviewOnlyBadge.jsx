'use client';

import { motion } from 'framer-motion';

export default function PreviewOnlyBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '999px',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Lock icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
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
          fontWeight: '600',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.02em',
        }}>
          Preview Only
        </span>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>•</span>

        {/* Subtitle */}
        <span style={{
          fontSize: '11px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.01em',
        }}>
          Hubungi tim untuk unlock kado
        </span>
      </div>
    </motion.div>
  </div>
);
}
