'use client';

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from '@/components/GateScreen';
import RevealAnimation from '@/components/RevealAnimation';
import AmbientParticles from '@/components/AmbientParticles';
import HeroSection from '@/components/HeroSection';
import IntroSection from '@/components/IntroSection';
import ReasonCards from '@/components/ReasonCards';
import SeasonsSection from '@/components/SeasonsSection';
import MusicPlayer from '@/components/MusicPlayer';
import Gallery from '@/components/Gallery';
import ClosingSection from '@/components/ClosingSection';
import { themes, defaultTheme } from '@/lib/themes';

export default function GiftPage({ data }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleGateOpen = useCallback(() => {
    setIsRevealing(true);
    // Attempt to play music on user interaction (iOS autoplay policy)
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Audio play failed, user can manually play later
        console.log('Autoplay blocked, user can play manually');
      });
    }
  }, []);

  const handleRevealComplete = useCallback(() => {
    setIsRevealing(false);
    setGateOpen(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isPlaying]);

  const currentThemeId = data.theme || defaultTheme;
  const t = themes[currentThemeId] || themes[defaultTheme];
  
  const themeStyles = {
    '--color-bg': t.bg,
    '--color-surface': t.surface,
    '--color-text': t.text,
    '--color-text-muted': t.textMuted,
    '--color-accent': t.accent,
    '--color-particle': t.particle,
  };

  return (
    <main className="relative min-h-screen bg-bg text-text selection:bg-accent/30 font-sans overflow-hidden" style={themeStyles}>
      {/* Audio element — always mounted */}
      <audio ref={audioRef} src={data.music.file} loop preload="auto" />

      {/* Gate Screen */}
      <AnimatePresence mode="wait">
        {!gateOpen && !isRevealing && (
          <GateScreen
            gateSubtitle={data.gateSubtitle}
            onOpen={handleGateOpen}
          />
        )}
      </AnimatePresence>

      {/* Reveal Animation */}
      <RevealAnimation
        isRevealing={isRevealing}
        onComplete={handleRevealComplete}
      />

      {/* Main Content */}
      <AnimatePresence>
        {gateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Ambient Particles */}
            <AmbientParticles active={gateOpen} />

            {/* Content Sections */}
            <HeroSection
              heroPreTitle={data.heroPreTitle}
              heroLine1={data.heroLine1}
              heroLine2={data.heroLine2}
              heroSubtitle={data.heroSubtitle}
            />

            <IntroSection 
              introIcons={data.introIcons}
              introPreTitle={data.introPreTitle}
              introHeadline1={data.introHeadline1}
              introHeadline2={data.introHeadline2}
              introHeadline3={data.introHeadline3}
              introText={data.introText} 
              introSignOff={data.introSignOff} 
            />

            <ReasonCards 
              reasons={data.reasons} 
              reasonsTitle1={data.reasonsTitle1}
              reasonsTitle2={data.reasonsTitle2}
            />

            {data.seasons && (
              <SeasonsSection 
                seasons={data.seasons} 
                seasonsTitle1={data.seasonsTitle1}
                seasonsTitle2={data.seasonsTitle2}
                seasonsHint={data.seasonsHint}
              />
            )}

            <Gallery 
              photos={data.photos} 
              galleryTitle1={data.galleryTitle1}
              galleryTitle2={data.galleryTitle2}
            />

            <ClosingSection
              closingLine={data.closingLine}
              sender={data.sender}
              secretPhoto={data.secretPhoto}
              secretCaption={data.secretCaption}
              closingPreTitle={data.closingPreTitle}
              closingTitle1={data.closingTitle1}
              closingTitle2={data.closingTitle2}
              closingParagraph={data.closingParagraph}
              celebrateBtnText={data.celebrateBtnText}
            />

            {/* Music Player */}
            <MusicPlayer
              music={data.music}
              isPlaying={isPlaying}
              onToggle={handleTogglePlay}
              audioRef={audioRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
