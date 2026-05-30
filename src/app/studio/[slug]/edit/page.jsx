'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Theme', 'Opening', 'Hero', 'Letter', 'Reasons', 'Seasons', 'Gallery', 'Music', 'Closing'];

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
    'classic-light': { name: 'Classic Light', bg: '#FAF7F2', accent: '#C9A882' },
    'midnight-rose': { name: 'Midnight Rose', bg: '#050505', accent: '#E11D48' },
    'ocean-breeze': { name: 'Ocean Breeze', bg: '#F0F7FA', accent: '#0D9488' },
    'blush-pink': { name: 'Blush Pink', bg: '#FFF1F2', accent: '#E11D48' },
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

function FileUpload({ label, slug, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
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
        {currentUrl && <img src={currentUrl} alt="" style={S.uploadThumb} onError={(e) => e.target.style.display='none'} />}
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
function TabOpening({ data, set }) {
  return (<>
    <div style={S.sectionTitle}>Gate Screen</div>
    <div style={S.sectionDesc}>The first thing visitors see before entering.</div>
    <Field label="Gate Subtitle" value={data.gateSubtitle} onChange={(v) => set('gateSubtitle', v)} placeholder="a gift for someone special" />
  </>);
}

function TabHero({ data, set }) {
  return (<>
    <div style={S.sectionTitle}>Hero Section</div>
    <div style={S.sectionDesc}>The big opening moment after the gate.</div>
    <Field label="Pre-title" value={data.heroPreTitle} onChange={(v) => set('heroPreTitle', v)} placeholder="to my dearest" />
    <Field label="Hero Line 1" value={data.heroLine1} onChange={(v) => set('heroLine1', v)} placeholder="Name," />
    <Field label="Hero Line 2" value={data.heroLine2} onChange={(v) => set('heroLine2', v)} placeholder="you are my everything." />
    <Field label="Subtitle" value={data.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} placeholder="scroll to unwrap your gift" />
  </>);
}

function TabLetter({ data, set }) {
  const paragraphs = Array.isArray(data.introText) ? data.introText : [data.introText || ''];
  const setPara = (idx, val) => {
    const next = [...paragraphs];
    next[idx] = val;
    set('introText', next);
  };
  const addPara = () => set('introText', [...paragraphs, '']);
  const removePara = (idx) => set('introText', paragraphs.filter((_, i) => i !== idx));

  return (<>
    <div style={S.sectionTitle}>Love Letter</div>
    <div style={S.sectionDesc}>The heartfelt letter section — styled like a candlelight note.</div>
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

function TabReasons({ data, set }) {
  const reasons = data.reasons || [];
  const setReason = (idx, key, val) => {
    const next = [...reasons];
    next[idx] = { ...next[idx], [key]: val };
    set('reasons', next);
  };
  const addReason = () => set('reasons', [...reasons, { title: '', desc: '' }]);
  const removeReason = (idx) => set('reasons', reasons.filter((_, i) => i !== idx));

  return (<>
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

function TabSeasons({ data, set }) {
  const seasons = data.seasons || [];
  const setSeason = (idx, key, val) => {
    const next = [...seasons];
    next[idx] = { ...next[idx], [key]: val };
    set('seasons', next);
  };

  return (<>
    <div style={S.sectionTitle}>Seasons of Love</div>
    <div style={S.sectionDesc}>Four interactive season cards.</div>
    <Field label="Section Title 1" value={data.seasonsTitle1} onChange={(v) => set('seasonsTitle1', v)} placeholder="A Love For" />
    <Field label="Section Title 2" value={data.seasonsTitle2} onChange={(v) => set('seasonsTitle2', v)} placeholder="Every Season" />
    <Field label="Hint Text" value={data.seasonsHint} onChange={(v) => set('seasonsHint', v)} placeholder="tap each season to discover its meaning" />
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
              <option value="spring">Spring (Leaf)</option>
              <option value="summer">Summer (Sun)</option>
              <option value="autumn">Autumn (Tree)</option>
              <option value="winter">Winter (Snowflake)</option>
              <option value="sun">Sun</option>
              <option value="moon">Moon</option>
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="coffee">Coffee</option>
              <option value="music">Music</option>
              <option value="sparkles">Sparkles</option>
              <option value="clock">Clock (Time)</option>
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
    if (photos.length >= 10) return;
    set('photos', [...photos, { url: '', caption: '' }]);
  };
  
  const removePhoto = (idx) => {
    set('photos', photos.filter((_, i) => i !== idx));
  };

  return (<>
    <div style={S.sectionTitle}>Photo Gallery</div>
    <div style={S.sectionDesc}>Upload photos with captions. You can add up to 10 photos.</div>
    <Field label="Section Title 1" value={data.galleryTitle1} onChange={(v) => set('galleryTitle1', v)} placeholder="Our Beautiful" />
    <Field label="Section Title 2" value={data.galleryTitle2} onChange={(v) => set('galleryTitle2', v)} placeholder="Memories" />
    {photos.map((p, i) => (
      <div key={i} style={S.cardWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#555' }}>Photo {i + 1}</span>
          <button style={S.smallBtn('#EF4444')} onClick={() => removePhoto(i)}>Remove</button>
        </div>
        <FileUpload label="Image" slug={slug} currentUrl={typeof p === 'string' ? p : p.url} onUploaded={(url) => setPhoto(i, 'url', url)} />
        <Field label="Caption" value={typeof p === 'string' ? '' : p.caption} onChange={(v) => setPhoto(i, 'caption', v)} placeholder="caption text" />
      </div>
    ))}
    {photos.length < 10 && (
      <button style={S.smallBtn('#22C55E')} onClick={addPhoto}>+ Add Photo ({photos.length}/10)</button>
    )}
  </>);
}

function TabMusic({ data, set, slug }) {
  const music = data.music || {};
  const setMusic = (key, val) => set('music', { ...music, [key]: val });

  return (<>
    <div style={S.sectionTitle}>Background Music</div>
    <div style={S.sectionDesc}>Music player shown at the bottom-left of the page.</div>
    <Field label="Song Title" value={music.title} onChange={(v) => setMusic('title', v)} placeholder="Song Title" />
    <Field label="Artist" value={music.artist} onChange={(v) => setMusic('artist', v)} placeholder="Artist Name" />
    <FileUpload label="Audio File" slug={slug} currentUrl={null} onUploaded={(url) => setMusic('file', url)} />
    {music.file && <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.25rem' }}>Current: {music.file}</p>}
    <FileUpload label="Cover Image" slug={slug} currentUrl={music.cover} onUploaded={(url) => setMusic('cover', url)} />
  </>);
}

function TabClosing({ data, set, slug }) {
  return (<>
    <div style={S.sectionTitle}>Closing Section</div>
    <div style={S.sectionDesc}>The final section with the celebrate button and secret reveal.</div>
    <Field label="Pre-title" value={data.closingPreTitle} onChange={(v) => set('closingPreTitle', v)} placeholder="always & forever" />
    <Field label="Headline 1" value={data.closingTitle1} onChange={(v) => set('closingTitle1', v)} placeholder="You Are Loved" />
    <Field label="Headline 2" value={data.closingTitle2} onChange={(v) => set('closingTitle2', v)} placeholder="Beyond Words" />
    <Field label="Main Paragraph" value={data.closingParagraph} onChange={(v) => set('closingParagraph', v)} placeholder="No matter where life takes us..." multiline />
    <Field label="Closing Line" value={data.closingLine} onChange={(v) => set('closingLine', v)} placeholder="always yours," />
    <Field label="Sender Name" value={data.sender} onChange={(v) => set('sender', v)} placeholder="Your Name" />
    <Field label="Celebrate Button Text" value={data.celebrateBtnText} onChange={(v) => set('celebrateBtnText', v)} placeholder="celebrate ✨" />
    <FileUpload label="Secret Photo/Video" slug={slug} currentUrl={data.secretPhoto} onUploaded={(url) => set('secretPhoto', url)} />
    <Field label="Secret Caption" value={data.secretCaption} onChange={(v) => set('secretCaption', v)} placeholder="a special note" />
  </>);
}

const TAB_COMPONENTS = [TabTheme, TabOpening, TabHero, TabLetter, TabReasons, TabSeasons, TabGallery, TabMusic, TabClosing];

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
