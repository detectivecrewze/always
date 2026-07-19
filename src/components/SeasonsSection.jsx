'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEASON_ICONS } from './SeasonIcons';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Default keys for backward compatibility
const FALLBACK_KEYS = ['spring', 'summer', 'autumn', 'winter'];

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

export default function SeasonsSection({ seasons, seasonsTitle1, seasonsTitle2, seasonsHint }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleCardClick = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="relative z-10 py-16 px-6 overflow-hidden">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        
        <motion.div 
          className="flex flex-col items-center mb-12 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="flex flex-col gap-2 md:gap-3">
            <motion.span variants={itemVariants} className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">
              {seasonsTitle1 || 'A Love For'}
            </motion.span>
            <motion.span variants={itemVariants} className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">
              {seasonsTitle2 || 'Every Season'}
            </motion.span>
          </h2>

          <motion.p
            variants={itemVariants}
            className="mt-8 font-serif italic text-sm md:text-base text-text-muted flex items-center gap-2"
          >
            <span className="text-accent">✨</span> {seasonsHint || 'tap each card to discover its meaning'} <span className="text-accent">✨</span>
          </motion.p>
          
          <motion.div variants={itemVariants} className="md:hidden mt-3 text-text-muted flex items-center justify-center gap-2 text-xs uppercase tracking-widest opacity-60">
            <span>Swipe</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full flex md:grid md:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {seasons.map((season, idx) => {
            const isExpanded = expandedIndex === idx;
            const isOtherExpanded = expandedIndex !== null && expandedIndex !== idx;
            
            // Get the icon key (default to the original 4 seasons if not set)
            const iconKey = season.icon || FALLBACK_KEYS[idx % 4];
            const iconConfig = SEASON_ICONS[iconKey];
            const isEmoji = !iconConfig;
            const SVGIcon = !isEmoji ? iconConfig.component : null;
            const strokeColor = !isEmoji ? iconConfig.defaultColor : null;

            return (
              <motion.div
                key={idx}
                variants={cardAnim}
                layout
                onClick={() => handleCardClick(idx)}
                className="flex-shrink-0 w-[160px] md:w-auto md:flex-1 cursor-pointer snap-start rounded-[1.25rem] flex flex-col items-center text-center p-6"
                style={{
                  minHeight: '200px',
                  backgroundColor: isExpanded ? 'color-mix(in srgb, var(--color-text) 8%, transparent)' : 'color-mix(in srgb, var(--color-text) 3%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
                animate={{
                  opacity: isOtherExpanded ? 0.4 : 1,
                  scale: isOtherExpanded ? 0.97 : 1,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <motion.div layout="position" className="mb-4">
                  {isEmoji ? (
                    <span className="text-3xl">{season.icon}</span>
                  ) : (
                    <SVGIcon color={strokeColor} />
                  )}
                </motion.div>
                
                <motion.h3 layout="position" className="font-serif font-bold text-base text-text mb-1">
                  {season.name}
                </motion.h3>
                
                <motion.p layout="position" className="font-sans text-xs italic text-text-muted">
                  {season.teaser}
                </motion.p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden flex flex-col items-center w-full"
                    >
                      <div className="w-[40px] h-[1px] bg-accent/50 my-4" />
                      <p className="font-serif italic text-sm text-text-muted leading-relaxed">
                        {season.message}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
