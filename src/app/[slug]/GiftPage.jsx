'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from '@/components/GateScreen';
import PinGateScreen from '@/components/PinGateScreen';

import AmbientParticles from '@/components/AmbientParticles';
import HeroSection from '@/components/HeroSection';
import TimeSection from '@/components/TimeSection';
import IntroSection from '@/components/IntroSection';
import ReasonCards from '@/components/ReasonCards';
import SeasonsSection from '@/components/SeasonsSection';
import CircleWishesSection from '@/components/CircleWishesSection';
import MusicPlayer from '@/components/MusicPlayer';
import Gallery from '@/components/Gallery';
import ClosingSection from '@/components/ClosingSection';
import PreviewOnlyBadge from '@/components/PreviewOnlyBadge';
import LockedSection from '@/components/LockedSection';
import { themes, defaultTheme } from '@/lib/themes';

// Runtime normalization: fix audio wishes where photoUrl was incorrectly set to audioUrl
// This handles data saved before the fix, without requiring a re-sync in Studio
function normalizeCircleWishes(wishes) {
  if (!wishes || !Array.isArray(wishes)) return wishes;
  return wishes.map((w) => {
    const isAudioWish = w.mediaType === 'audio' || Boolean(w.audioUrl);
    if (!isAudioWish) return w;

    const audioUrl = (w.audioUrl || w.mediaUrl || '').trim();
    // If photoUrl is the same as audioUrl (or contains audio extension), clear it
    const isPhotoUrlActuallyAudio = w.photoUrl && w.photoUrl === audioUrl;
    const photoUrl = isPhotoUrlActuallyAudio ? '' : (w.photoUrl || '');

    return { ...w, audioUrl, mediaUrl: audioUrl, photoUrl };
  });
}

export default function GiftPage({ data }) {
  const searchParams = useSearchParams();
  const isStudioMode = searchParams.get('studio') === '1';
  // Preview mode: partial payment — some sections are locked
  const isPreview = !isStudioMode && data.paymentStatus === 'partial';

  const [pinUnlocked, setPinUnlocked] = useState(!data.pinEnabled || isStudioMode);
  const [gateOpen, setGateOpen] = useState(isStudioMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const wasMusicPlayingBeforeWishVideoRef = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  const handleInteraction = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log('Autoplay blocked, user can play manually');
      });
    }
  }, [isPlaying]);

  const handleGateFinish = useCallback(() => {
    setGateOpen(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.volume = 0.5;
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
      wasMusicPlayingBeforeWishVideoRef.current = false;
    } else {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isPlaying]);

  const handleWishVideoAudioChange = useCallback((isActive) => {
    if (!audioRef.current) return;

    if (isActive) {
      // Pause background music if it was playing
      if (isPlaying || !audioRef.current.paused) {
        wasMusicPlayingBeforeWishVideoRef.current = true;
        audioRef.current.pause();
      }
    } else {
      // Resume background music only if it was playing before unmuting
      if (wasMusicPlayingBeforeWishVideoRef.current && isPlaying) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {});
        wasMusicPlayingBeforeWishVideoRef.current = false;
      }
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
      {/* Audio element — always mounted if music exists with default 50% volume */}
      {data.music?.file && (
        <audio
          ref={(el) => {
            audioRef.current = el;
            if (el) el.volume = 0.5;
          }}
          src={data.music.file}
          loop
          preload="auto"
        />
      )}

      {/* PIN Gate Screen (Optional) */}
      <AnimatePresence mode="wait">
        {data.pinEnabled && !pinUnlocked && (
          <PinGateScreen
            pinCode={data.pinCode || ''}
            pinHint={data.pinHint || ''}
            recipientName={data.recipient || ''}
            themeColors={[t.particle, t.accent, t.textMuted]}
            onUnlock={() => setPinUnlocked(true)}
          />
        )}
      </AnimatePresence>

      {/* Gate Screen */}
      <AnimatePresence mode="wait">
        {pinUnlocked && !gateOpen && (
          <GateScreen
            themeName={data.theme}
            gateSubtitle={data.gateSubtitle}
            disableFountain={data.disableFountain ?? false}
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
                timeZone={data.timeZone}
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
              isLocked={isPreview}
            />


            <ReasonCards 
              reasons={data.reasons} 
              reasonsTitle1={data.reasonsTitle1}
              reasonsTitle2={data.reasonsTitle2}
              reasonsHintTap={data.reasonsHintTap}
              reasonsHintAll={data.reasonsHintAll}
              freeCount={isPreview ? 2 : undefined}
            />

            {(data.seasonsEnabled !== undefined ? data.seasonsEnabled : Boolean(data.seasons && data.seasons.length > 0)) && data.seasons && data.seasons.length > 0 && (
              <SeasonsSection 
                seasons={data.seasons} 
                seasonsTitle1={data.seasonsTitle1}
                seasonsTitle2={data.seasonsTitle2}
                seasonsHint={data.seasonsHint}
              />
            )}

            {(data.circleWishesEnabled !== undefined ? data.circleWishesEnabled : Boolean(data.circleWishes && data.circleWishes.length > 0)) && data.circleWishes && data.circleWishes.length > 0 && (
              <CircleWishesSection
                wishes={normalizeCircleWishes(data.circleWishes)}
                recipient={data.recipient}
                moment={data.moment}
                circleTitle1={data.circleTitle1}
                circleTitle2={data.circleTitle2}
                circleSubtitle={data.circleSubtitle}
                onVideoAudioChange={handleWishVideoAudioChange}
              />
            )}

            {(data.galleryEnabled !== undefined ? data.galleryEnabled : Boolean(data.photos && data.photos.length > 0)) && data.photos && data.photos.length > 0 && (
              <Gallery 
                photos={data.photos} 
                galleryTitle1={data.galleryTitle1}
                galleryTitle2={data.galleryTitle2}
                freeCount={isPreview ? 2 : undefined}
              />
            )}

            <ClosingSection
              closingLine={data.closingLine}
              sender={data.sender}
              secretPhoto={isPreview ? null : data.secretPhoto}
              secretCaption={data.secretCaption}
              secretVideoMuted={data.secretVideoMuted ?? false}
              closingPreTitle={data.closingPreTitle}
              closingTitle1={data.closingTitle1}
              closingTitle2={data.closingTitle2}
              closingParagraph={data.closingParagraph}
              celebrateBtnText={data.celebrateBtnText}
              isLocked={isPreview}
              onCinemaToggle={(isOpen) => {
                if (!audioRef.current) return;
                const isVideo = data.secretPhoto && /\.(mp4|webm|mov)$/i.test(data.secretPhoto);
                if (!isVideo || data.secretVideoMuted) return;
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

      {/* Preview Only Badge — shown when payment is not complete */}
      {gateOpen && data.paymentStatus === 'partial' && (
        <PreviewOnlyBadge />
      )}
    </main>
  );
}
