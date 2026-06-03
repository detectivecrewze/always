'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@/lib/themes';
import playlist from '@/app/studio/playlist.json';
import { Flower2, Leaf, Clock, Heart, Music, Image as ImageIcon, Lock, CheckCircle2, Sparkles, Video, Star, Camera, Handshake, HeartHandshake } from 'lucide-react';

export default function OrderForm() {
  const params = useParams();
  const slug = params?.slug || 'unknown';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [tempSelectedMusic, setTempSelectedMusic] = useState('');

  const [data, setData] = useState({
    sender: '',
    recipient: '',
    moment: 'Ultah',
    theme: 'vintage-burgundy',
    tone: ['Puitis'],
    musicChoice: 'playlist', // 'playlist', 'request' or 'random'
    music: '',
    specialDate: '',
    metaphorChoice: 'Seasons (4 Musim)',
    reasonChoice: 'qualities',
    customMoment: '',
    message: '',
  });

  // Load from localStorage OR online draft on mount
  useEffect(() => {
    let mounted = true;
    
    // 1. Try local storage first (instant feel)
    try {
      const saved = localStorage.getItem(`loves-order-${slug}`);
      if (saved) setData(JSON.parse(saved));
    } catch { /* ignore */ }
    
    // 2. Fetch online draft as source of truth
    fetch(`/api/drafts/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(onlineDraft => {
        if (!mounted || !onlineDraft) return;
        setData(onlineDraft);
        localStorage.setItem(`loves-order-${slug}`, JSON.stringify(onlineDraft));
      })
      .catch(() => {});
      
    return () => { mounted = false; };
  }, [slug]);

  // Save to localStorage AND online when data changes (debounced)
  useEffect(() => {
    try { localStorage.setItem(`loves-order-${slug}`, JSON.stringify(data)); } catch { /* ignore */ }
    
    const timer = setTimeout(() => {
      fetch(`/api/drafts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {});
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [data, slug]);

  const [files, setFiles] = useState([]); // Max 10
  const [secretFile, setSecretFile] = useState(null); // Max 1

  const fileInputRef = useRef(null);
  const secretInputRef = useRef(null);

  const currentTheme = themes[data.theme] || themes['vintage-burgundy'];
  
  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const update = (key, val) => setData(p => ({ ...p, [key]: val }));

  const handleNext = () => {
    if (step === 1 && (!data.sender || !data.recipient)) return alert('Mohon isi nama pengirim dan penerima.');
    if (step === 3 && !data.message) return alert('Mohon isi pesan utama yang ingin disampaikan.');
    setStep(s => Math.min(4, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFileChange = (e, isSecret) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length < selected.length) alert('Beberapa file diabaikan karena ukurannya lebih dari 10MB.');
    
    if (isSecret) {
      if (validFiles[0]) setSecretFile(validFiles[0]);
    } else {
      setFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10
    }
  };

  const uploadFiles = async () => {
    const uploadedUrls = [];
    let secretUrl = null;

    const upload = async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug);
      const res = await fetch('/api/upload-public', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      return (await res.json()).url;
    };

    for (const f of files) {
      uploadedUrls.push(await upload(f));
    }
    if (secretFile) {
      secretUrl = await upload(secretFile);
    }
    return { photos: uploadedUrls, secretPhoto: secretUrl };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const uploaded = await uploadFiles();
      const payload = {
        ...data,
        slug,
        photos: uploaded.photos,
        secretPhoto: uploaded.secretPhoto,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.ok) {
        setOrderId(result.orderId);
        setStep(5); // Success screen
        
        // Delete the online draft so it disappears from Studio Live Drafts
        fetch(`/api/drafts/${slug}`, { method: 'DELETE' }).catch(() => {});
      } else {
        alert(result.error || 'Terjadi kesalahan pada sistem.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim data. Silakan coba lagi.');
    }
    setSubmitting(false);
  };

  const STORY_CONCEPTS = [
    { id: 'Flowers (Bunga)', icon: <Flower2 size={24} strokeWidth={1.5} />, title: 'Bunga (Flowers)', desc: 'Cocok untuk cerita cinta yang dirawat dan terus bertumbuh mekar.' },
    { id: 'Seasons (4 Musim)', icon: <Leaf size={24} strokeWidth={1.5} />, title: 'Musim (Seasons)', desc: 'Menyoroti bagaimana kalian melewati masa senang dan sulit bersama.' },
    { id: 'Time (Waktu)', icon: <Clock size={24} strokeWidth={1.5} />, title: 'Waktu (Time)', desc: 'Fokus pada detik, hari, dan tahun perjalanan yang telah dihabiskan.' },
    { id: 'Keepsakes (Kenangan)', icon: <Heart size={24} strokeWidth={1.5} />, title: 'Kenangan (Keepsakes)', desc: 'Mengabadikan hal-hal kecil bermakna yang menjadi saksi cerita kalian.' }
  ];

  const REASON_THEMES = [
    { id: 'qualities', icon: <Star size={24} strokeWidth={1.5} />, title: 'Sifat Spesial (Qualities)', desc: 'Hal-hal yang membuat dia begitu istimewa di mata kamu.' },
    { id: 'moments', icon: <Camera size={24} strokeWidth={1.5} />, title: 'Momen Berharga (Moments)', desc: 'Kenangan-kenangan yang membentuk kisah cinta kalian.' },
    { id: 'promises', icon: <HeartHandshake size={24} strokeWidth={1.5} />, title: 'Janji Setia (Promises)', desc: 'Hal-hal yang selalu kamu janjikan untuk dia.' },
    { id: 'gratitude', icon: <Sparkles size={24} strokeWidth={1.5} />, title: 'Rasa Syukur (Gratitude)', desc: 'Segala hal yang kamu syukuri atas kehadiran dia.' },
  ];

  const TONES = ['Santai', 'Puitis', 'Indoglish', 'Full English'];
  const MOMENTS = ['Ultah', 'Anniversary', 'LDR', 'Wisuda', 'Friendship', 'Just Because', 'Lainnya'];

  return (
    <div style={{
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      transition: 'background-color 0.8s ease, color 0.8s ease',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Container */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        {step < 5 && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, margin: '0 0 0.5rem 0', fontStyle: 'italic' }}>
              Digital Atelier
            </h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Order Form • Step {step} of 4
            </p>
            <div style={{ display: 'flex', gap: '4px', marginTop: '1.5rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: '3px',
                  width: '32px',
                  borderRadius: '2px',
                  backgroundColor: currentTheme.text,
                  opacity: step >= i ? 1 : 0.2,
                  transition: 'opacity 0.4s'
                }} />
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 1: BASICS --- */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 500 }}>Tentang Kalian</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Dari (Nama Anda)</label>
                <input 
                  value={data.sender} onChange={e => update('sender', e.target.value)} 
                  placeholder="Misal: Budi"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = currentTheme.text}
                  onBlur={(e) => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Untuk (Panggilan Sayang / Nama)</label>
                <input 
                  value={data.recipient} onChange={e => update('recipient', e.target.value)} 
                  placeholder="Misal: Nadia"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = currentTheme.text}
                  onBlur={(e) => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Momen Spesial</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {MOMENTS.map(m => (
                    <button 
                      key={m} 
                      onClick={() => update('moment', m)}
                      style={{ 
                        padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
                        background: data.moment === m ? currentTheme.text : 'transparent',
                        color: data.moment === m ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${data.moment === m ? currentTheme.text : currentTheme.text + '40'}`
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {data.moment === 'Lainnya' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1rem', overflow: 'hidden' }}
                  >
                    <input
                      value={data.customMoment || ''}
                      onChange={e => update('customMoment', e.target.value)}
                      placeholder="Tulis momen spesialmu di sini... (cth: Hari pertama kenalan)"
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit',
                        padding: '0.5rem 0', fontSize: '0.95rem', outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={e => e.target.style.borderColor = currentTheme.text}
                      onBlur={e => e.target.style.borderColor = `${currentTheme.text}40`}
                    />
                  </motion.div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Tanggal Penting (Opsional)</label>
                <input 
                  type="date"
                  value={data.specialDate} onChange={e => update('specialDate', e.target.value)} 
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: VIBE & STYLE --- */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 500 }}>Gaya & Suasana</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Pilih Palet Warna</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                  {Object.entries(themes).map(([key, t]) => (
                    <button 
                      key={key}
                      onClick={() => update('theme', key)}
                      style={{
                        padding: '1rem 0.5rem', borderRadius: '16px', cursor: 'pointer', border: 'none', transition: 'transform 0.2s',
                        background: t.bg, color: t.text,
                        boxShadow: data.theme === key ? `0 0 0 2px ${currentTheme.bg}, 0 0 0 4px ${currentTheme.text}` : '0 4px 6px rgba(0,0,0,0.1)',
                        transform: data.theme === key ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.accent }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.text }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500 }}>{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Tema Bagian Metafora</label>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1.25rem', lineHeight: 1.4 }}>Pilih satu tema khusus yang akan kami gunakan untuk salah satu bagian (section) di dalam surat cinta Anda.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {STORY_CONCEPTS.map(concept => {
                    const isSelected = data.metaphorChoice === concept.id;
                    return (
                      <button 
                        key={concept.id} 
                        onClick={() => update('metaphorChoice', concept.id)}
                        type="button"
                        style={{ 
                          padding: '1.25rem 1rem', 
                          borderRadius: '12px', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s ease',
                          background: isSelected ? currentTheme.text : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? currentTheme.bg : currentTheme.text,
                          border: `1px solid ${isSelected ? currentTheme.text : currentTheme.text + '30'}`,
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{concept.icon}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{concept.title}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', lineHeight: 1.4, opacity: isSelected ? 0.9 : 0.6 }}>
                          {concept.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Tema Bagian Alasan Cinta</label>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1.25rem', lineHeight: 1.4 }}>Pilih tema untuk kartu-kartu alasan kenapa kamu mencintai dia.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {REASON_THEMES.map(theme => {
                    const isSelected = data.reasonChoice === theme.id;
                    return (
                      <button 
                        key={theme.id} 
                        onClick={() => update('reasonChoice', theme.id)}
                        type="button"
                        style={{ 
                          padding: '1.25rem 1rem', 
                          borderRadius: '12px', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s ease',
                          background: isSelected ? currentTheme.text : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? currentTheme.bg : currentTheme.text,
                          border: `1px solid ${isSelected ? currentTheme.text : currentTheme.text + '30'}`,
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{theme.icon}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{theme.title}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', lineHeight: 1.4, opacity: isSelected ? 0.9 : 0.6 }}>
                          {theme.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Gaya Bahasa Penulisan (Bisa pilih lebih dari satu)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TONES.map(m => {
                    const isSelected = Array.isArray(data.tone) ? data.tone.includes(m) : data.tone === m;
                    return (
                      <button 
                        key={m} 
                        onClick={() => {
                          let current = Array.isArray(data.tone) ? [...data.tone] : [data.tone];
                          if (isSelected) {
                            current = current.filter(t => t !== m);
                            if (current.length === 0) current = [m]; // Ensure at least one is selected
                          } else {
                            current.push(m);
                          }
                          update('tone', current);
                        }}
                        style={{ 
                          padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s',
                          background: isSelected ? currentTheme.text + '20' : 'transparent',
                          color: currentTheme.text,
                          border: `1px solid ${isSelected ? currentTheme.text : 'transparent'}`
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: THE MESSAGE --- */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 500 }}>Pesan Utama</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>
              Ceritakan saja intinya secara santai. Tim *copywriter* kami yang akan mengubahnya menjadi kalimat yang sangat puitis dan indah.
            </p>
            
            <textarea 
              value={data.message} 
              onChange={e => update('message', e.target.value)} 
              placeholder="Contoh: Makasih ya udah sabar ngadepin aku yang kadang egois. Aku cuma mau bilang kalau aku beruntung banget punya kamu..."
              style={{ 
                width: '100%', minHeight: '200px', background: 'rgba(0,0,0,0.1)', border: `1px solid ${currentTheme.text}40`, 
                borderRadius: '12px', color: 'inherit', padding: '1rem', fontSize: '1rem', outline: 'none', resize: 'vertical', lineHeight: 1.6
              }}
            />

            <div style={{ marginTop: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Lagu Latar (Backsound)</label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'playlist'} onChange={() => {update('musicChoice', 'playlist'); update('music', '');}} style={{ accentColor: currentTheme.text }} />
                  Pilih dari Playlist
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'request'} onChange={() => update('musicChoice', 'request')} style={{ accentColor: currentTheme.text }} />
                  Request Lagu Lain
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'random'} onChange={() => {update('musicChoice', 'random'); update('music', '');}} style={{ accentColor: currentTheme.text }} />
                  Biar Tim Pilihkan
                </label>
              </div>
              
              {data.musicChoice === 'playlist' && (
                <div style={{ marginTop: '0.5rem' }}>
                  {data.music ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${currentTheme.text}30` }}>
                      <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Music size={16} strokeWidth={2} opacity={0.8} />
                        <div><strong>{data.music.split(' - ')[0]}</strong> <span style={{ opacity: 0.7 }}>- {data.music.split(' - ')[1]}</span></div>
                      </div>
                      <button onClick={() => { setTempSelectedMusic(data.music); setShowPlaylistModal(true); }} style={{ background: 'transparent', border: 'none', color: currentTheme.text, fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}>Ganti</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setTempSelectedMusic(''); setShowPlaylistModal(true); }}
                      style={{ 
                        width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.05)', border: `1px dashed ${currentTheme.text}60`, 
                        borderRadius: '12px', color: currentTheme.text, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                      }}
                    >
                      <Music size={18} strokeWidth={2} /> Buka Daftar Playlist Kami
                    </button>
                  )}
                </div>
              )}

              {data.musicChoice === 'request' && (
                <input 
                  value={data.music} onChange={e => update('music', e.target.value)} 
                  placeholder="Misal: Sempurna - Andra & The Backbone"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }}
                />
              )}
            </div>
          </div>
        )}

        {/* --- STEP 4: MEMORIES (MEDIA) --- */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 500 }}>Galeri Kenangan</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>
              Bagikan momen-momen terbaik kalian. Kami akan menatanya ke dalam galeri digital yang cantik.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Main Gallery */}
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Galeri Foto/Video</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{files.length} / 10 Terpilih</span>
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: `1px dashed ${currentTheme.text}60`, borderRadius: '16px', padding: '2rem 1rem', 
                    textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.05)', transition: 'background 0.3s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                >
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    <ImageIcon size={48} strokeWidth={1} opacity={0.7} />
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>Klik untuk memilih file</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, mt: 1 }}>Maksimal 10 file. (Video Max 10MB)</div>
                </div>
                <input type="file" multiple accept="image/*,video/mp4" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, false)} />
                
                {files.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '1rem' }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                        {f.type.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.7rem' }}>VIDEO</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Secret Ending */}
              <div style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: '0.2s', animationFillMode: 'both' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Foto/Video Kejutan Akhir</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Optional</span>
                </label>
                
                <div 
                  onClick={() => secretInputRef.current?.click()}
                  style={{ 
                    border: `1px dashed ${secretFile ? currentTheme.text : currentTheme.text + '60'}`, 
                    borderRadius: '16px', padding: '1.5rem 1rem', 
                    textAlign: 'center', cursor: 'pointer', 
                    background: secretFile ? currentTheme.text + '10' : 'rgba(0,0,0,0.05)'
                  }}
                >
                  {secretFile ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                      {secretFile.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(secretFile)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.9rem', fontWeight: 500, gap: '8px' }}>
                          <Video size={20} strokeWidth={2} opacity={0.8} /> VIDEO TERPILIH
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>Klik untuk mengganti</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <Lock size={48} strokeWidth={1} opacity={0.7} />
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>Pilih foto / video spesial untuk kejutan di akhir</div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*,video/mp4" ref={secretInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, true)} />
              </div>

            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentTheme.text}20` }}>
            <button 
              onClick={handlePrev} 
              disabled={submitting || step === 1}
              style={{ 
                background: 'transparent', border: 'none', color: currentTheme.text, fontSize: '0.9rem', 
                fontWeight: 500, cursor: step === 1 ? 'default' : 'pointer', opacity: step === 1 ? 0 : 0.7 
              }}
            >
              ← Kembali
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                style={{ 
                  background: currentTheme.text, color: currentTheme.bg, border: 'none', padding: '0.8rem 2rem', 
                  borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Selanjutnya →
              </button>
            ) : (
              <button 
                onClick={handleSubmit} disabled={submitting}
                style={{ 
                  background: currentTheme.text, color: currentTheme.bg, border: 'none', padding: '0.8rem 2.5rem', 
                  borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Mengirim Data...' : 'Selesai & Kirim'}
              </button>
            )}
          </div>
        )}

        {/* --- STEP 5: SUCCESS --- */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Sparkles size={64} strokeWidth={1} opacity={0.8} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Sempurna!
            </h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.6 }}>
              Data Anda telah kami terima.<br/>
              Kado untuk <strong>{data.recipient}</strong> akan segera kami proses.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', minWidth: '200px' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Pesanan Anda</div>
              <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{orderId}</div>
            </div>
          </div>
        )}

      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
      `}</style>

      {/* --- AESTHETIC LOADING SCREEN --- */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: `${currentTheme.bg}F2`, color: currentTheme.text,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{
              width: '50px', height: '50px',
              border: `3px solid ${currentTheme.text}30`,
              borderTop: `3px solid ${currentTheme.text}`,
              borderRadius: '50%',
              animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
            }} />
            <h3 style={{ 
              marginTop: '2rem', fontSize: '1.25rem', fontWeight: 500, 
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              animation: 'pulse-slow 2s ease-in-out infinite' 
            }}>
              Sedang Meramu Kenangan...
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Memproses media dan cerita Anda dengan cinta
            </p>
          </motion.div>
        )}

        {/* --- PLAYLIST MODAL --- */}
        {showPlaylistModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={() => setShowPlaylistModal(false)}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ 
                background: currentTheme.bg, color: currentTheme.text, width: '100%', maxWidth: '420px', 
                borderRadius: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', border: `1px solid ${currentTheme.text}20`
              }}
            >
              {/* Header */}
              <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${currentTheme.text}10` }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Pilih Lagu Latar</h3>
                <button onClick={() => setShowPlaylistModal(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'inherit', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>&times;</button>
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {playlist.map((song, i) => {
                  const songStr = `${song.title} - ${song.artist}`;
                  const isSelected = tempSelectedMusic === songStr;
                  return (
                    <div 
                      key={i} 
                      onClick={() => setTempSelectedMusic(songStr)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', 
                        borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isSelected ? currentTheme.text : 'transparent',
                        color: isSelected ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${isSelected ? currentTheme.text : currentTheme.text + '20'}`
                      }}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={song.coverUrl} alt="" style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: `1px solid ${currentTheme.text}20`, boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'inherit' }}>{song.title}</div>
                        <div style={{ fontSize: '0.8rem', opacity: isSelected ? 0.9 : 0.7, color: 'inherit' }}>{song.artist}</div>
                      </div>
                      {isSelected && (
                        <div style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                          <CheckCircle2 size={20} strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer / Actions */}
              <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: `1px solid ${currentTheme.text}10`, background: `linear-gradient(to bottom, transparent, ${currentTheme.bg} 20%)` }}>
                <button 
                  onClick={() => {
                    if(tempSelectedMusic) {
                      update('music', tempSelectedMusic);
                      setShowPlaylistModal(false);
                    }
                  }}
                  disabled={!tempSelectedMusic}
                  style={{
                    width: '100%', background: currentTheme.text, color: currentTheme.bg, border: 'none', 
                    padding: '1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, 
                    cursor: tempSelectedMusic ? 'pointer' : 'not-allowed', opacity: tempSelectedMusic ? 1 : 0.5,
                    transition: 'all 0.2s', boxShadow: tempSelectedMusic ? '0 8px 20px rgba(0,0,0,0.15)' : 'none'
                  }}
                  onMouseDown={e => { if(tempSelectedMusic) e.currentTarget.style.transform = 'scale(0.98)' }}
                  onMouseUp={e => { if(tempSelectedMusic) e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {tempSelectedMusic ? 'Pilih Lagu Ini' : 'Pilih lagu terlebih dahulu'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
