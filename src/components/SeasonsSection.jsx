'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// SVGs
const SpringSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#B5C9A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 44V20M24 32C18 32 14 26 14 20C18 20 24 24 24 32ZM24 28C30 28 34 20 34 14C30 14 24 20 24 28Z" />
  </svg>
);

const SummerSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#E8C88A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="8" fill="#E8C88A" fillOpacity="0.2" />
    <path d="M24 6V10M24 38V42M6 24H10M38 24H42M11.27 11.27L14.1 14.1M33.9 33.9L36.73 36.73M11.27 36.73L14.1 33.9M33.9 11.27L36.73 14.1" />
  </svg>
);

const AutumnSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 40C24 40 12 34 12 20C12 12 24 6 24 6C24 6 36 12 36 20C36 34 24 40 24 40Z" fill="#C9956A" fillOpacity="0.2" />
    <path d="M24 40V16" />
  </svg>
);

const WinterSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#A8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 6V42M6 24H42M11.27 11.27L36.73 36.73M11.27 36.73L36.73 11.27" />
    <circle cx="24" cy="24" r="4" fill="#A8C4D4" fillOpacity="0.2" />
  </svg>
);

const svgsList = [SpringSVG, SummerSVG, AutumnSVG, WinterSVG];

export default function SeasonsSection({ seasons, seasonsTitle1, seasonsTitle2, seasonsHint }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleCardClick = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="relative z-10 py-16 px-6 overflow-hidden">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col gap-2 md:gap-3"
          >
            <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-text leading-tight">
              {seasonsTitle1 || 'A Love For'}
            </span>
            <span className="block font-serif italic text-5xl md:text-6xl lg:text-7xl text-accent leading-tight">
              {seasonsTitle2 || 'Every Season'}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 font-serif italic text-sm md:text-base text-text-muted flex items-center gap-2"
          >
            <span className="text-accent">✨</span> {seasonsHint || 'tap each season to discover its meaning'} <span className="text-accent">✨</span>
          </motion.p>
        </div>

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
            const SVGIcon = svgsList[idx % 4];

            return (
              <motion.div
                key={idx}
                variants={cardAnim}
                layout
                onClick={() => handleCardClick(idx)}
                className="flex-shrink-0 w-[160px] md:w-auto md:flex-1 cursor-pointer snap-start rounded-[1.25rem] border border-white/10 flex flex-col items-center text-center p-6"
                style={{
                  minHeight: '200px',
                  backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(12px)',
                }}
                animate={{
                  opacity: isOtherExpanded ? 0.4 : 1,
                  scale: isOtherExpanded ? 0.97 : 1,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <motion.div layout="position" className="mb-4">
                  <SVGIcon />
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
