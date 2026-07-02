'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ── Animated Hourglass SVG ────────────────────────────────────────
function AnimatedHourglass() {
  return (
    <motion.div
      animate={{ rotate: [0, 0, 180, 180, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.5, 0.9, 1] }}
    >
      <svg width="40" height="40" viewBox="0 0 120 120" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="hourglassGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur1"/>
            <feGaussianBlur stdDeviation="10" result="blur2"/>
            <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#hourglassGlow)">
          {/* Top bar */}
          <line x1="30" y1="15" x2="90" y2="15" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Bottom bar */}
          <line x1="30" y1="105" x2="90" y2="105" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Glass body */}
          <path
            d="M35 15 C35 15, 35 45, 60 58 C85 45, 85 15, 85 15"
            stroke="var(--color-particle)" strokeWidth="1.5" fill="var(--color-accent)" fillOpacity="0.08" strokeLinecap="round"
          />
          <path
            d="M35 105 C35 105, 35 75, 60 62 C85 75, 85 105, 85 105"
            stroke="var(--color-particle)" strokeWidth="1.5" fill="var(--color-accent)" fillOpacity="0.12" strokeLinecap="round"
          />
          {/* Sand stream */}
          <motion.line
            x1="60" y1="58" x2="60" y2="80"
            stroke="var(--color-accent)" strokeWidth="1" strokeLinecap="round"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Center sparkle */}
          <motion.circle
            cx="60" cy="60" r="2" fill="var(--color-text)"
            animate={{ scale: [1, 2, 1], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          />
        </g>
      </svg>
    </motion.div>
  );
}

// ── Single Time Unit Card ─────────────────────────────────────────
function TimeCard({ value, label, delay }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: '80px',
          height: '90px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 30px color-mix(in srgb, var(--color-accent) 4%, transparent)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 pointer-events-none"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)', borderLeft: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
        />
        <div className="absolute top-0 right-0 w-3 h-3 pointer-events-none"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
        />
        <div className="absolute bottom-0 left-0 w-3 h-3 pointer-events-none"
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)', borderLeft: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
        />

        <span className="font-serif text-3xl md:text-4xl text-text font-light tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-3 font-sans text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-text-muted/70">
        {label}
      </span>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function TimeSection({ timeTitle, timeSubtitle, timeStartDate }) {
  const [elapsed, setElapsed] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!timeStartDate) return;
    
    // Normalize to prevent UTC shift. 'YYYY-MM-DD' becomes local midnight
    let normalizedStartDate = timeStartDate;
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedStartDate)) {
      normalizedStartDate += 'T00:00:00';
    }

    const tick = () => {
      const now = new Date();
      const startDate = new Date(normalizedStartDate);
      const diff = now.getTime() - startDate.getTime();
      
      const isCountdown = diff < 0;
      const targetDiff = Math.abs(diff);

      const seconds = Math.floor((targetDiff / 1000) % 60);
      const minutes = Math.floor((targetDiff / 60000) % 60);
      const hours   = Math.floor((targetDiff / 3600000) % 24);

      let years = 0;
      let months = 0;
      let days = 0;

      if (isCountdown) {
        years = startDate.getFullYear() - now.getFullYear();
        months = startDate.getMonth() - now.getMonth();
        days = startDate.getDate() - now.getDate();

        const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
        const startMs = startDate.getHours() * 3600000 + startDate.getMinutes() * 60000 + startDate.getSeconds() * 1000 + startDate.getMilliseconds();

        if (startMs < nowMs) {
          days -= 1;
        }

        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
          days += prevMonth.getDate();
        }

        if (months < 0) {
          years -= 1;
          months += 12;
        }
      } else {
        years = now.getFullYear() - startDate.getFullYear();
        months = now.getMonth() - startDate.getMonth();
        days = now.getDate() - startDate.getDate();

        const startMs = startDate.getHours() * 3600000 + startDate.getMinutes() * 60000 + startDate.getSeconds() * 1000 + startDate.getMilliseconds();
        const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();

        if (nowMs < startMs) {
          days -= 1;
        }

        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days += prevMonth.getDate();
        }

        if (months < 0) {
          years -= 1;
          months += 12;
        }
      }

      setElapsed({ years, months, days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeStartDate]);

  const units = [
    { label: 'Years',   value: elapsed.years },
    { label: 'Months',  value: elapsed.months },
    { label: 'Days',    value: elapsed.days },
    { label: 'Hours',   value: elapsed.hours },
    { label: 'Minutes', value: elapsed.minutes },
    { label: 'Seconds', value: elapsed.seconds },
  ];

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
      <motion.div
        className="relative flex flex-col items-center gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Animated Hourglass */}
        <motion.div variants={itemVariants}>
          <AnimatedHourglass />
        </motion.div>

        {/* Pre-title */}
        <motion.span variants={itemVariants} className="font-serif italic text-sm md:text-base tracking-widest text-text-muted lowercase">
          {timeSubtitle || 'and counting...'}
        </motion.span>

        {/* 2-line Headline — same pattern as Hero/Closing */}
        <motion.h2 variants={itemVariants} className="flex flex-col gap-1 md:gap-2">
          <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">
            {timeTitle || 'Time Together'}
          </span>
        </motion.h2>

        {/* Time Cards Grid */}
        <div className="mt-10 grid grid-cols-3 gap-4 md:gap-6">
          {units.map((u, i) => (
            <TimeCard key={u.label} value={u.value} label={u.label} delay={0.1 * i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
