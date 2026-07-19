'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import playlistData from '../../playlist.json';

const TABS = ['Theme', 'Opening', 'Hero', 'Time', 'Letter', 'Reasons', 'Seasons', 'Gallery', 'Music', 'Closing'];

// ── Styles ────────────────────────────────────────────────────────
const S = {
  sideHeader: { padding: '1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '1rem', fontWeight: 400 },
  dot: { color: '#E11D48' },
  backBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #262626' },
  saveBtn: (saving) => ({
    width: '100%', padding: '0.6rem', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
    background: saving ? '#333' : 'linear-gradient(135deg, #E11D48, #9D174D)', color: '#fff',
  }),
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', flexShrink: 0 },
  topTitle: { fontSize: '0.9rem', fontWeight: 600 },
  statusPill: (color) => ({
    fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: `${color}15`, color, border: `1px solid ${color}30`,
  }),
  previewHeader: { padding: '0.5rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  previewLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555' },
  iframe: { flex: 1, border: 'none', width: '100%' },
  label: { display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', marginBottom: '0.4rem', marginTop: '1rem' },
  input: { width: '100%', padding: '0.6rem 0.75rem', background: '#0f0f0f', border: '1px solid #222', borderRadius: '6px', color: '#f5f5f5', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.6rem 0.75rem', background: '#0f0f0f', border: '1px solid #222', borderRadius: '6px', color: '#f5f5f5', fontSize: '0.8rem', outline: 'none', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', marginTop: '0.5rem' },
  sectionDesc: { fontSize: '0.7rem', color: '#555', marginBottom: '1rem' },
  smallBtn: (color = '#888') => ({
    background: 'none', border: `1px solid ${color}30`, borderRadius: '6px', color, fontSize: '0.7rem', padding: '0.3rem 0.7rem', cursor: 'pointer', transition: 'all 0.15s',
  }),
  uploadBox: { border: '2px dashed #262626', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', marginTop: '0.5rem' },
  uploadThumb: { width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #333' },
  cardWrap: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' },
};

// ── Theme Tab ───────────────────────────────────────────────────────
function TabTheme({ data, set }) {
  const currentTheme = data.theme || 'classic-light';
  
  // We redefine the palettes locally for the UI preview
  const palettes = {
    'vintage-burgundy': { name: 'Vintage Burgundy', bg: '#2D141E', accent: '#E2859B' },
    'classic-light':    { name: 'Classic Light',    bg: '#FDFAF5', accent: '#B07D4E' },
    'midnight-rose':    { name: 'Midnight Rose',    bg: '#0A0408', accent: '#E84D72' },
    'ocean-breeze':     { name: 'Ocean Breeze',     bg: '#071520', accent: '#4FB8D8' },
    'blush-pink':       { name: 'Blush Pink',       bg: '#2A0D18', accent: '#F472B6' },
    'midnight-blue':    { name: 'Midnight Blue',    bg: '#050C1A', accent: '#C9A84C' },
    'velvet-purple':    { name: 'Velvet Purple',    bg: '#120818', accent: '#A855F7' },
  };

  return (<>
    <div style={S.sectionTitle}>Visual Theme</div>
    <div style={S.sectionDesc}>Choose the color palette for this gift.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
      {Object.entries(palettes).map(([id, info]) => {
        const isActive = currentTheme === id;
        return (
          <button
            key={id}
            onClick={() => set('theme', id)}
            style={{
              background: '#111',
              border: isActive ? `2px solid ${info.accent}` : '1px solid #262626',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: info.bg,
              border: `3px solid ${info.accent}`, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
            }} />
            <span style={{ color: isActive ? '#fff' : '#888', fontSize: '0.75rem', fontWeight: isActive ? 600 : 400 }}>
              {info.name}
            </span>
          </button>
        );
      })}
    </div>
  </>);
}

// ── Field Components ──────────────────────────────────────────────
function Field({ label, value, onChange, multiline, placeholder }) {
  return (
    <>
      <label style={S.label}>{label}</label>
      {multiline ? (
        <textarea style={S.textarea} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input style={S.input} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', cursor: 'pointer', padding: '12px 14px',
        background: value ? 'rgba(139,92,246,0.08)' : '#111',
        border: `1px solid ${value ? '#8B5CF6' : '#1f1f1f'}`,
        borderRadius: '10px', marginBottom: '10px', userSelect: 'none',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: value ? '#a78bfa' : '#aaa', marginBottom: '2px' }}>{label}</div>
        {desc && <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.4 }}>{desc}</div>}
      </div>
      <div style={{
        width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0,
        background: value ? '#8B5CF6' : '#2a2a2a',
        border: `1px solid ${value ? '#8B5CF6' : '#333'}`,
        position: 'relative', transition: 'background 0.2s'
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '20px' : '3px',
          width: '14px', height: '14px', borderRadius: '50%',
          background: value ? '#fff' : '#555',
          transition: 'left 0.2s, background 0.2s'
        }} />
      </div>
    </div>
  );
}

function FileUpload({ label, slug, currentUrl, onUploaded, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Reset input to allow re-selecting the same file if needed
    if (!file) return;
    setUploading(true);
    setSuccess(false);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', slug);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onUploaded(data.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {currentUrl ? (
          <div style={{ position: 'relative' }}>
            {/\.(mp4|webm|mov)$/i.test(currentUrl) ? (
              <video src={currentUrl} style={{ ...S.uploadThumb, objectFit: 'cover' }} muted playsInline preload="metadata" />
            ) : /\.(mp3|wav|ogg|m4a)$/i.test(currentUrl) ? (
              <div style={{ ...S.uploadThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#262626', fontSize: '1.2rem' }}>🎵</div>
            ) : (
              <img src={currentUrl} alt="" style={S.uploadThumb} onError={(e) => e.target.style.display='none'} />
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
                style={{
                  position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                  borderRadius: '50%', background: '#EF4444', color: 'white', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: 'none',
                  cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 10
                }}
              >
                ✕
              </button>
            )}
          </div>
        ) : null}
        <label style={{ 
          ...S.uploadBox, 
          flex: 1, 
          fontSize: '0.75rem', 
          color: success ? '#22c55e' : '#555', 
          borderColor: success ? '#22c55e' : '#262626',
          position: 'relative' 
        }}>
          {uploading ? 'Uploading...' : success ? '✓ Upload Successful!' : 'Click to upload'}
          <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleFile} accept="image/*,video/*,audio/*" />
        </label>
      </div>
    </div>
  );
}

// ── Tab Panels ────────────────────────────────────────────────────

// ── Preset UI Helper ─────────────────────────────────────────────
function PresetGrid({ presets, currentId, onApply }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {presets.map((preset) => {
        const isActive = currentId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onApply(preset)}
            className={`rounded-xl p-4 text-left transition-all border-2 ${
              isActive
                ? 'border-[#E11D48] bg-[#E11D48]/10 shadow-[0_0_20px_rgba(225,29,72,0.15)]'
                : 'border-[#222] bg-[#111] hover:border-[#444]'
            }`}
          >
            <div className="text-base mb-1">{preset.name}</div>
            <div className={`text-[0.65rem] ${isActive ? 'text-[#F472B6]' : 'text-[#666]'}`}>{preset.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Opening Presets ──────────────────────────────────────────────
const OPENING_PRESETS = [
  { id: 'romantic', name: '💌 Romantic', desc: 'A gift for someone special', subtitle: 'something made just for you' },
  { id: 'birthday', name: '🎂 Birthday', desc: 'Happy birthday surprise', subtitle: 'happy birthday, my love' },
  { id: 'anniversary', name: '💍 Anniversary', desc: 'Celebrating your love', subtitle: 'for the love of my life' },
  { id: 'justbecause', name: '✨ Just Because', desc: 'No occasion needed', subtitle: 'because you deserve this' },
];

function TabOpening({ data, set }) {
  const currentPreset = OPENING_PRESETS.find(p => p.subtitle === data.gateSubtitle)?.id || null;

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Quick-start with a subtitle template.</div>
    <PresetGrid
      presets={OPENING_PRESETS}
      currentId={currentPreset}
      onApply={(preset) => set('gateSubtitle', preset.subtitle)}
    />
    <div className="w-full h-px bg-[#1a1a1a] mb-4" />
    <div style={S.sectionTitle}>Gate Screen</div>
    <div style={S.sectionDesc}>The first thing visitors see before entering.</div>
    <Field label="Gate Subtitle" value={data.gateSubtitle} onChange={(v) => set('gateSubtitle', v)} placeholder="a gift for someone special" />
    <div className="w-full h-px bg-[#1a1a1a] my-4" />
    <div style={S.sectionTitle}>Flower Animation</div>
    <div style={S.sectionDesc}>Control the fountain flower animation when the gift box is tapped.</div>
    <Toggle
      label="🌸 Nonaktifkan Animasi Bunga"
      desc="Saat kado dibuka, langsung masuk ke halaman gift tanpa animasi bunga."
      value={data.disableFountain ?? false}
      onChange={(v) => set('disableFountain', v)}
    />
  </>);
}

// ── Hero Presets ─────────────────────────────────────────────────
const HERO_PRESETS = [
  { id: 'bloom', name: '🌸 In Bloom', desc: 'A love letter in bloom', preTitle: 'a love letter in bloom', line1: 'For You,', line2: 'My Everything', subtitle: 'Every petal holds a whisper of how much you mean to me.' },
  { id: 'stars', name: '🌙 Starlit', desc: 'Written under the stars', preTitle: 'written under the stars', line1: 'To The One', line2: 'Who Holds My Heart', subtitle: 'Every star in the sky reminds me of a reason I love you.' },
  { id: 'ocean', name: '🌊 Deep as the Ocean', desc: 'An ocean of feelings', preTitle: 'an ocean of feelings', line1: 'My Love,', line2: 'My Safe Harbor', subtitle: 'In the vastness of everything, you are my calm and my depth.' },
  { id: 'timeless', name: '⏳ Timeless', desc: 'Beyond time itself', preTitle: 'beyond time itself', line1: 'Forever,', line2: 'Begins With You', subtitle: 'Time stands still whenever I look into your eyes.' },
];

function TabHero({ data, set }) {
  const currentPreset = HERO_PRESETS.find(p => p.preTitle === data.heroPreTitle)?.id || null;

  const applyPreset = (preset) => {
    set('heroPreTitle', preset.preTitle);
    set('heroLine1', preset.line1);
    set('heroLine2', preset.line2);
    set('heroSubtitle', preset.subtitle);
  };

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Pick a hero theme to start.</div>
    <PresetGrid presets={HERO_PRESETS} currentId={currentPreset} onApply={applyPreset} />
    <div className="w-full h-px bg-[#1a1a1a] mb-4" />
    <div style={S.sectionTitle}>Hero Section</div>
    <div style={S.sectionDesc}>The big opening moment after the gate.</div>
    <Field label="Pre-title" value={data.heroPreTitle} onChange={(v) => set('heroPreTitle', v)} placeholder="to my dearest" />
    <Field label="Hero Line 1" value={data.heroLine1} onChange={(v) => set('heroLine1', v)} placeholder="Name," />
    <Field label="Hero Line 2" value={data.heroLine2} onChange={(v) => set('heroLine2', v)} placeholder="you are my everything." />
    <Field label="Subtitle" value={data.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} placeholder="scroll to unwrap your gift" />
  </>);
}

// ── Time Presets ─────────────────────────────────────────────────
const TIME_PRESETS = [
  { id: 'met', name: '🤝 First Met', desc: 'Since the day we met', subtitle: 'time since', title: 'We First Met' },
  { id: 'dating', name: '💘 Started Dating', desc: 'Since we became us', subtitle: 'days of', title: 'Loving You' },
  { id: 'wedding', name: '💍 Wedding Day', desc: 'Since we tied the knot', subtitle: 'happily', title: 'Ever After' },
  { id: 'together', name: '⏳ Time Together', desc: 'General time tracker', subtitle: 'time spent', title: 'Together' },
];

function TabTime({ data, set }) {
  const currentPreset = TIME_PRESETS.find(p => p.title === data.timeTitle)?.id || null;

  const applyPreset = (preset) => {
    set('timeTitle', preset.title);
    set('timeSubtitle', preset.subtitle);
    if (!data.timeEnabled) set('timeEnabled', true);
  };

  return (<>
    <div style={S.sectionTitle}>Time Counter</div>
    <div style={S.sectionDesc}>An aesthetic timer showing how long you've been together.</div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>Enable Section</div>
        <div style={{ fontSize: '0.75rem', color: '#888' }}>Show or hide this section on the live page</div>
      </div>
      <button 
        onClick={() => set('timeEnabled', !data.timeEnabled)}
        style={{
          width: '48px', height: '24px', borderRadius: '12px',
          background: data.timeEnabled ? '#22C55E' : '#333',
          position: 'relative', transition: 'all 0.2s'
        }}
      >
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px', left: data.timeEnabled ? '26px' : '2px',
          transition: 'all 0.2s'
        }} />
      </button>
    </div>

    <div className="w-full h-px bg-[#1a1a1a] mb-4" />

    <div style={{ opacity: data.timeEnabled ? 1 : 0.5, pointerEvents: data.timeEnabled ? 'auto' : 'none' }}>
      <div style={S.sectionTitle}>Choose a Preset</div>
      <PresetGrid presets={TIME_PRESETS} currentId={currentPreset} onApply={applyPreset} />
      
      <Field label="Start Date" value={data.timeStartDate || ''} onChange={(v) => set('timeStartDate', v)} placeholder="YYYY-MM-DD" />
      <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>Format: YYYY-MM-DD (e.g. 2022-02-14)</div>
      
      <Field label="Pre-title" value={data.timeSubtitle} onChange={(v) => set('timeSubtitle', v)} placeholder="days of" />
      <Field label="Main Title" value={data.timeTitle} onChange={(v) => set('timeTitle', v)} placeholder="Loving You" />
    </div>
  </>);
}

// ── Letter Presets ───────────────────────────────────────────────
const LETTER_PRESETS = [
  {
    id: 'classic', name: '💐 Classic Romance', desc: 'Traditional love letter',
    preTitle: 'from my heart', h1: 'You are my', h2: 'wildest dream', h3: 'come true.',
    text: [
      'In a world full of ordinary moments, you are the extraordinary one. The way you laugh, the way you care, the way you simply exist, it fills every corner of my world with something I never knew I needed.',
      'These flowers are not enough. No words ever could be. But they carry every unspoken feeling I hold for you, pressed between their petals like tiny love letters waiting to be found.'
    ],
    signOff: '- Always yours 🌹',
  },
  {
    id: 'poetic', name: '🖋️ Poetic Soul', desc: 'Lyrical and dreamy',
    preTitle: 'a poem for your soul', h1: 'In every', h2: 'quiet moment', h3: 'I find you.',
    text: [
      'If my love were a poem, it would have no ending, just verses that keep unfolding, each line softer than the last, each word a little closer to the truth of what you mean to me.',
      'You are not a chapter in my story. You are the space between every line, the pause that makes everything else make sense.'
    ],
    signOff: '- Written in starlight ✦',
  },
  {
    id: 'heartfelt', name: '🤍 Heartfelt & Honest', desc: 'Simple and sincere',
    preTitle: 'honestly, from me to you', h1: 'I just', h2: 'love you', h3: 'that\'s all.',
    text: [
      'I\'m not great with words, and maybe I don\'t always say it right. But you should know, every single day, in ways I can\'t always explain, you make my world better just by being in it.',
      'This is my way of telling you what I sometimes forget to say out loud: you are enough, you are loved, and you are the best thing that ever happened to me.'
    ],
    signOff: '- With all of me ❤️',
  },
  {
    id: 'nostalgic', name: '📷 Nostalgic Memory', desc: 'Looking back at your love story',
    preTitle: 'a letter through time', h1: 'Remember when', h2: 'it all began', h3: ', I do.',
    text: [
      'Do you remember the first time our eyes met? I didn\'t know it then, but that was the moment everything changed. The world didn\'t get louder, it got quieter, like it was making room for you.',
      'Every memory with you feels like a photograph I never want to lose. The laughter, the quiet moments, even the storms, they all led us here, and I wouldn\'t trade a single one.'
    ],
    signOff: '- From the beginning, until forever 🕰️',
  },
];

function TabLetter({ data, set }) {
  const paragraphs = Array.isArray(data.introText) ? data.introText : [data.introText || ''];
  const setPara = (idx, val) => {
    const next = [...paragraphs];
    next[idx] = val;
    set('introText', next);
  };
  const addPara = () => set('introText', [...paragraphs, '']);
  const removePara = (idx) => set('introText', paragraphs.filter((_, i) => i !== idx));

  const currentPreset = LETTER_PRESETS.find(p => p.preTitle === data.introPreTitle)?.id || null;

  const applyPreset = (preset) => {
    set('introPreTitle', preset.preTitle);
    set('introHeadline1', preset.h1);
    set('introHeadline2', preset.h2);
    set('introHeadline3', preset.h3);
    set('introText', [...preset.text]);
    set('introSignOff', preset.signOff);
  };

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Pick a writing style for the love letter.</div>
    <PresetGrid presets={LETTER_PRESETS} currentId={currentPreset} onApply={applyPreset} />
    <div className="w-full h-px bg-[#1a1a1a] mb-4" />
    <div style={S.sectionTitle}>Love Letter</div>
    <div style={S.sectionDesc}>The heartfelt letter section, styled like a candlelight note.</div>
    <Field label="Pre-title" value={data.introPreTitle} onChange={(v) => set('introPreTitle', v)} placeholder="from my heart" />
    <Field label="Headline 1" value={data.introHeadline1} onChange={(v) => set('introHeadline1', v)} placeholder="You are my" />
    <Field label="Headline 2 (accent)" value={data.introHeadline2} onChange={(v) => set('introHeadline2', v)} placeholder="wildest dream" />
    <Field label="Headline 3" value={data.introHeadline3} onChange={(v) => set('introHeadline3', v)} placeholder="come true." />
    <label style={S.label}>Body Paragraphs</label>
    {paragraphs.map((p, i) => (
      <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <textarea style={{ ...S.textarea, flex: 1, minHeight: '60px' }} value={p} onChange={(e) => setPara(i, e.target.value)} />
        {paragraphs.length > 1 && <button style={S.smallBtn('#EF4444')} onClick={() => removePara(i)}>×</button>}
      </div>
    ))}
    <button style={S.smallBtn('#22C55E')} onClick={addPara}>+ Add Paragraph</button>
    <Field label="Sign-off" value={data.introSignOff} onChange={(v) => set('introSignOff', v)} placeholder="with all my love" />
  </>);
}

// ── Reasons Presets ──────────────────────────────────────────────
const REASONS_PRESETS = [
  {
    id: 'qualities', name: '✦ Beautiful Qualities', desc: 'What makes them special',
    title1: 'The Reasons', title2: 'I Love You',
    cards: [
      { title: 'Your Laugh', desc: 'The sound that makes every room feel like home.' },
      { title: 'Your Patience', desc: 'How you wait for me even when I take too long.' },
      { title: 'Your Kindness', desc: 'The way you care without ever being asked.' },
      { title: 'Your Courage', desc: 'How you face the world even on the hardest days.' },
      { title: 'Your Warmth', desc: 'The feeling of being next to you on a quiet night.' },
      { title: 'Your Presence', desc: 'Just being with you is more than enough.' },
    ],
  },
  {
    id: 'moments', name: '📸 Precious Moments', desc: 'Memories that define your love',
    title1: 'Moments That', title2: 'Made Me Yours',
    cards: [
      { title: 'Our First Talk', desc: 'The conversation that changed everything.' },
      { title: 'Late Night Calls', desc: 'Hours of silence that somehow said everything.' },
      { title: 'The First Trip', desc: 'Getting lost together and finding ourselves.' },
      { title: 'That Rainy Day', desc: 'When we chose to stay instead of running.' },
      { title: 'Your Birthday', desc: 'Seeing you happy made the world make sense.' },
      { title: 'Right Now', desc: 'Because every moment with you is a reason.' },
    ],
  },
  {
    id: 'promises', name: '🤝 Promises', desc: 'Things you vow to always do',
    title1: 'I Promise', title2: 'To Always',
    cards: [
      { title: 'Listen First', desc: 'To hear your heart before I speak my mind.' },
      { title: 'Choose You', desc: 'Every morning, every argument, every time.' },
      { title: 'Make You Laugh', desc: 'Even when the world tries to make you cry.' },
      { title: 'Hold You Close', desc: 'On the good days, the bad days, and the quiet ones.' },
      { title: 'Be Honest', desc: 'Even when the truth is hard to say out loud.' },
      { title: 'Never Give Up', desc: 'On us, on you, on everything we\'ve built.' },
    ],
  },
  {
    id: 'gratitude', name: '🙏 Gratitude', desc: 'Things you\'re thankful for',
    title1: 'Thank You', title2: 'For Everything',
    cards: [
      { title: 'Your Trust', desc: 'For letting me into the parts of you no one sees.' },
      { title: 'Your Forgiveness', desc: 'For loving me through my worst days.' },
      { title: 'Your Dreams', desc: 'For sharing your future with me in it.' },
      { title: 'Your Effort', desc: 'For never giving up on what we have.' },
      { title: 'Your Love', desc: 'For choosing me when you could choose anyone.' },
      { title: 'Being You', desc: 'For being exactly who you are, nothing more, nothing less.' },
    ],
  },
];

function TabReasons({ data, set }) {
  const reasons = data.reasons || [];
  const setReason = (idx, key, val) => {
    const next = [...reasons];
    next[idx] = { ...next[idx], [key]: val };
    set('reasons', next);
  };
  const addReason = () => set('reasons', [...reasons, { title: '', desc: '' }]);
  const removeReason = (idx) => set('reasons', reasons.filter((_, i) => i !== idx));

  const currentPreset = REASONS_PRESETS.find(p => p.title1 === data.reasonsTitle1 && p.title2 === data.reasonsTitle2)?.id || null;

  const applyPreset = (preset) => {
    set('reasonsTitle1', preset.title1);
    set('reasonsTitle2', preset.title2);
    set('reasons', preset.cards.map(c => ({ ...c })));
  };

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Pick a theme for the reason cards.</div>
    <PresetGrid presets={REASONS_PRESETS} currentId={currentPreset} onApply={applyPreset} />
    <div className="w-full h-px bg-[#1a1a1a] mb-4" />
    <div style={S.sectionTitle}>Reasons I Love You</div>
    <div style={S.sectionDesc}>Tap-to-reveal cards. Each has a title and description.</div>
    <Field label="Section Title 1" value={data.reasonsTitle1} onChange={(v) => set('reasonsTitle1', v)} placeholder="The Reasons" />
    <Field label="Section Title 2" value={data.reasonsTitle2} onChange={(v) => set('reasonsTitle2', v)} placeholder="I Love You" />
    {reasons.map((r, i) => (
      <div key={i} style={S.cardWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#555' }}>Reason {i + 1}</span>
          <button style={S.smallBtn('#EF4444')} onClick={() => removeReason(i)}>Remove</button>
        </div>
        <Field label="Title" value={r.title} onChange={(v) => setReason(i, 'title', v)} placeholder="Your Smile" />
        <Field label="Description" value={r.desc} onChange={(v) => setReason(i, 'desc', v)} placeholder="It lights up my world." />
      </div>
    ))}
    <button style={S.smallBtn('#22C55E')} onClick={addReason}>+ Add Reason</button>
  </>);
}


// ── Seasons Presets ───────────────────────────────────────────────
const SEASON_PRESETS = [
  {
    id: 'seasons',
    name: '🍂 Seasons',
    desc: 'Classic four seasons metaphor',
    title1: 'A Love For',
    title2: 'Every Season',
    hint: 'tap each season to discover its meaning',
    cards: [
      { icon: 'spring', name: 'Spring', teaser: 'where it all began', message: 'Like the first bloom after a long winter, you arrived when I least expected, and everything grew.' },
      { icon: 'summer', name: 'Summer', teaser: 'when love was loudest', message: 'In the fullness of us, I felt the sun from the inside. No distance, no doubt, just warmth.' },
      { icon: 'autumn', name: 'Autumn', teaser: 'beautiful even as things changed', message: 'Loving you through change taught me that some things don\'t need to stay the same to stay beautiful.' },
      { icon: 'winter', name: 'Winter', teaser: 'I stayed, and I\'d stay again', message: 'In the quiet and the cold, I chose you still. I will always choose you still.' },
    ],
  },
  {
    id: 'flowers',
    name: '🌹 Flowers',
    desc: 'Each bloom tells a love story',
    title1: 'A Garden of',
    title2: 'Love Letters',
    hint: 'tap each flower to read its message',
    cards: [
      { icon: 'rose', name: 'Rose', teaser: 'passion that never fades', message: 'You are the red that burns through gray days, bold, unwavering, a love that refuses to be quiet.' },
      { icon: 'tulip', name: 'Tulip', teaser: 'a perfect declaration', message: 'If I could only say it once, I\'d say it with you. You are my favorite first and my favorite always.' },
      { icon: 'lily', name: 'Lily', teaser: 'devotion without condition', message: 'You didn\'t ask me to be more, and somehow that made me want to give you everything.' },
      { icon: 'sunflower', name: 'Sunflower', teaser: 'always turning toward you', message: 'No matter where I stand, I find myself facing you. You are the light I follow home.' },
    ],
  },
  {
    id: 'timeofday',
    name: '🌅 Time of Day',
    desc: 'From dawn to midnight',
    title1: 'Every Hour',
    title2: 'Is Yours',
    hint: 'tap each moment to unfold its story',
    cards: [
      { icon: 'sunrise', name: 'Sunrise', teaser: 'the promise of beginning', message: 'Every morning I wake up choosing you. Not because I have to, because every dawn feels incomplete without the thought of you.' },
      { icon: 'noon', name: 'Noon', teaser: 'love at its brightest', message: 'In the loudest, busiest parts of my day, you are the stillness I carry. The calm center in all the noise.' },
      { icon: 'dusk', name: 'Dusk', teaser: 'when the world softens', message: 'There\'s a golden hour that only exists when I\'m near you, when everything slows, and the light paints us just right.' },
      { icon: 'midnight', name: 'Midnight', teaser: 'secrets only we know', message: 'In the quiet dark, with nothing left but honesty, that\'s where I love you most. Where pretending is impossible.' },
    ],
  },
  {
    id: 'keepsakes',
    name: '🕯️ Keepsakes',
    desc: 'Treasured mementos of love',
    title1: 'The Things',
    title2: 'I Keep Close',
    hint: 'tap each keepsake to reveal its meaning',
    cards: [
      { icon: 'candle', name: 'The Flame', teaser: 'a light that never dims', message: 'Even in the darkest corners of doubt, your love is the candle I hold, small but unwavering, enough to find my way.' },
      { icon: 'letter', name: 'The Letter', teaser: 'words folded with care', message: 'If I wrote you a letter every day, they would all say the same thing in different ways: I am better because of you.' },
      { icon: 'ring', name: 'The Promise', teaser: 'unbroken and unending', message: 'Not a promise of perfection, but of presence. I will stay, I will try, I will choose you over and over again.' },
      { icon: 'key', name: 'The Key', teaser: 'you unlocked everything', message: 'Before you, there were rooms in my heart I didn\'t know existed. You didn\'t just open them, you filled them.' },
    ],
  },
];

function TabSeasons({ data, set }) {
  const seasons = data.seasons || [];
  const setSeason = (idx, key, val) => {
    const next = [...seasons];
    next[idx] = { ...next[idx], [key]: val };
    set('seasons', next);
  };

  // Detect current preset
  const detectPreset = () => {
    for (const preset of SEASON_PRESETS) {
      if (data.seasonsTitle1 === preset.title1 && data.seasonsTitle2 === preset.title2) return preset.id;
    }
    return null;
  };

  const applyPreset = (preset) => {
    set('seasonsTitle1', preset.title1);
    set('seasonsTitle2', preset.title2);
    set('seasonsHint', preset.hint);
    set('seasons', preset.cards.map(c => ({ ...c })));
  };

  const currentPreset = detectPreset();

  // All icon keys for the dropdown
  const allIcons = [
    { value: 'spring', label: 'Spring (Leaf)' }, { value: 'summer', label: 'Summer (Sun)' },
    { value: 'autumn', label: 'Autumn (Tree)' }, { value: 'winter', label: 'Winter (Snowflake)' },
    { value: 'rose', label: 'Rose' }, { value: 'tulip', label: 'Tulip' },
    { value: 'lily', label: 'Lily' }, { value: 'sunflower', label: 'Sunflower' },
    { value: 'sunrise', label: 'Sunrise' }, { value: 'noon', label: 'Noon' },
    { value: 'dusk', label: 'Dusk' }, { value: 'midnight', label: 'Midnight' },
    { value: 'ocean', label: 'Ocean' }, { value: 'mountain', label: 'Mountain' },
    { value: 'forest', label: 'Forest' }, { value: 'desert', label: 'Desert' },
    { value: 'candle', label: 'Candle' }, { value: 'letter', label: 'Letter' },
    { value: 'ring', label: 'Ring' }, { value: 'key', label: 'Key' },
    { value: 'sun', label: 'Sun' }, { value: 'moon', label: 'Moon' },
    { value: 'star', label: 'Star' }, { value: 'heart', label: 'Heart' },
    { value: 'coffee', label: 'Coffee' }, { value: 'music', label: 'Music' },
    { value: 'sparkles', label: 'Sparkles' }, { value: 'clock', label: 'Clock (Time)' },
  ];

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Select a metaphor theme, or customize below.</div>

    <div className="grid grid-cols-2 gap-3 mb-6">
      {SEASON_PRESETS.map((preset) => {
        const isActive = currentPreset === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={`rounded-xl p-4 text-left transition-all border-2 ${
              isActive
                ? 'border-[#E11D48] bg-[#E11D48]/10 shadow-[0_0_20px_rgba(225,29,72,0.15)]'
                : 'border-[#222] bg-[#111] hover:border-[#444]'
            }`}
          >
            <div className="text-base mb-1">{preset.name}</div>
            <div className={`text-[0.65rem] ${isActive ? 'text-[#F472B6]' : 'text-[#666]'}`}>{preset.desc}</div>
            <div className="flex gap-2 mt-3">
              {preset.cards.map((c, ci) => (
                <div key={ci} className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] ${isActive ? 'bg-[#E11D48]/20 text-[#F472B6]' : 'bg-[#222] text-[#888]'}`}>
                  {ci + 1}
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>

    <div className="w-full h-px bg-[#1a1a1a] mb-4" />

    <div style={S.sectionTitle}>Section Titles</div>
    <div style={S.sectionDesc}>Customize the heading and hint text.</div>
    <Field label="Section Title 1" value={data.seasonsTitle1} onChange={(v) => set('seasonsTitle1', v)} placeholder="A Love For" />
    <Field label="Section Title 2" value={data.seasonsTitle2} onChange={(v) => set('seasonsTitle2', v)} placeholder="Every Season" />
    <Field label="Hint Text" value={data.seasonsHint} onChange={(v) => set('seasonsHint', v)} placeholder="tap each season to discover its meaning" />

    <div className="w-full h-px bg-[#1a1a1a] my-4" />

    <div style={S.sectionTitle}>Cards</div>
    <div style={S.sectionDesc}>Edit each card individually.</div>
    {seasons.map((s, i) => {
      const fallbackIcons = ['spring', 'summer', 'autumn', 'winter'];
      const currentIcon = s.icon || fallbackIcons[i % 4];
      return (
        <div key={i} style={S.cardWrap}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px', fontWeight: 600 }}>Card Icon</div>
            <select 
              style={{ ...S.input, appearance: 'auto', marginBottom: 0 }}
              value={currentIcon}
              onChange={(e) => setSeason(i, 'icon', e.target.value)}
            >
              {allIcons.map(ic => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          </div>
          <Field label={`Card ${i + 1} Name`} value={s.name} onChange={(v) => setSeason(i, 'name', v)} placeholder="e.g. Morning / Spring" />
          <Field label="Teaser" value={s.teaser} onChange={(v) => setSeason(i, 'teaser', v)} placeholder="short teaser" />
          <Field label="Full Message" value={s.message} onChange={(v) => setSeason(i, 'message', v)} placeholder="expanded message" multiline />
        </div>
      );
    })}
  </>);
}

function TabGallery({ data, set, slug }) {
  const photos = data.photos || [];
  const setPhoto = (idx, key, val) => {
    const next = [...photos];
    next[idx] = { ...next[idx], [key]: val };
    set('photos', next);
  };
  
  const addPhoto = () => {
    if (photos.length >= 15) return;
    set('photos', [...photos, { url: '', caption: '' }]);
  };
  
  const removePhoto = (idx) => {
    set('photos', photos.filter((_, i) => i !== idx));
  };

  const movePhoto = (idx, direction) => {
    const next = [...photos];
    if (direction === 'up' && idx > 0) {
      // Only swap the URLs — captions stay locked to their position index
      const tempUrl = next[idx - 1].url;
      next[idx - 1] = { ...next[idx - 1], url: next[idx].url };
      next[idx] = { ...next[idx], url: tempUrl };
      set('photos', next);
    } else if (direction === 'down' && idx < next.length - 1) {
      // Only swap the URLs — captions stay locked to their position index
      const tempUrl = next[idx + 1].url;
      next[idx + 1] = { ...next[idx + 1], url: next[idx].url };
      next[idx] = { ...next[idx], url: tempUrl };
      set('photos', next);
    }
  };

  const [uploadingBulk, setUploadingBulk] = useState(false);
  const handleBulkUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingBulk(true);
    let currentPhotos = [...(data.photos || [])];
    for (let i = 0; i < files.length; i++) {
      if (currentPhotos.length >= 15) break;
      const file = files[i];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const resData = await res.json();
        if (resData.url) {
          currentPhotos.push({ url: resData.url, caption: '' });
          set('photos', [...currentPhotos]);
        }
      } catch { /* ignore */ }
    }
    setUploadingBulk(false);
    e.target.value = '';
  };

  return (<>
    <div style={S.sectionTitle}>Photo Gallery</div>
    <div style={S.sectionDesc}>Upload photos with captions. You can add up to 15 photos.</div>
    <Field label="Section Title 1" value={data.galleryTitle1} onChange={(v) => set('galleryTitle1', v)} placeholder="Our Beautiful" />
    <Field label="Section Title 2" value={data.galleryTitle2} onChange={(v) => set('galleryTitle2', v)} placeholder="Memories" />
    {photos.map((p, i) => (
      <div key={i} style={S.cardWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold' }}>Photo {i + 1}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {i > 0 && <button style={{...S.smallBtn('#4B5563'), padding: '2px 8px'}} onClick={() => movePhoto(i, 'up')} title="Move Up">↑</button>}
              {i < photos.length - 1 && <button style={{...S.smallBtn('#4B5563'), padding: '2px 8px'}} onClick={() => movePhoto(i, 'down')} title="Move Down">↓</button>}
            </div>
          </div>
          <button style={S.smallBtn('#EF4444')} onClick={() => removePhoto(i)}>Remove</button>
        </div>
        <FileUpload label="Image Upload" slug={slug} currentUrl={typeof p === 'string' ? p : p.url} onUploaded={(url) => setPhoto(i, 'url', url)} onRemove={() => setPhoto(i, 'url', '')} />
        <Field label="Or input Image/Video URL directly" value={typeof p === 'string' ? p : p.url} onChange={(v) => setPhoto(i, 'url', v)} placeholder="https://..." />
        <Field label="Caption" value={typeof p === 'string' ? '' : p.caption} onChange={(v) => setPhoto(i, 'caption', v)} placeholder="caption text" />
      </div>
    ))}
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      {photos.length < 15 && (
        <button style={S.smallBtn('#22C55E')} onClick={addPhoto}>+ Add Photo ({photos.length}/15)</button>
      )}
      <label style={{ ...S.smallBtn('#3B82F6'), cursor: uploadingBulk ? 'wait' : 'pointer', opacity: uploadingBulk ? 0.7 : 1 }}>
        {uploadingBulk ? 'Uploading...' : '📁 Bulk Upload Photos'}
        <input type="file" multiple accept="image/*,video/*" onChange={handleBulkUpload} style={{ display: 'none' }} disabled={uploadingBulk} />
      </label>
    </div>
  </>);
}

function TabMusic({ data, set, slug }) {
  const music = data.music || {};
  const setMusic = (key, val) => set('music', { ...music, [key]: val });

  const applyPreset = (song) => {
    set('music', {
      ...music,
      title: song.title,
      artist: song.artist,
      file: song.audioUrl,
      cover: song.coverUrl,
    });
  };

  return (<>
    <div style={S.sectionTitle}>Preset Playlist</div>
    <div style={S.sectionDesc}>Choose from ready-to-use songs or upload your own below.</div>
    
    <div className="flex overflow-x-auto gap-3 pb-4 mb-4 border-b border-[#1a1a1a] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {playlistData.map((song, i) => {
        const isSelected = music.title === song.title && music.artist === song.artist;
        return (
          <button 
            key={i} 
            onClick={() => applyPreset(song)}
            className="flex-shrink-0 w-24 flex flex-col items-start gap-1 text-left cursor-pointer group outline-none"
          >
            <div className={`w-24 h-24 rounded-md overflow-hidden border-2 transition-all relative ${isSelected ? 'border-[#E11D48] shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-95' : 'border-[#222] group-hover:border-[#F472B6]'}`}>
               <img src={song.coverUrl} className="w-full h-full object-cover" alt={song.title} onError={(e) => e.target.style.display='none'} />
               {isSelected && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                   <div className="w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center text-xs">✓</div>
                 </div>
               )}
            </div>
            <div className={`text-xs font-medium truncate w-full mt-1 ${isSelected ? 'text-[#E11D48]' : 'text-[#ddd]'}`}>{song.title}</div>
            <div className="text-[0.65rem] text-[#888] truncate w-full">{song.artist}</div>
          </button>
        );
      })}
    </div>

    <div style={S.sectionTitle}>Custom Music Details</div>
    <div style={S.sectionDesc}>Edit details or upload a custom song.</div>
    <Field label="Song Title" value={music.title} onChange={(v) => setMusic('title', v)} placeholder="Song Title" />
    <Field label="Artist" value={music.artist} onChange={(v) => setMusic('artist', v)} placeholder="Artist Name" />
    <FileUpload label="Audio File" slug={slug} currentUrl={music.file} onUploaded={(url) => setMusic('file', url)} onRemove={() => setMusic('file', '')} />
    <Field label="Or input Audio URL directly" value={music.file || ''} onChange={(v) => setMusic('file', v)} placeholder="https://..." />
    <FileUpload label="Cover Image" slug={slug} currentUrl={music.cover} onUploaded={(url) => setMusic('cover', url)} onRemove={() => setMusic('cover', '')} />
    <Field label="Or input Cover Image URL directly" value={music.cover || ''} onChange={(v) => setMusic('cover', v)} placeholder="https://..." />
  </>);
}

// ── Closing Presets ──────────────────────────────────────────────
const CLOSING_PRESETS = [
  {
    id: 'eternal', name: '💫 Eternal Love', desc: 'A love that transcends everything',
    preTitle: 'always & forever', title1: 'You Are Loved', title2: 'Beyond Words',
    paragraph: 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.',
    closingLine: 'always yours,', celebrateBtn: 'celebrate ✨',
  },
  {
    id: 'grateful', name: '🙏 Gratefully Yours', desc: 'Thankful for every moment',
    preTitle: 'with gratitude', title1: 'Thank You For', title2: 'Being You',
    paragraph: 'You walked into my life and made everything softer, brighter, more worth living. I don\'t know what I did to deserve you, but I know I\'d do it all over again. A thousand times over.',
    closingLine: 'gratefully yours,', celebrateBtn: 'celebrate us ✨',
  },
  {
    id: 'adventure', name: '🗺️ Adventurous', desc: 'Ready for what\'s next together',
    preTitle: 'the best is yet to come', title1: 'Our Story', title2: 'Continues',
    paragraph: 'This isn\'t the end, it\'s a beginning. A new chapter written in the ink of our laughter, our tears, our inside jokes, and our silent promises. Wherever the road goes next, I want to walk it with you.',
    closingLine: 'your partner in everything,', celebrateBtn: 'to the next chapter ✨',
  },
  {
    id: 'simple', name: '🤍 Simple & True', desc: 'No frills, just love',
    preTitle: 'simply', title1: 'I Love You', title2: 'That\'s It.',
    paragraph: 'There are no fancy words left to say. Just three simple ones that carry everything I feel, everything I hope, and everything I promise: I love you.',
    closingLine: 'yours,', celebrateBtn: 'celebrate ✨',
  },
];

function TabClosing({ data, set, slug }) {
  const currentPreset = CLOSING_PRESETS.find(p => p.preTitle === data.closingPreTitle)?.id || null;

  const applyPreset = (preset) => {
    set('closingPreTitle', preset.preTitle);
    set('closingTitle1', preset.title1);
    set('closingTitle2', preset.title2);
    set('closingParagraph', preset.paragraph);
    set('closingLine', preset.closingLine);
    set('celebrateBtnText', preset.celebrateBtn);
  };

  return (<>
    <div style={S.sectionTitle}>Choose a Preset</div>
    <div style={S.sectionDesc}>Pick a closing message tone.</div>
    <PresetGrid presets={CLOSING_PRESETS} currentId={currentPreset} onApply={applyPreset} />
    <div className="w-full h-px bg-[#1a1a1a] mb-4" />
    <div style={S.sectionTitle}>Closing Section</div>
    <div style={S.sectionDesc}>The final section with the celebrate button and secret reveal.</div>
    <Field label="Pre-title" value={data.closingPreTitle} onChange={(v) => set('closingPreTitle', v)} placeholder="always & forever" />
    <Field label="Headline 1" value={data.closingTitle1} onChange={(v) => set('closingTitle1', v)} placeholder="You Are Loved" />
    <Field label="Headline 2" value={data.closingTitle2} onChange={(v) => set('closingTitle2', v)} placeholder="Beyond Words" />
    <Field label="Main Paragraph" value={data.closingParagraph} onChange={(v) => set('closingParagraph', v)} placeholder="No matter where life takes us..." multiline />
    <Field label="Closing Line" value={data.closingLine} onChange={(v) => set('closingLine', v)} placeholder="always yours," />
    <Field label="Sender Name" value={data.sender} onChange={(v) => set('sender', v)} placeholder="Your Name" />
    <Field label="Celebrate Button Text" value={data.celebrateBtnText} onChange={(v) => set('celebrateBtnText', v)} placeholder="celebrate ✨" />
    <FileUpload label="Secret Photo/Video (Upload)" slug={slug} currentUrl={data.secretPhoto} onUploaded={(url) => set('secretPhoto', url)} onRemove={() => set('secretPhoto', '')} />
    <Field label="Atau Paste Direct Link" value={data.secretPhoto} onChange={(v) => set('secretPhoto', v)} placeholder="https://..." />
    <Field label="Secret Caption" value={data.secretCaption} onChange={(v) => set('secretCaption', v)} placeholder="a special note" />
    <Toggle
      label="🔇 Video Tanpa Suara (Muted)"
      desc="Aktifkan jika customer ingin video kejutan tanpa suara — musik background tetap playing"
      value={data.secretVideoMuted ?? false}
      onChange={(v) => set('secretVideoMuted', v)}
    />
  </>);
}

const TAB_COMPONENTS = [TabTheme, TabOpening, TabHero, TabTime, TabLetter, TabReasons, TabSeasons, TabGallery, TabMusic, TabClosing];

// ── Main Editor ───────────────────────────────────────────────────
export default function StudioEditor({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/gifts/${slug}`);
      if (res.status === 401) { router.push('/studio/login'); return; }
      if (res.status === 404) { router.push('/studio'); return; }
      setData(await res.json());
    })();
  }, [slug]);

  const set = useCallback((key, val) => {
    setData((prev) => ({ ...prev, [key]: val }));
    setSaveStatus('');
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch(`/api/gifts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setPreviewKey((k) => k + 1);
        setTimeout(() => setSaveStatus(''), 3000);
      } else if (res.status === 401) {
        router.push('/studio/login');
      } else {
        setSaveStatus('error');
      }
    } catch { setSaveStatus('error'); }
    setSaving(false);
  };

  if (!data) return (
    <div className="flex items-center justify-center h-[100dvh] bg-[#050505]">
      <p className="text-[#555] font-sans">Loading editor...</p>
    </div>
  );

  const ActivePanel = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050505] text-[#f5f5f5] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[260px] bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#1a1a1a] flex flex-col shrink-0 z-20">
        <div style={S.sideHeader}>
          <span style={S.brand}>loves<span style={S.dot}>·</span>studio</span>
          <button style={S.backBtn} onClick={() => router.push('/studio')}>← Back</button>
        </div>

        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto py-2 md:py-3 px-2 md:px-0 gap-1 hide-scrollbar flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {TABS.map((t, i) => {
            const active = activeTab === i;
            return (
              <button 
                key={t} 
                onClick={() => setActiveTab(i)}
                className={`whitespace-nowrap text-left px-4 py-2.5 text-xs md:text-[0.8rem] transition-all md:border-l-2 ${
                  active 
                    ? 'bg-accent/10 text-[#F472B6] border-b-2 md:border-b-0 md:border-l-[#E11D48] font-semibold' 
                    : 'text-[#888] border-b-2 md:border-b-0 border-transparent hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block p-4 border-t border-[#1a1a1a]">
          {saveStatus === 'saved' && (
            <div style={{ ...S.statusPill('#22C55E'), textAlign: 'center', marginBottom: '0.5rem' }}>✓ Saved</div>
          )}
          {saveStatus === 'error' && (
            <div style={{ ...S.statusPill('#EF4444'), textAlign: 'center', marginBottom: '0.5rem' }}>Save failed</div>
          )}
          <button style={S.saveBtn(saving)} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <div style={S.topBar}>
          <div>
            <div style={S.topTitle}>{data.recipient || slug}</div>
            <div style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace' }}>/{slug}</div>
          </div>
          <button style={S.smallBtn('#8B5CF6')} onClick={() => window.open(`/${slug}`, '_blank')}>Open Preview ↗</button>
        </div>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Form */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8 min-w-0 pb-24 md:pb-8">
            <ActivePanel data={data} set={set} slug={slug} />
          </div>

          {/* Live Preview (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col w-[45%] border-l border-[#1a1a1a] bg-black shrink-0">
            <div style={S.previewHeader}>
              <span style={S.previewLabel}>Live Preview</span>
              <button style={S.smallBtn('#888')} onClick={() => setPreviewKey((k) => k + 1)}>Refresh</button>
            </div>
            <iframe key={previewKey} src={`/${slug}`} style={S.iframe} title="Preview" />
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 border-t border-[#1a1a1a] bg-[#0a0a0a] z-20 flex gap-3 items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="flex-1">
            <button style={S.saveBtn(saving)} onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {saveStatus === 'saved' && <span className="text-[#22C55E] text-xs font-medium">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-[#EF4444] text-xs font-medium">Failed</span>}
        </div>
      </div>
    </div>
  );
}
