'use client';

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from '@/components/GateScreen';

import AmbientParticles from '@/components/AmbientParticles';
import HeroSection from '@/components/HeroSection';
import TimeSection from '@/components/TimeSection';
import IntroSection from '@/components/IntroSection';
import ReasonCards from '@/components/ReasonCards';
import SeasonsSection from '@/components/SeasonsSection';
import MusicPlayer from '@/components/MusicPlayer';
import Gallery from '@/components/Gallery';
import ClosingSection from '@/components/ClosingSection';
import { themes, defaultTheme } from '@/lib/themes';

export default function GiftPage({ data }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleInteraction = useCallback(() => {
    // Optional: unlock audio context on iOS
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  const handleGateFinish = useCallback(() => {
    setGateOpen(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log('Autoplay blocked, user can play manually');
      });
    }
  }, [isPlaying]);

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
      {/* Audio element — always mounted if music exists */}
      {data.music?.file && <audio ref={audioRef} src={data.music.file} loop preload="auto" />}

      {/* Gate Screen */}
      <AnimatePresence mode="wait">
        {!gateOpen && (
          <GateScreen
            gateSubtitle={data.gateSubtitle}
            onInteraction={handleInteraction}
            onOpen={handleGateFinish}
            themeColors={[t.particle, t.accent, t.textMuted]}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {gateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Ambient Particles */}
            <AmbientParticles active={gateOpen} themeColors={[t.particle, t.accent, t.textMuted]} />

            {/* Content Sections */}
            <HeroSection
              heroPreTitle={data.heroPreTitle}
              heroLine1={data.heroLine1}
              heroLine2={data.heroLine2}
              heroSubtitle={data.heroSubtitle}
            />

            {data.timeEnabled && (
              <TimeSection
                timeTitle={data.timeTitle}
                timeSubtitle={data.timeSubtitle}
                timeStartDate={data.timeStartDate}
              />
            )}

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
              onCinemaToggle={(isOpen) => {
                if (!audioRef.current) return;
                const isVideo = data.secretPhoto && /\.(mp4|webm|mov)$/i.test(data.secretPhoto);
                if (!isVideo) return; // Keep music playing if it's just a photo
                
                if (isOpen) {
                  audioRef.current.pause();
                } else if (isPlaying) {
                  audioRef.current.play().catch(()=>{});
                }
              }}
            />

            {/* Music Player */}
            {data.music?.file && (
              <MusicPlayer
                music={data.music}
                isPlaying={isPlaying}
                onToggle={handleTogglePlay}
                audioRef={audioRef}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
