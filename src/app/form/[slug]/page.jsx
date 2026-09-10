'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@/lib/themes';
import playlist from '@/app/studio/playlist.json';
import { Flower2, Leaf, Clock, Heart, Music, Image as ImageIcon, Lock, CheckCircle2, Sparkles, Video, Star, Camera, Handshake, HeartHandshake } from 'lucide-react';



function formatMusicInfo(music) {
  if (!music) return { title: '', artist: '', full: '' };
  if (typeof music === 'object') {
    const title = music.title || music.name || '';
    const artist = music.artist || '';
    const full = title && artist ? `${title} - ${artist}` : (title || artist || '');
    return { title, artist, full };
  }
  const str = String(music).trim();
  if (str.startsWith('http') || str.startsWith('/')) {
    const matched = Array.isArray(playlist) ? playlist.find(p => p.audioUrl === str || p.url === str || p.file === str) : null;
    if (matched) {
      return { title: matched.title, artist: matched.artist, full: `${matched.title} - ${matched.artist}` };
    }
  }
  if (str.includes(' - ')) {
    const parts = str.split(' - ');
    const title = parts[0]?.trim() || '';
    const artist = parts.slice(1).join(' - ').trim();
    return { title, artist, full: str };
  }
  return { title: str, artist: '', full: str };
}

export default function OrderForm() {
  const params = useParams();
  const slug = params?.slug || 'unknown';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState('personal'); // 'personal' | 'circle'
  const [previewLoading, setPreviewLoading] = useState(true);

  const openPreviewModal = (tab = 'personal') => {
    setPreviewTab(tab);
    setPreviewLoading(true);
    setShowPreviewModal(true);
  };
  const [tempSelectedMusic, setTempSelectedMusic] = useState('');
  const [interfaceLocale, setInterfaceLocale] = useState('id');
  const isEn = interfaceLocale === 'en';
  const formRootRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const [data, setData] = useState({
    sender: '',
    recipient: '',
    nickname: '',
    moment: 'Ultah',
    milestoneNumber: '',
    recipientBirthdate: '',
    relationship: '',
    deadline: '',
    theme: 'vintage-burgundy',
    tone: ['Santai'],
    language: 'Full Indonesia',
    customLanguage: '',

    musicChoice: 'playlist', // 'playlist', 'request' or 'random'
    music: '',
    specialDate: '',
    specialDateOccasion: '',
    metaphorChoice: 'Seasons (4 Musim)',
    reasonChoice: 'qualities',
    customMoment: '',
    message: '',
    pinEnabled: false,
    pinCode: '',
    pinHint: '',
    isCircle: false,
    circleQuota: 8,
  });

  const [createdSlots, setCreatedSlots] = useState([]);
  const [trackerWishes, setTrackerWishes] = useState([]);
  const [trackerCopied, setTrackerCopied] = useState(false);
  const [isOrderReady, setIsOrderReady] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  // Load from localStorage OR online draft on mount
  useEffect(() => {
    let mounted = true;
    
    // 1. Try local storage first (instant feel)
    try {
      const saved = localStorage.getItem(`loves-order-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.music) parsed.music = formatMusicInfo(parsed.music).full;
          setData(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch { /* ignore */ }
    
    // 2. Fetch online draft as source of truth
    fetch(`/api/drafts/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(onlineDraft => {
        if (!mounted || !onlineDraft || typeof onlineDraft !== 'object') return;
        if (onlineDraft.music) onlineDraft.music = formatMusicInfo(onlineDraft.music).full;
        setData(prev => ({ ...prev, ...onlineDraft }));
        localStorage.setItem(`loves-order-${slug}`, JSON.stringify(onlineDraft));
      })
      .catch(() => {});
      
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    try { setInterfaceLocale(localStorage.getItem(`memoria-form-locale-${slug}`) || 'id'); } catch { /* ignore */ }
  }, [slug]);

  useEffect(() => {
    document.documentElement.lang = interfaceLocale;
  }, [interfaceLocale]);

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (showReviewModal || showPlaylistModal || showPreviewModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showReviewModal, showPlaylistModal, showPreviewModal]);

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

  // Each item: { id, localUrl, remoteUrl, status, isVideo }
  // status: 'uploading' | 'done' | 'error'
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [secretPhoto, setSecretPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const secretInputRef = useRef(null);

  const currentTheme = themes[data.theme] || themes['vintage-burgundy'];
  
  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const update = (key, val) => setData(p => ({ ...p, [key]: val }));

  const [validationError, setValidationError] = useState('');

  const handleNext = () => {
    setValidationError('');
    if (step === 1 && (!data.sender?.trim() || !data.recipient?.trim())) {
      setValidationError(isEn ? 'Please fill in the sender and recipient names.' : 'Mohon isi nama pengirim dan penerima.');
      return;
    }
    if (step === 3 && !data.message?.trim()) {
      setValidationError(isEn ? 'Please fill in the main message you want to share.' : 'Mohon isi pesan utama yang ingin disampaikan.');
      return;
    }
    setStep(s => Math.min(4, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX = 1200;
        if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
        else if (height > MAX) { width *= MAX / height; height = MAX; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((b) => b ? resolve(new File([b], file.name, { type: 'image/jpeg' })) : resolve(file), 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload a single file immediately and update state
  const uploadOneFile = async (file, id, isSecret) => {
    const compressed = await compressImage(file);
    const fd = new FormData();
    fd.append('file', compressed);
    fd.append('slug', slug);
    try {
      const res = await fetch('/api/upload-public', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      if (isSecret) {
        setSecretPhoto(prev => prev && prev.id === id ? { ...prev, remoteUrl: url, status: 'done' } : prev);
      } else {
        setUploadedPhotos(prev => prev.map(p => p.id === id ? { ...p, remoteUrl: url, status: 'done' } : p));
      }
    } catch {
      if (isSecret) {
        setSecretPhoto(prev => prev && prev.id === id ? { ...prev, status: 'error' } : prev);
      } else {
        setUploadedPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p));
      }
    }
  };

  const handleFileChange = (e, isSecret) => {
    const selected = Array.from(e.target.files);
    // Reset input so same file can be re-selected
    e.target.value = '';
    // Videos must be <= 15MB. Images will be compressed.
    const validFiles = selected.filter(f => f.type.startsWith('image/') || f.size <= 15 * 1024 * 1024);
    if (validFiles.length < selected.length) alert(isEn ? 'Some videos were skipped because they exceed 15MB.' : 'Beberapa video diabaikan karena ukurannya lebih dari 15MB.');

    if (isSecret) {
      const file = validFiles[0];
      if (!file) return;
      const id = `secret-${Date.now()}`;
      const item = { id, localUrl: URL.createObjectURL(file), remoteUrl: null, status: 'uploading', isVideo: file.type.startsWith('video/') };
      setSecretPhoto(item);
      uploadOneFile(file, id, true);
    } else {
      // Limit to max 15 total
      setUploadedPhotos(prev => {
        const slots = 15 - prev.length;
        const toAdd = validFiles.slice(0, slots);
        const newItems = toAdd.map((file, i) => {
          const id = `photo-${Date.now()}-${i}`;
          // Trigger upload after state update
          setTimeout(() => uploadOneFile(file, id, false), 0);
          return { id, localUrl: URL.createObjectURL(file), remoteUrl: null, status: 'uploading', isVideo: file.type.startsWith('video/') };
        });
        return [...prev, ...newItems];
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (!data.sender?.trim() || !data.recipient?.trim()) {
      alert(isEn ? 'Please fill in the sender and recipient names.' : 'Mohon lengkapi nama pengirim dan penerima.');
      return;
    }
    if (!data.message?.trim()) {
      alert(isEn ? 'Please fill in the main message you want to share.' : 'Mohon isi pesan utama yang ingin disampaikan.');
      return;
    }
    if (data.pinEnabled && (!data.pinCode || data.pinCode.length < 4)) {
      alert(isEn ? 'PIN Code must be at least 4 digits.' : 'PIN Code harus terdiri dari minimal 4 digit angka.');
      return;
    }

    // Check if any uploads are still in progress
    const stillUploading = uploadedPhotos.some(p => p.status === 'uploading') ||
      (secretPhoto && secretPhoto.status === 'uploading');
    if (stillUploading) {
      alert(isEn ? 'Photos are still uploading, please wait a moment.' : 'Foto masih dalam proses upload, mohon tunggu sebentar.');
      return;
    }

    // Check if any uploads failed
    const hasError = uploadedPhotos.some(p => p.status === 'error') ||
      (secretPhoto && secretPhoto.status === 'error');
    if (hasError) {
      alert(isEn ? 'Some media failed to upload. Please remove or re-upload before submitting.' : 'Ada foto/media yang gagal diunggah. Mohon hapus atau unggah ulang sebelum mengirim.');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      const photos = uploadedPhotos.filter(p => p.status === 'done').map(p => p.remoteUrl);
      const secretPhotoUrl = secretPhoto?.status === 'done' ? secretPhoto.remoteUrl : null;
      const payload = {
        ...data,
        sender: data.sender?.trim(),
        recipient: data.recipient?.trim(),
        message: data.message?.trim(),
        slug,
        isCircle: Boolean(data.isCircle),
        circleQuota: data.isCircle ? (data.circleQuota || 8) : null,
        photos,
        secretPhoto: secretPhotoUrl,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.ok) {
        setOrderId(result.orderId);
        if (result.order && Array.isArray(result.order.slots)) {
          setCreatedSlots(result.order.slots);
        }
        setShowReviewModal(false);
        setStep(5); // Success screen
        
        // Delete the online draft so it disappears from Studio Live Drafts
        fetch(`/api/drafts/${slug}`, { method: 'DELETE' }).catch(() => {});
      } else {
        alert(result.error || (isEn ? 'A system error occurred.' : 'Terjadi kesalahan pada sistem.'));
      }
    } catch (err) {
      console.error(err);
      alert(isEn ? 'Failed to submit data. Please try again.' : 'Gagal mengirim data. Silakan coba lagi.');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  const STORY_CONCEPTS = [
    { id: 'Flowers (Bunga)', icon: <Flower2 size={24} strokeWidth={1.5} />, title: isEn ? 'Flowers' : 'Bunga (Flowers)', desc: isEn ? 'Perfect for a love story nurtured and continually blooming.' : 'Cocok untuk cerita cinta yang dirawat dan terus bertumbuh mekar.' },
    { id: 'Seasons (4 Musim)', icon: <Leaf size={24} strokeWidth={1.5} />, title: isEn ? 'Seasons' : 'Musim (Seasons)', desc: isEn ? 'Highlighting how you walked through sunny and rainy days together.' : 'Menyoroti bagaimana kalian melewati masa senang dan sulit bersama.' },
    { id: 'Time (Waktu)', icon: <Clock size={24} strokeWidth={1.5} />, title: isEn ? 'Time' : 'Waktu (Time)', desc: isEn ? 'Focused on every second, day, and year of time spent together.' : 'Fokus pada detik, hari, dan tahun perjalanan yang telah dihabiskan.' },
    { id: 'Keepsakes (Kenangan)', icon: <Heart size={24} strokeWidth={1.5} />, title: isEn ? 'Keepsakes' : 'Kenangan (Keepsakes)', desc: isEn ? 'Preserving little meaningful things that witnessed your journey.' : 'Mengabadikan hal-hal kecil bermakna yang menjadi saksi cerita kalian.' }
  ];

  const REASON_THEMES = [
    { id: 'qualities', icon: <Star size={24} strokeWidth={1.5} />, title: isEn ? 'Special Qualities' : 'Sifat Spesial (Qualities)', desc: isEn ? 'Things that make them so special in your eyes.' : 'Hal-hal yang membuat dia begitu istimewa di mata kamu.' },
    { id: 'moments', icon: <Camera size={24} strokeWidth={1.5} />, title: isEn ? 'Cherished Moments' : 'Momen Berharga (Moments)', desc: isEn ? 'Beautiful memories that you have shared together.' : 'Kenangan-kenangan indah yang kalian lalui bersama.' },
    { id: 'promises', icon: <HeartHandshake size={24} strokeWidth={1.5} />, title: isEn ? 'Hopes & Promises' : 'Harapan & Janji (Promises)', desc: isEn ? 'Heartfelt wishes or sweet promises you want to share with them.' : 'Harapan terbaik atau janji manis yang ingin kamu sampaikan untuk dia.' },
    { id: 'gratitude', icon: <Sparkles size={24} strokeWidth={1.5} />, title: isEn ? 'Gratitude' : 'Rasa Syukur (Gratitude)', desc: isEn ? 'Everything you are grateful for having them in your life.' : 'Segala hal yang kamu syukuri atas kehadiran dia.' },
  ];

  const LANGUAGES = [
    { id: 'Full Indonesia', label: isEn ? 'Full Indonesian' : 'Full Indonesia', hint: isEn ? 'Letter is written 100% in Indonesian.' : 'Surat ditulis 100% dalam Bahasa Indonesia.' },
    { id: 'Full English', label: isEn ? 'Full English' : 'Full English', hint: isEn ? 'Letter is written 100% in English.' : 'Surat ditulis 100% dalam Bahasa Inggris.' },
    { id: 'Indoglish', label: isEn ? 'Indoglish' : 'Indoglish', hint: isEn ? 'A natural blend of Indonesian and English.' : 'Campuran Bahasa Indonesia dan Inggris secara natural.' },
    { id: 'Lainnya / Custom', label: isEn ? 'Other / Custom' : 'Lainnya / Custom', hint: isEn ? 'Type your custom language preference below.' : 'Ketik preferensi bahasamu sendiri di bawah ini.' },
  ];
  const VIBES = [
    { id: 'Santai', label: isEn ? 'Casual' : 'Santai', hint: isEn ? 'Casual and conversational, using natural everyday language.' : 'Kasual, seperti ngobrol biasa, pakai kata-kata sehari-hari.' },
    { id: 'Puitis', label: isEn ? 'Poetic' : 'Puitis', hint: isEn ? 'Meaningful and flowing, yet natural without feeling stiff.' : 'Bermakna dan mengalir, tapi tetap natural, bukan kaku seperti sajak.' },
    { id: 'Romantis', label: isEn ? 'Romantic' : 'Romantis', hint: isEn ? 'Warm, intimate, and filled with sincere affection.' : 'Hangat, intim, dan penuh rasa sayang yang tulus.' },
    { id: 'Mengharukan', label: isEn ? 'Heartfelt' : 'Mengharukan', hint: isEn ? 'Deep and emotional, perfect for feelings hard to put into words.' : 'Dalam, emosional, cocok untuk perasaan yang sulit diungkapkan.' },
    { id: 'Bucin / ABG', label: isEn ? 'Sweet & Playful' : 'Bucin / ABG', hint: isEn ? 'Sweet, playful, and affectionately close.' : 'Manja, santai, dengan repetisi kata yang akrab.' },
  ];
  const MOMENTS = [
    { id: 'Ultah', label: isEn ? 'Birthday' : 'Ultah' },
    { id: 'Anniversary', label: isEn ? 'Anniversary' : 'Anniversary' },
    { id: 'LDR', label: isEn ? 'LDR' : 'LDR' },
    { id: 'Wisuda', label: isEn ? 'Graduation' : 'Wisuda' },
    { id: 'Friendship', label: isEn ? 'Friendship' : 'Friendship' },
    { id: 'Just Because', label: isEn ? 'Just Because' : 'Just Because' },
    { id: 'Lainnya', label: isEn ? 'Other' : 'Lainnya' },
  ];
  const RELATIONSHIPS = [
    { id: 'Pasangan', label: isEn ? 'Partner / Couple' : 'Pasangan' },
    { id: 'Sahabat', label: isEn ? 'Best Friend' : 'Sahabat' },
    { id: 'Teman', label: isEn ? 'Friend' : 'Teman' },
    { id: 'Keluarga', label: isEn ? 'Family' : 'Keluarga' },
    { id: 'Lainnya', label: isEn ? 'Other' : 'Lainnya' },
  ];

  return (
    <div ref={formRootRef} style={{
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      transition: 'background-color 0.8s ease, color 0.8s ease',
      padding: 'clamp(1.5rem, 5vw, 3rem) clamp(0.75rem, 3vw, 1.5rem)',
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
        padding: 'clamp(1.15rem, 4vw, 2.5rem)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        {step < 5 && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {/* Top Bar: Language Switcher (Flows naturally without absolute collision) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5rem', width: '100%' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.32rem 0.65rem',
                border: `1px solid ${currentTheme.text}25`,
                borderRadius: '999px',
                fontSize: '0.68rem',
                opacity: 0.85,
                background: 'rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
              }}>
                <span style={{ opacity: 0.75 }}>{interfaceLocale === 'id' ? 'Bahasa' : 'Language'}</span>
                <select
                  value={interfaceLocale}
                  onChange={(event) => {
                    const nextLocale = event.target.value;
                    setInterfaceLocale(nextLocale);
                    try { localStorage.setItem(`memoria-form-locale-${slug}`, nextLocale); } catch { /* ignore */ }
                  }}
                  aria-label="Interface language"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="id" style={{ background: currentTheme.bg, color: currentTheme.text }}>Indonesia</option>
                  <option value="en" style={{ background: currentTheme.bg, color: currentTheme.text }}>English</option>
                </select>
              </label>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.65rem, 5vw, 2rem)',
              fontWeight: 400,
              margin: '0 0 0.4rem 0',
              fontStyle: 'italic',
              lineHeight: 1.2,
            }}>
              Digital Atelier
            </h1>
            <p style={{ fontSize: '0.82rem', opacity: 0.7, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>{isEn ? 'About You' : 'Tentang Kalian'}</h2>
            
            {/* Mode Selector: Personal vs Circle */}
            <div style={{ marginBottom: '1.75rem', background: 'rgba(0,0,0,0.03)', border: `1px solid ${currentTheme.text}20`, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, opacity: 0.9, margin: '0 0 0.25rem 0' }}>
                  {isEn ? 'Gift Format Options' : 'Pilihan Format Kado'}
                </label>
                <p style={{ fontSize: '0.72rem', opacity: 0.65, margin: 0, lineHeight: 1.4 }}>
                  {isEn ? 'Choose an intimate format for two or include heartfelt wishes from friends.' : 'Pilih format intim berdua atau sertakan pesan para sahabat.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {/* Button 1: Personal Edition */}
                <button
                  type="button"
                  onClick={() => update('isCircle', false)}
                  style={{
                    padding: '0.85rem 0.8rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: !data.isCircle ? currentTheme.text : 'rgba(0,0,0,0.02)',
                    color: !data.isCircle ? currentTheme.bg : currentTheme.text,
                    border: `1.5px solid ${!data.isCircle ? currentTheme.text : currentTheme.text + '25'}`,
                    boxShadow: !data.isCircle ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: !data.isCircle ? `${currentTheme.bg}25` : `${currentTheme.text}10`,
                        color: !data.isCircle ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${!data.isCircle ? currentTheme.bg + '40' : currentTheme.text + '18'}`,
                      }}
                    >
                      {isEn ? 'Main Format' : 'Format Utama'}
                    </span>
                    {!data.isCircle && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.01em' }}>
                      Personal Edition
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: !data.isCircle ? 0.8 : 0.55, marginTop: '2px', lineHeight: 1.35 }}>
                      {isEn ? 'Exclusively for the two of you from you alone' : 'Khusus berdua dari kamu sendiri'}
                    </div>
                    <div style={{ fontSize: '0.66rem', opacity: !data.isCircle ? 0.65 : 0.45, marginTop: '4px', lineHeight: 1.3 }}>
                      {isEn ? 'Best for: All Special Occasions' : 'Cocok: Semua Momen Spesial'}
                    </div>
                  </div>
                </button>

                {/* Button 2: Circle Edition */}
                <button
                  type="button"
                  onClick={() => update('isCircle', true)}
                  style={{
                    padding: '0.85rem 0.8rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: data.isCircle ? currentTheme.text : 'rgba(0,0,0,0.02)',
                    color: data.isCircle ? currentTheme.bg : currentTheme.text,
                    border: `1.5px solid ${data.isCircle ? currentTheme.text : currentTheme.text + '25'}`,
                    boxShadow: data.isCircle ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: data.isCircle ? `${currentTheme.bg}25` : `${currentTheme.text}10`,
                        color: data.isCircle ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${data.isCircle ? currentTheme.bg + '40' : currentTheme.text + '18'}`,
                      }}
                    >
                      {isEn ? 'New · Optional' : 'Baru · Opsional'}
                    </span>
                    {data.isCircle && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.01em' }}>
                      Circle Edition
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: data.isCircle ? 0.8 : 0.55, marginTop: '2px', lineHeight: 1.35 }}>
                      {isEn ? 'Main gift + messages from friends' : 'Kado utama + pesan sahabat'}
                    </div>
                    <div style={{ fontSize: '0.66rem', opacity: data.isCircle ? 0.65 : 0.45, marginTop: '4px', lineHeight: 1.3 }}>
                      {isEn ? 'Best for: Birthdays, Graduations & Farewells' : 'Cocok: Ulang Tahun, Wisuda & Perpisahan'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Dual Preview Buttons: Personal vs Circle */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  marginTop: '0.85rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => openPreviewModal('personal')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    padding: '0.65rem 0.85rem',
                    minHeight: '42px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: currentTheme.text,
                    background: `${currentTheme.text}08`,
                    border: `1px solid ${currentTheme.text}18`,
                    transition: 'all 0.2s',
                    lineHeight: 1.25,
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${currentTheme.text}14`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${currentTheme.text}08`)}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isEn ? 'View Personal Sample' : 'Lihat Contoh Personal'}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => openPreviewModal('circle')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    padding: '0.65rem 0.85rem',
                    minHeight: '42px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: currentTheme.text,
                    background: `${currentTheme.text}08`,
                    border: `1px solid ${currentTheme.text}18`,
                    transition: 'all 0.2s',
                    lineHeight: 1.25,
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${currentTheme.text}14`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${currentTheme.text}08`)}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isEn ? 'View Circle Sample' : 'Lihat Contoh Circle'}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>
              </div>

              {/* Quota Settings (Only when Circle Edition is active) */}
              {data.isCircle && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: `1px solid ${currentTheme.text}15` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{isEn ? 'Number of Friends' : 'Jumlah Teman'}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.65 }}>{isEn ? 'Choose 1 – 20 friends' : 'Pilih 1 – 20 teman'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => update('circleQuota', Math.max(1, (data.circleQuota || 8) - 1))}
                        disabled={(data.circleQuota || 8) <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.text}35`,
                          background: 'transparent',
                          color: currentTheme.text,
                          fontSize: '1.1rem',
                          cursor: (data.circleQuota || 8) <= 1 ? 'not-allowed' : 'pointer',
                          opacity: (data.circleQuota || 8) <= 1 ? 0.35 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '28px', textAlign: 'center', fontFamily: 'monospace' }}>
                        {data.circleQuota || 8}
                      </span>
                      <button
                        type="button"
                        onClick={() => update('circleQuota', Math.min(20, (data.circleQuota || 8) + 1))}
                        disabled={(data.circleQuota || 8) >= 20}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.text}35`,
                          background: 'transparent',
                          color: currentTheme.text,
                          fontSize: '1.1rem',
                          cursor: (data.circleQuota || 8) >= 20 ? 'not-allowed' : 'pointer',
                          opacity: (data.circleQuota || 8) >= 20 ? 0.35 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', opacity: 0.65, lineHeight: 1.4, margin: '0' }}>
                    {isEn ? 'Each friend will receive a dedicated link to submit their message along with photos, short videos, or voice recordings.' : 'Tiap teman akan menerima tautan khusus untuk mengirimkan pesan serta foto, video singkat, atau rekaman suara mereka.'}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isEn ? 'From (Your Name)' : 'Dari (Nama Anda)'}</label>
                <input 
                  value={data.sender || ''} onChange={e => update('sender', e.target.value)} 
                  placeholder={isEn ? 'Example: Alex' : 'Misal: Budi'}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = currentTheme.text}
                  onBlur={(e) => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isEn ? 'To (Full Name / Nickname)' : 'Untuk (Nama Lengkap / Nama Pendek)'}</label>
                <input 
                  value={data.recipient || ''} onChange={e => update('recipient', e.target.value)} 
                  placeholder={isEn ? 'Example: Nadia Aulia' : 'Misal: Nadia Aulia'}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = currentTheme.text}
                  onBlur={(e) => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem' }}>{isEn ? 'Term of Endearment ' : 'Panggilan Sayang '}<span style={{ opacity: 0.5 }}>({isEn ? 'Optional' : 'Opsional'})</span></label>
                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem', lineHeight: 1.4 }}>{isEn ? 'Special nickname you usually call them (e.g. darling, love, babe, etc.)' : 'Panggilan spesial yang biasa kamu sebut (misal: sayang, cinta, beb, dll)'}</p>
                <input 
                  value={data.nickname || ''} onChange={e => update('nickname', e.target.value)} 
                  placeholder={isEn ? 'Example: Darling, Babe, Love...' : 'Misal: Sayang, Beb, Cinta...'}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = currentTheme.text}
                  onBlur={(e) => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>{isEn ? 'Special Occasion' : 'Momen Spesial'}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {MOMENTS.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => update('moment', m.id)}
                      style={{ 
                        padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
                        background: data.moment === m.id ? currentTheme.text : 'transparent',
                        color: data.moment === m.id ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${data.moment === m.id ? currentTheme.text : currentTheme.text + '40'}`
                      }}
                    >
                      {m.label}
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
                      placeholder={isEn ? 'Write your special occasion here... (e.g. The day we first met)' : 'Tulis momen spesialmu di sini... (cth: Hari pertama kenalan)'}
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

                {(data.moment === 'Ultah' || data.moment === 'Anniversary') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1.25rem', overflow: 'hidden' }}
                  >
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                      {data.moment === 'Ultah' ? (isEn ? 'Which Birthday? (Optional)' : 'Ulang Tahun ke berapa? (Opsional)') : (isEn ? 'Which Anniversary? (Optional)' : 'Anniversary ke berapa? (Opsional)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={data.milestoneNumber || ''}
                      onChange={e => update('milestoneNumber', e.target.value)}
                      placeholder={data.moment === 'Ultah' ? (isEn ? 'E.g. 18, 20, 21...' : 'Cth: 18, 20, 21...') : (isEn ? 'E.g. 1, 2, 5...' : 'Cth: 1, 2, 5...')}
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

                {/* Tanggal Lahir Penerima — hanya muncul kalau Ultah */}
                {data.moment === 'Ultah' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1.25rem', overflow: 'hidden' }}
                  >
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                      {isEn ? "Recipient's Date of Birth (Optional)" : 'Tanggal Lahir Penerima (Opsional)'}
                    </label>
                    <input
                      type="date"
                      value={data.recipientBirthdate || ''}
                      onChange={e => update('recipientBirthdate', e.target.value)}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit',
                        padding: '0.5rem 0', fontSize: '0.95rem', outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={e => e.target.style.borderColor = currentTheme.text}
                      onBlur={e => e.target.style.borderColor = `${currentTheme.text}40`}
                    />
                    <p style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: '0.3rem', marginBottom: 0 }}>
                      {isEn ? "Used to calculate how many years of the recipient's life journey." : 'Digunakan untuk menghitung berapa tahun perjalanan hidup penerima.'}
                    </p>
                  </motion.div>
                )}

                {/* Tanggal Penting — disembunyikan jika Ultah karena sudah ada input Tanggal Lahir Penerima */}
                {data.moment !== 'Ultah' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1.25rem', overflow: 'hidden' }}
                  >
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                      {data.moment === 'Anniversary' ? (isEn ? 'Anniversary Date (Optional)' : 'Tanggal Anniversary (Opsional)') : (isEn ? 'Special Date (Optional)' : 'Tanggal Penting (Opsional)')}
                    </label>
                    <input 
                      type="date"
                      value={data.specialDate || ''} 
                      onChange={e => update('specialDate', e.target.value)} 
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

                {data.specialDate && data.moment === 'Lainnya' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1rem', overflow: 'hidden' }}
                  >
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isEn ? 'Occasion / Event Name (Optional)' : 'Nama Momen / Acara (Opsional)'}</label>
                    <input 
                      type="text"
                      value={data.specialDateOccasion || ''} 
                      onChange={e => update('specialDateOccasion', e.target.value)} 
                      placeholder={isEn ? 'E.g. The day we first met, Graduation, etc...' : 'Cth: Hari pertama kenalan, Wisuda, dll...'}
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

              {/* Hubungan Pengirim ke Penerima */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.75rem' }}>{isEn ? `You and ${data.recipient || 'the recipient'} are...` : `Kamu dan ${data.recipient || 'penerima'} adalah...`}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {RELATIONSHIPS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => update('relationship', r.id)}
                      style={{
                        padding: '0.5rem 1.1rem', borderRadius: '30px', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.3s',
                        background: data.relationship === r.id ? currentTheme.text : 'transparent',
                        color: data.relationship === r.id ? currentTheme.bg : currentTheme.text,
                        border: `1px solid ${data.relationship === r.id ? currentTheme.text : currentTheme.text + '40'}`
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              </div>
          </div>
        )}

        {/* --- STEP 2: VIBE & STYLE --- */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 500 }}>{isEn ? 'Style & Mood' : 'Gaya & Suasana'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>{isEn ? 'Choose Color Palette' : 'Pilih Palet Warna'}</label>
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

              {/* Metaphor section hidden — no longer used */}

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{isEn ? 'Reasons & Memories Section Theme' : 'Tema Kartu Alasan & Kenangan'}</label>
                  <button
                    type="button"
                    onClick={() => openPreviewModal('reasons')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '16px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: currentTheme.text,
                      background: `${currentTheme.text}0a`,
                      border: `1px solid ${currentTheme.text}20`,
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${currentTheme.text}16`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${currentTheme.text}0a`)}
                  >
                    <span>{isEn ? 'View Sample' : 'Lihat Contoh'}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1.25rem', lineHeight: 1.4 }}>{isEn ? 'Choose a story perspective for the cards about them.' : 'Pilih sudut pandang cerita untuk kartu-kartu pesan tentang dia.'}</p>
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

              {/* LANGUAGE SELECTION */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isEn ? 'Letter Language' : 'Bahasa Penulisan'}</label>
                <p style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: '1rem', lineHeight: 1.5 }}>{isEn ? 'Choose one primary language for your letter.' : 'Pilih satu bahasa utama untuk surat kamu.'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  {LANGUAGES.map(lang => {
                    const isSelected = data.language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => update('language', lang.id)}
                        style={{
                          padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.3s',
                          background: isSelected ? currentTheme.text : 'transparent',
                          color: isSelected ? currentTheme.bg : currentTheme.text,
                          border: `1px solid ${isSelected ? currentTheme.text : currentTheme.text + '40'}`,
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
                {/* Hint for selected language */}
                {data.language && (() => {
                  const selected = LANGUAGES.find(l => l.id === data.language);
                  return selected ? (
                    <p style={{ fontSize: '0.72rem', opacity: 0.55, lineHeight: 1.5, padding: '0.5rem 0.75rem', borderLeft: `2px solid ${currentTheme.text}40`, marginTop: '0.25rem' }}>
                      {selected.hint}
                    </p>
                  ) : null;
                })()}
                {/* Custom language text input */}
                {data.language === 'Lainnya / Custom' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      value={data.customLanguage || ''}
                      onChange={e => update('customLanguage', e.target.value)}
                      placeholder={isEn ? 'Example: Javanese, Korean-English mix, etc...' : 'Contoh: Bahasa Jawa, campuran Korea-Indonesia, dll...'}
                      style={{
                        width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem',
                        background: 'rgba(0,0,0,0.1)', border: `1px solid ${currentTheme.text}40`,
                        color: 'inherit', outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* VIBE / TONE SELECTION */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isEn ? 'Writing Style (Vibe)' : 'Gaya Penulisan (Vibe)'}</label>
                <p style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: '1rem', lineHeight: 1.5 }}>{isEn ? 'You can choose more than one for the best result.' : 'Boleh pilih lebih dari satu untuk hasil yang lebih pas.'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  {VIBES.map(vibe => {
                    const toneArr = Array.isArray(data.tone) ? data.tone : (data.tone ? [data.tone] : []);
                    const isSelected = toneArr.includes(vibe.id);
                    return (
                      <button
                        key={vibe.id}
                        onClick={() => {
                          let current = [...toneArr];
                          if (isSelected) {
                            current = current.filter(t => t !== vibe.id);
                            if (current.length === 0) current = [vibe.id];
                          } else {
                            current.push(vibe.id);
                          }
                          update('tone', current);
                        }}
                        style={{
                          padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.3s',
                          background: isSelected ? currentTheme.text + '25' : 'transparent',
                          color: currentTheme.text,
                          border: `1px solid ${isSelected ? currentTheme.text : currentTheme.text + '40'}`,
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {vibe.label}
                      </button>
                    );
                  })}
                </div>
                {/* Hints for selected vibes */}
                {Array.isArray(data.tone) && data.tone.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {data.tone.map(t => {
                      const v = VIBES.find(vb => vb.id === t);
                      return v ? (
                        <p key={t} style={{ fontSize: '0.72rem', opacity: 0.55, lineHeight: 1.5, padding: '0.4rem 0.75rem', borderLeft: `2px solid ${currentTheme.text}40` }}>
                          <strong>{v.label.split(' ')[0]}</strong>: {v.hint}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: THE MESSAGE --- */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>{isEn ? 'Main Message' : 'Pesan Utama'}</h2>
              <button
                type="button"
                onClick={() => openPreviewModal('letter')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: currentTheme.text,
                  background: `${currentTheme.text}0a`,
                  border: `1px solid ${currentTheme.text}20`,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${currentTheme.text}16`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${currentTheme.text}0a`)}
              >
                <span>{isEn ? 'View Sample Letter' : 'Lihat Contoh Surat'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>
              {isEn
                ? 'Feel free to share your thoughts casually. Our copywriters will craft them into beautiful, poetic prose.'
                : 'Ceritakan saja intinya secara santai. Tim copywriter kami yang akan mengubahnya menjadi kalimat yang sangat puitis dan indah.'}
              <br /><br />
              <strong>Hint:</strong>{' '}
              {isEn
                ? 'The more stories and memories you share, the more personal and meaningful your gift will be.'
                : 'Semakin banyak pesan / cerita yang kamu bagikan, maka akan semakin personal dan istimewa hasil gift-nya nanti.'}
            </p>
            
            <textarea 
              value={data.message || ''} 
              onChange={e => update('message', e.target.value)} 
              placeholder={isEn ? 'Example: Thank you for always being patient with me. I just want you to know how truly grateful and lucky I am to have you in my life...' : 'Contoh: Makasih ya udah sabar ngadepin aku yang kadang egois. Aku cuma mau bilang kalau aku beruntung banget punya kamu...'}
              style={{ 
                width: '100%', minHeight: '200px', background: 'rgba(0,0,0,0.1)', border: `1px solid ${currentTheme.text}40`, 
                borderRadius: '12px', color: 'inherit', padding: '1rem', fontSize: '1rem', outline: 'none', resize: 'vertical', lineHeight: 1.6
              }}
            />

            <div style={{ marginTop: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>{isEn ? 'Background Music' : 'Lagu Latar (Backsound)'}</label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'playlist'} onChange={() => {update('musicChoice', 'playlist'); update('music', '');}} style={{ accentColor: currentTheme.text }} />
                  {isEn ? 'Choose from Playlist' : 'Pilih dari Playlist'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'request'} onChange={() => update('musicChoice', 'request')} style={{ accentColor: currentTheme.text }} />
                  {isEn ? 'Request Another Song' : 'Request Lagu Lain'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" checked={data.musicChoice === 'random'} onChange={() => {update('musicChoice', 'random'); update('music', '');}} style={{ accentColor: currentTheme.text }} />
                  {isEn ? 'Let Team Decide' : 'Biar Tim Pilihkan'}
                </label>
              </div>
              
              {data.musicChoice === 'playlist' && (
                <div style={{ marginTop: '0.5rem' }}>
                  {data.music ? (() => {
                    const musicInfo = formatMusicInfo(data.music);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${currentTheme.text}30` }}>
                        <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Music size={16} strokeWidth={2} opacity={0.8} />
                          <div>
                            <strong>{musicInfo.title}</strong>
                            {musicInfo.artist && <span style={{ opacity: 0.7 }}> - {musicInfo.artist}</span>}
                          </div>
                        </div>
                        <button onClick={() => { setTempSelectedMusic(musicInfo.full); setShowPlaylistModal(true); }} style={{ background: 'transparent', border: 'none', color: currentTheme.text, fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}>{isEn ? 'Change' : 'Ganti'}</button>
                      </div>
                    );
                  })() : (
                    <button 
                      onClick={() => { setTempSelectedMusic(''); setShowPlaylistModal(true); }}
                      style={{ 
                        width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.05)', border: `1px dashed ${currentTheme.text}60`, 
                        borderRadius: '12px', color: currentTheme.text, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                      }}
                    >
                      <Music size={18} strokeWidth={2} /> {isEn ? 'Browse Our Playlist' : 'Buka Daftar Playlist Kami'}
                    </button>
                  )}
                </div>
              )}

              {data.musicChoice === 'request' && (
                <input 
                  value={data.music || ''} onChange={e => update('music', e.target.value)} 
                  placeholder={isEn ? 'Example: Perfect - Ed Sheeran' : 'Misal: Sempurna - Andra & The Backbone'}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }}
                />
              )}
            </div>
          </div>
        )}

        {/* --- STEP 4: MEMORIES (MEDIA) --- */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>{isEn ? 'Memory Gallery' : 'Galeri Kenangan'}</h2>
              <button
                type="button"
                onClick={() => openPreviewModal(data.isCircle ? 'gallery-circle' : 'gallery')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: currentTheme.text,
                  background: `${currentTheme.text}0a`,
                  border: `1px solid ${currentTheme.text}20`,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${currentTheme.text}16`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${currentTheme.text}0a`)}
              >
                <span>{isEn ? 'View Sample Gallery' : 'Lihat Contoh Galeri'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {isEn ? 'Share your best moments. We will curate them into an elegant digital gallery.' : 'Bagikan momen-momen terbaik kalian. Kami akan menatanya ke dalam galeri digital yang cantik.'}
            </p>

            {data.isCircle && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: '14px', background: 'rgba(0,0,0,0.04)', border: `1px solid ${currentTheme.text}20`, marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, opacity: 0.85, margin: 0 }}>
                  {isEn ? (
                    <><strong>Circle Edition Mode:</strong> This gallery is <em>optional</em>. Your friends&apos; photos or videos will automatically appear on their respective wish cards. You can upload photos of the recipient or group moments if you want an extra gallery, or skip straight to the bottom.</>
                  ) : (
                    <><strong>Mode Circle Edition:</strong> Galeri ini <em>bersifat opsional</em>. Foto atau video teman-teman akan otomatis terpasang di kartu ucapan masing-masing. Kamu bisa unggah foto si penerima kado atau momen bersama jika ingin galeri tambahan, atau langsung lewati ke bawah.</>
                  )}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Main Gallery — Instant Upload */}
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{isEn ? 'Photo / Video Gallery' : 'Galeri Foto/Video'}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    {uploadedPhotos.filter(p => p.status === 'done').length} / 15 {isEn ? 'Saved' : 'Tersimpan'}
                  </span>
                </label>

                {/* Thumbnail grid */}
                {uploadedPhotos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                    {uploadedPhotos.map((item) => (
                      <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                        {/* Preview */}
                        {item.isVideo ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.65rem', opacity: 0.7, flexDirection: 'column', gap: '4px' }}>
                            <Video size={20} strokeWidth={1.5} />
                            <span>VIDEO</span>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.localUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}

                        {/* Uploading overlay — spinner */}
                        {item.status === 'uploading' && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '22px', height: '22px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          </div>
                        )}

                        {/* Done overlay — checkmark */}
                        {item.status === 'done' && (
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(34,197,94,0.9)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}

                        {/* Error overlay — retry */}
                        {item.status === 'error' && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.6rem', color: '#f87171' }}>{isEn ? 'Failed' : 'Gagal'}</span>
                            <button
                              style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                              onClick={() => setUploadedPhotos(prev => prev.filter(p => p.id !== item.id))}
                            >
                              {isEn ? 'Delete' : 'Hapus'}
                            </button>
                          </div>
                        )}

                        {/* Delete button (top-right) — always visible on done */}
                        {item.status === 'done' && (
                          <button
                            onClick={() => setUploadedPhotos(prev => prev.filter(p => p.id !== item.id))}
                            style={{ position: 'absolute', top: '3px', right: '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            title={isEn ? 'Remove this photo' : 'Hapus foto ini'}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more button */}
                {uploadedPhotos.length < 15 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%', padding: '0.85rem', border: `1px dashed ${currentTheme.text}50`,
                      borderRadius: '12px', background: 'rgba(0,0,0,0.04)', color: currentTheme.text,
                      cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  >
                    <ImageIcon size={18} strokeWidth={1.5} />
                    {uploadedPhotos.length === 0 ? (isEn ? 'Choose Photos / Videos (max. 15)' : 'Pilih Foto / Video (maks. 15)') : (isEn ? '+ Add More Photos / Videos' : '+ Tambah Foto / Video Lagi')}
                  </button>
                )}
                <input type="file" multiple accept="image/*,video/mp4" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, false)} />
                <p style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: '0.5rem', textAlign: 'center' }}>{isEn ? 'Video max. 15MB. Photos will be automatically compressed.' : 'Video maks. 15MB. Foto akan dikompres otomatis.'}</p>
              </div>

              {/* Secret Ending — Instant Upload */}
              <div style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: '0.2s', animationFillMode: 'both' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{isEn ? 'Secret Ending Photo / Video' : 'Foto/Video Kejutan Akhir'}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{isEn ? 'Optional' : 'Opsional'}</span>
                </label>

                <div
                  onClick={() => secretInputRef.current?.click()}
                  style={{
                    border: `1px dashed ${secretPhoto ? currentTheme.text : currentTheme.text + '60'}`,
                    borderRadius: '16px', padding: '1.5rem 1rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: secretPhoto?.status === 'done' ? currentTheme.text + '10' : 'rgba(0,0,0,0.05)',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {secretPhoto ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                      {/* Preview */}
                      {secretPhoto.isVideo ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.9rem', fontWeight: 500, gap: '8px' }}>
                          <Video size={20} strokeWidth={2} opacity={0.8} /> {isEn ? 'VIDEO SELECTED' : 'VIDEO TERPILIH'}
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={secretPhoto.localUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}

                      {/* Spinner overlay */}
                      {secretPhoto.status === 'uploading' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                        </div>
                      )}

                      {/* Done badge */}
                      {secretPhoto.status === 'done' && (
                        <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(34,197,94,0.9)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}

                      {/* Hover to change */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{isEn ? 'Click to change' : 'Klik untuk mengganti'}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <Lock size={48} strokeWidth={1} opacity={0.7} />
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>{isEn ? 'Choose a special photo / video for the secret ending reveal' : 'Pilih foto / video spesial untuk kejutan di akhir'}</div>
                    </>
                  )}
                </div>

                {/* Remove secret photo */}
                {secretPhoto && secretPhoto.status === 'done' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSecretPhoto(null); }}
                    style={{ marginTop: '0.5rem', background: 'transparent', border: 'none', color: currentTheme.text, opacity: 0.5, fontSize: '0.78rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center' }}
                  >
                    {isEn ? 'Remove secret media' : 'Hapus foto kejutan'}
                  </button>
                )}
                <input type="file" accept="image/*,video/mp4" ref={secretInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, true)} />
              </div>

              {/* Deadline — di sini sebelum submit */}
              <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentTheme.text}15` }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>{isEn ? 'When does the gift need to be ready? (Optional)' : 'Kapan gift harus jadi? (Opsional)'}</label>
                <p style={{ fontSize: '0.78rem', opacity: 0.55, marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {isEn ? 'Let us know if you have a deadline so we can prioritize your order.' : 'Beri tahu kami jika ada deadline agar kami bisa memprioritaskan pesananmu.'}
                </p>
                <input
                  type="datetime-local"
                  value={data.deadline || ''}
                  onChange={e => update('deadline', e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit',
                    padding: '0.5rem 0', fontSize: '0.95rem', outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onBlur={e => e.target.style.borderColor = `${currentTheme.text}40`}
                />
              </div>

              {/* Secret PIN Protection */}
              <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentTheme.text}15` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <Lock size={16} /> {isEn ? 'Enable Security PIN' : 'Aktifkan Security PIN'}
                    </label>
                    <p style={{ fontSize: '0.78rem', opacity: 0.55, marginTop: '0.3rem', lineHeight: 1.4 }}>
                      {isEn ? 'Protect your digital gift with a secret PIN.' : 'Lindungi kado digitalmu dengan PIN rahasia.'}
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={data.pinEnabled || false}
                      onChange={e => update('pinEnabled', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: data.pinEnabled ? currentTheme.text : 'rgba(0,0,0,0.1)',
                      transition: '.3s', borderRadius: '24px',
                      border: `1px solid ${data.pinEnabled ? 'transparent' : currentTheme.text + '25'}`
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '18px', width: '18px',
                        left: data.pinEnabled ? '22px' : '2px', bottom: '2px',
                        backgroundColor: data.pinEnabled ? currentTheme.bg : currentTheme.text,
                        transition: '.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
                
                <AnimatePresence>
                  {data.pinEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: '1.2rem', paddingLeft: '1rem', borderLeft: `2px solid ${currentTheme.text}20`, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.2rem' }}>{isEn ? 'PIN Code (Up to 6 Digits)' : 'PIN Code (Maks 6 Angka)'}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={data.pinCode || ''}
                            onChange={e => update('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder={isEn ? 'Example: 123456' : 'Contoh: 123456'}
                            style={{
                              width: '100%', background: 'transparent', border: 'none',
                              borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit',
                              padding: '0.5rem 0', fontSize: '0.95rem', outline: 'none',
                              transition: 'border-color 0.3s'
                            }}
                            onFocus={e => e.target.style.borderColor = currentTheme.text}
                            onBlur={e => e.target.style.borderColor = `${currentTheme.text}40`}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.2rem' }}>{isEn ? 'PIN Hint / Clue (Optional)' : 'PIN Hint / Clue (Opsional)'}</label>
                          <input
                            type="text"
                            value={data.pinHint || ''}
                            onChange={e => update('pinHint', e.target.value)}
                            placeholder={isEn ? 'Example: The day we first met' : 'Contoh: Tanggal jadian kita'}
                            style={{
                              width: '100%', background: 'transparent', border: 'none',
                              borderBottom: `1px solid ${currentTheme.text}40`, color: 'inherit',
                              padding: '0.5rem 0', fontSize: '0.95rem', outline: 'none',
                              transition: 'border-color 0.3s'
                            }}
                            onFocus={e => e.target.style.borderColor = currentTheme.text}
                            onBlur={e => e.target.style.borderColor = `${currentTheme.text}40`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentTheme.text}20` }}>
            {/* Inline validation error */}
            {validationError && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem',
                fontSize: '0.82rem', color: '#f87171', textAlign: 'center'
              }}>
                {validationError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrev}
                disabled={submitting || step === 1}
                style={{
                  background: 'transparent', border: 'none', color: currentTheme.text, fontSize: '0.9rem',
                  fontWeight: 500, cursor: step === 1 ? 'default' : 'pointer', opacity: step === 1 ? 0 : 0.7,
                  padding: '0.8rem 1rem', minHeight: '44px', touchAction: 'manipulation'
                }}
              >
                {isEn ? '← Back' : '← Kembali'}
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  style={{
                    background: currentTheme.text, color: currentTheme.bg, border: 'none',
                    padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '0.9rem',
                    fontWeight: 600, cursor: 'pointer', minHeight: '44px', minWidth: '140px',
                    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none'
                  }}
                >
                  {isEn ? 'Next →' : 'Selanjutnya →'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const stillUploading = uploadedPhotos.some(p => p.status === 'uploading') ||
                      (secretPhoto && secretPhoto.status === 'uploading');
                    if (stillUploading) {
                      alert(isEn ? 'Media is still uploading, please wait a moment.' : 'Foto masih dalam proses upload, mohon tunggu sebentar.');
                      return;
                    }
                    const hasError = uploadedPhotos.some(p => p.status === 'error') ||
                      (secretPhoto && secretPhoto.status === 'error');
                    if (hasError) {
                      alert(isEn ? 'Some media failed to upload. Please remove or re-upload the error files before continuing.' : 'Ada foto/media yang gagal diunggah. Mohon hapus atau unggah ulang file yang error sebelum melanjutkan.');
                      return;
                    }
                    if (data.pinEnabled && (!data.pinCode || data.pinCode.length < 4)) {
                      alert(isEn ? 'PIN Code must be at least 4 digits.' : 'PIN Code harus terdiri dari minimal 4 digit angka.');
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                  disabled={submitting}
                  style={{
                    background: currentTheme.text, color: currentTheme.bg, border: 'none',
                    padding: '0.8rem 2.5rem', borderRadius: '30px', fontSize: '0.9rem',
                    fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting ? 0.7 : 1, minHeight: '44px',
                    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {isEn ? 'Review Order →' : 'Tinjau Formulir →'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- STEP 5: SUCCESS --- */}
        {step === 5 && (() => {
          const isUnbox = String(slug || '').toLowerCase().includes('unbox');
          const waNumber = '6281936109076';

          // ── If this is a Circle Order, render the Coordinator Tracker Panel ──
          if (data.isCircle) {
            const contributorUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${slug}` : '';
            const trackerUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${orderId || slug}` : '';
            const waShareGroupText = encodeURIComponent(
              isEn
                ? `Guys! Please leave your sweet wishes & upload photo memories for ${data.recipient}'s gift here (it's a secret, don't tell them!):\n\n` +
                  `${contributorUrl}\n\n` +
                  `Just tap the link and submit right from your phone. Thank you so much!`
                : `Guys! Tolong isi ucapan & upload foto kenangan kalian buat kado ultah ${data.recipient} di sini yaa (rahasia yaa jangan bilang orangnya):\n\n` +
                  `${contributorUrl}\n\n` +
                  `Tinggal klik link-nya dan submit langsung dari HP. Makasihh yaa guys!`
            );
            const waAtelierCircleText = encodeURIComponent(
              isEn
                ? `Hello Digital Atelier!\n\n` +
                  `I have registered a *Memoria Circle Edition* gift.\n\n` +
                  `*Order Details:*\n` +
                  `• Order ID: ${orderId || slug}\n` +
                  `• Coordinator: ${data.sender}\n` +
                  `• For: ${data.recipient}\n` +
                  `• Occasion: ${data.moment}${data.milestoneNumber ? ` (#${data.milestoneNumber})` : ''}\n` +
                  `• Collection Link: ${contributorUrl}\n\n` +
                  `I am now collecting wishes from friends. Thank you!`
                : `Halo Digital Atelier!\n\n` +
                  `Saya sudah mendaftarkan kado *Memoria Circle Edition*.\n\n` +
                  `*Detail Pesanan:*\n` +
                  `• Order ID: ${orderId || slug}\n` +
                  `• Koordinator: ${data.sender}\n` +
                  `• Untuk: ${data.recipient}\n` +
                  `• Momen: ${data.moment}${data.milestoneNumber ? ` (ke-${data.milestoneNumber})` : ''}\n` +
                  `• Link Pengumpulan: ${contributorUrl}\n\n` +
                  `Saya sedang mengumpulkan ucapan dari teman-teman. Terima kasih!`
            );

            return (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', animation: 'fadeIn 0.8s ease-out' }}>
                <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                  <Sparkles size={56} strokeWidth={1} opacity={0.8} />
                </div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: currentTheme.accent, fontWeight: 700 }}>
                  Done For You · Memoria Circle Edition
                </span>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.6rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: '0.3rem' }}>
                  {isEn ? 'Registration Successful!' : 'Pendaftaran Berhasil!'}
                </h2>
                <p style={{ fontSize: '0.86rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                  {isEn ? (
                    <>Surprise gift for <strong>{data.recipient}</strong> is ready to be collected. Share the link below to your friends group so each of them can send their wishes & photos.</>
                  ) : (
                    <>Kado kejutan untuk <strong>{data.recipient}</strong> siap dikumpulkan. Sebarkan link berikut ke grup teman-teman agar mereka bisa mengirimkan ucapan & foto masing-masing.</>
                  )}
                </p>

                {/* Coordinator Hub Card */}
                <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${currentTheme.text}20`, padding: '1.5rem', borderRadius: '18px', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {data.circleQuota || (createdSlots.length > 0 ? createdSlots.length : 8)} {isEn ? 'Unique Invitation Slots Ready' : 'Slot Undangan Unik Siap Digunakan'}
                  </div>
                  <p style={{ fontSize: '0.78rem', opacity: 0.7, margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                    {isEn
                      ? 'Each friend receives a dedicated link with a single-use unique token so only authorized friends can submit photos. Manage and share individual links directly from the Coordinator Tracker Hub.'
                      : 'Setiap teman mendapatkan link khusus dengan token unik sekali pakai agar tidak sembarang orang bisa mengunggah foto. Kelola dan bagikan link teman langsung dari Hub Pelacak Koordinator.'}
                  </p>
                  
                  <a
                    href={trackerUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      background: currentTheme.text,
                      color: currentTheme.bg,
                      textDecoration: 'none',
                      padding: '0.9rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                  >
                    {isEn ? 'Open Coordinator Tracker Hub & Copy Links' : 'Buka Hub Pelacak Koordinator & Salin Link Teman'}
                  </a>

                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{isEn ? 'Tracker Link:' : 'Tautan Pelacak:'}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{trackerUrl}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (trackerUrl) {
                          navigator.clipboard.writeText(trackerUrl);
                          setTrackerCopied(true);
                          setTimeout(() => setTrackerCopied(false), 2000);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${currentTheme.text}30`,
                        color: currentTheme.text,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                      }}
                    >
                      {trackerCopied ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}
                    </button>
                  </div>
                </div>

                {/* Live Wishes Tracker */}
                <div style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${currentTheme.text}20`, padding: '1.25rem', borderRadius: '18px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {isEn ? 'Incoming Friend Wishes' : 'Ucapan Teman Masuk'} ({trackerWishes.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        fetch(`/api/circle-wishes/${slug}`)
                          .then(r => r.ok ? r.json() : null)
                          .then(d => { if (d && Array.isArray(d.wishes)) setTrackerWishes(d.wishes); })
                          .catch(() => {});
                      }}
                      style={{ background: 'transparent', border: `1px solid ${currentTheme.text}30`, color: currentTheme.text, padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      {isEn ? 'Refresh' : 'Refresh'}
                    </button>
                  </div>

                  {trackerWishes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                      {trackerWishes.map((w, idx) => (
                        <div key={w.id || idx} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600 }}>{idx + 1}. {w.name}</span>
                          <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>{isEn ? 'Submitted' : 'Terkirim'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: 0, textAlign: 'center', padding: '1rem 0' }}>
                      {isEn ? 'No friend wishes received yet.' : 'Belum ada ucapan teman yang masuk.'}
                    </p>
                  )}
                </div>

                {/* Bookmark Tracker Link */}
                <div style={{ marginBottom: '1.5rem', fontSize: '0.75rem', opacity: 0.75, background: 'rgba(0,0,0,0.03)', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px dashed ${currentTheme.text}25` }}>
                  {isEn ? 'Save or bookmark this tracker link to check progress anytime:' : 'Simpan atau bookmark tautan pelacak ini untuk cek progres kapan saja:'} <br />
                  <a href={trackerUrl} style={{ color: currentTheme.text, fontWeight: 700, wordBreak: 'break-all', display: 'inline-block', marginTop: '4px' }}>
                    {trackerUrl}
                  </a>
                </div>

                {/* Action: Mark as Ready to Craft */}
                {!isOrderReady ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <button
                      type="button"
                      disabled={markingReady}
                      onClick={async () => {
                        if (!confirm(isEn ? 'Have all friends finished submitting? The order will immediately enter the FYA team crafting queue.' : 'Apakah semua teman sudah selesai mengisi? Pesanan akan langsung masuk antrean pembuatan tim FYA.')) return;
                        setMarkingReady(true);
                        try {
                          const res = await fetch(`/api/orders/${orderId || slug}/ready`, { method: 'POST' });
                          if (res.ok) {
                            setIsOrderReady(true);
                          } else {
                            alert(isEn ? 'Failed to update status. Please contact admin.' : 'Gagal mengirim status. Silakan hubungi admin.');
                          }
                        } catch {
                          alert(isEn ? 'Failed to update status.' : 'Gagal mengirim status.');
                        } finally {
                          setMarkingReady(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '50px',
                        border: 'none',
                        background: currentTheme.text,
                        color: currentTheme.bg,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: markingReady ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {markingReady ? (isEn ? 'Saving...' : 'Menyimpan...') : (isEn ? 'All Friends Submitted — Ready to Craft!' : 'Semua Teman Sudah Isi — Siap Dibuat!')}
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                    {isEn ? 'Order Status: "Ready to Craft!"' : 'Pesanan Berstatus "Siap Dibuat!"'}<br />
                    <span style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.9 }}>
                      {isEn ? 'The FYA team is crafting your final gift. We will notify you via WhatsApp once it is finished!' : 'Tim FYA sedang merangkai kado finalnya. Kami akan menghubungi kamu lewat WhatsApp begitu selesai!'}
                    </span>
                  </div>
                )}

                {/* WhatsApp Atelier Button */}
                <div>
                  <a
                    href={`https://wa.me/${waNumber}?text=${waAtelierCircleText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      background: 'transparent',
                      border: `1px solid ${currentTheme.text}30`,
                      color: currentTheme.text,
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {isEn ? 'Contact FYA Team via WhatsApp' : 'Hubungi Tim FYA via WhatsApp'}
                  </a>
                </div>
              </div>
            );
          }

          // ── Regular Solo / Couple Order Screen ──
          const waMessage = isUnbox
            ? encodeURIComponent(
                isEn
                  ? `Hello Digital Atelier!\n\n` +
                    `I have finished filling out the form for *Unbox the Memory (Physical Gift Box)*.\n\n` +
                    `*Order Details:*\n` +
                    `• Order ID: ${orderId || slug}\n` +
                    `• Package: Unbox the Memory (Physical Hampers Box)\n` +
                    `• From: ${data.sender}${data.relationship ? ` (${data.relationship})` : ''}\n` +
                    `• To: ${data.recipient}${data.nickname ? ` (Nickname: ${data.nickname})` : ''}\n` +
                    `• Occasion: ${data.moment}${data.milestoneNumber ? ` (#${data.milestoneNumber})` : ''}\n` +
                    (data.recipientBirthdate ? `• Recipient DOB: ${data.recipientBirthdate}\n` : '') +
                    (data.deadline ? `• Deadline: ${new Date(data.deadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}\n` : '') +
                    `\nPlease start crafting my digital gift and assembling the gift box. Thank you!`
                  : `Halo Digital Atelier!\n\n` +
                    `Saya sudah selesai mengisi form untuk paket *Unbox the Memory (Gift Box Fisik)*.\n\n` +
                    `*Detail Pesanan:*\n` +
                    `• Order ID: ${orderId || slug}\n` +
                    `• Paket: Unbox the Memory (Hampers Box Fisik)\n` +
                    `• Dari: ${data.sender}${data.relationship ? ` (${data.relationship})` : ''}\n` +
                    `• Untuk: ${data.recipient}${data.nickname ? ` (Panggilan: ${data.nickname})` : ''}\n` +
                    `• Momen: ${data.moment}${data.milestoneNumber ? ` (ke-${data.milestoneNumber})` : ''}\n` +
                    (data.recipientBirthdate ? `• Tgl Lahir Penerima: ${data.recipientBirthdate}\n` : '') +
                    (data.deadline ? `• Deadline: ${new Date(data.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}\n` : '') +
                    `\nMohon kado digitalnya segera diramu dan hampers box fisik saya segera dirakitkan yaa. Terima kasih!`
              )
            : encodeURIComponent(
                isEn
                  ? `Hello Digital Atelier!\n\n` +
                    `I have finished filling out the Memoria digital gift form.\n\n` +
                    `*Order Details:*\n` +
                    `• Order ID: ${orderId || slug}\n` +
                    `• From: ${data.sender}${data.relationship ? ` (${data.relationship})` : ''}\n` +
                    `• To: ${data.recipient}${data.nickname ? ` (Nickname: ${data.nickname})` : ''}\n` +
                    `• Occasion: ${data.moment}${data.milestoneNumber ? ` (#${data.milestoneNumber})` : ''}\n` +
                    (data.recipientBirthdate ? `• Recipient DOB: ${data.recipientBirthdate}\n` : '') +
                    (data.deadline ? `• Deadline: ${new Date(data.deadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}\n` : '') +
                    `\nPlease process my digital gift soon. Thank you!`
                  : `Halo Digital Atelier!\n\n` +
                    `Saya sudah selesai mengisi form kado digital Memoria.\n\n` +
                    `*Detail Pesanan:*\n` +
                    `• Order ID: ${orderId || slug}\n` +
                    `• Dari: ${data.sender}${data.relationship ? ` (${data.relationship})` : ''}\n` +
                    `• Untuk: ${data.recipient}${data.nickname ? ` (Panggilan: ${data.nickname})` : ''}\n` +
                    `• Momen: ${data.moment}${data.milestoneNumber ? ` (ke-${data.milestoneNumber})` : ''}\n` +
                    (data.recipientBirthdate ? `• Tgl Lahir Penerima: ${data.recipientBirthdate}\n` : '') +
                    (data.deadline ? `• Deadline: ${new Date(data.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}\n` : '') +
                    `\nMohon kado digital saya segera diproses ya. Terima kasih!`
              );

          return (
            <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.8s ease-out' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Sparkles size={64} strokeWidth={1} opacity={0.8} />
              </div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {isEn ? 'Gift Data Received' : 'Data Kado Diterima'}
              </h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {isEn ? (
                  <>Your details have been saved with care. Please notify us via WhatsApp so the atelier can start crafting the gift for <strong>{data.recipient}</strong> right away.</>
                ) : (
                  <>Data kamu sudah kami simpan dengan sepenuh hati. Silakan beritahu kami lewat WhatsApp agar kado untuk <strong>{data.recipient}</strong> segera diramu oleh atelier.</>
                )}
              </p>

              {/* Order ID Badge */}
              <div style={{ background: 'rgba(0,0,0,0.06)', border: `1px solid ${currentTheme.text}20`, padding: '1rem 1.5rem', borderRadius: '16px', display: 'inline-block', minWidth: '220px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isEn ? 'YOUR ORDER ID' : 'ID PESANAN ANDA'}</div>
                <div style={{ fontSize: '1.3rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.05em' }}>{orderId || slug}</div>
              </div>

              {/* WhatsApp CTA Button */}
              <div style={{ marginBottom: '1rem' }}>
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 32px',
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(37,211,102,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.35)'; }}
                >
                  {/* WhatsApp Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.486 3.53 1.337 5.006L2.001 22l5.13-1.322A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.065-1.112l-.292-.174-3.046.784.813-2.934-.19-.302A7.965 7.965 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                  </svg>
                  {isEn ? 'Notify Us via WhatsApp' : 'Beritahu Kami Lewat WhatsApp'}
                </a>
              </div>

              <p style={{ fontSize: '0.78rem', opacity: 0.55, lineHeight: 1.5, marginTop: '0.5rem' }}>
                {isEn ? 'Tap the button above so we can process your gift immediately.' : 'Tekan tombol di atas agar kami segera memproses kado kamu.'}
              </p>
            </div>
          );
        })()}


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
              position: 'fixed', inset: 0, zIndex: 300,
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
              {isEn ? 'Crafting Your Memories...' : 'Sedang Meramu Kenangan...'}
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
              {isEn ? 'Processing your media and stories with love' : 'Memproses media dan cerita Anda dengan cinta'}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{isEn ? 'Choose Background Music' : 'Pilih Lagu Latar'}</h3>
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
                  {tempSelectedMusic ? (isEn ? 'Select This Song' : 'Pilih Lagu Ini') : (isEn ? 'Please select a song first' : 'Pilih lagu terlebih dahulu')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- DUAL EDITION PREVIEW MODAL (PERSONAL VS CIRCLE) --- */}
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowPreviewModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 250,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: currentTheme.bg,
                color: currentTheme.text,
                width: '100%',
                maxWidth: '470px',
                height: '88vh',
                maxHeight: '840px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                border: `1px solid ${currentTheme.text}20`,
              }}
            >
              {/* Header with Segmented Tab Switcher */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${currentTheme.text}12`,
                  background: currentTheme.bg,
                  flexShrink: 0,
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {previewTab === 'reasons' || previewTab === 'letter' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                      {previewTab === 'letter' ? (isEn ? 'Sample: Main Letter' : 'Contoh: Surat Utama (Letter)') : (isEn ? 'Sample: Reason Cards' : 'Contoh: Kartu Alasan')}
                    </div>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: `${currentTheme.text}0e`,
                        border: `1px solid ${currentTheme.text}18`,
                        opacity: 0.8,
                      }}
                    >
                      Personal Edition
                    </span>
                  </div>
                ) : previewTab === 'gallery' || previewTab === 'gallery-circle' ? (
                  /* Segmented Control for Gallery */
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px',
                      borderRadius: '10px',
                      background: `${currentTheme.text}0a`,
                      border: `1px solid ${currentTheme.text}18`,
                      gap: '2px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (previewTab !== 'gallery') {
                          setPreviewTab('gallery');
                          setPreviewLoading(true);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.73rem',
                        fontWeight: previewTab === 'gallery' ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s',
                        background: previewTab === 'gallery' ? currentTheme.text : 'transparent',
                        color: previewTab === 'gallery' ? currentTheme.bg : currentTheme.text,
                      }}
                    >
                      Personal Edition
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewTab !== 'gallery-circle') {
                          setPreviewTab('gallery-circle');
                          setPreviewLoading(true);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.73rem',
                        fontWeight: previewTab === 'gallery-circle' ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s',
                        background: previewTab === 'gallery-circle' ? currentTheme.text : 'transparent',
                        color: previewTab === 'gallery-circle' ? currentTheme.bg : currentTheme.text,
                      }}
                    >
                      Circle Edition
                    </button>
                  </div>
                ) : (
                  /* Segmented Control for Format Kado (Step 1) */
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px',
                      borderRadius: '10px',
                      background: `${currentTheme.text}0a`,
                      border: `1px solid ${currentTheme.text}18`,
                      gap: '2px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (previewTab !== 'personal') {
                          setPreviewTab('personal');
                          setPreviewLoading(true);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.73rem',
                        fontWeight: previewTab === 'personal' ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s',
                        background: previewTab === 'personal' ? currentTheme.text : 'transparent',
                        color: previewTab === 'personal' ? currentTheme.bg : currentTheme.text,
                      }}
                    >
                      Personal Edition
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewTab !== 'circle') {
                          setPreviewTab('circle');
                          setPreviewLoading(true);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.73rem',
                        fontWeight: previewTab === 'circle' ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s',
                        background: previewTab === 'circle' ? currentTheme.text : 'transparent',
                        color: previewTab === 'circle' ? currentTheme.bg : currentTheme.text,
                      }}
                    >
                      Circle Edition
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <a
                    href={
                      previewTab === 'gallery'
                        ? '/untuk-nadia?preview=gallery#gallery-section'
                        : previewTab === 'gallery-circle'
                        ? '/auto-circle?preview=gallery#gallery-section'
                        : previewTab === 'circle'
                        ? '/auto-circle?preview=circle#circle-wishes-section'
                        : previewTab === 'letter'
                        ? '/untuk-nadia?preview=letter#letter-section'
                        : previewTab === 'reasons'
                        ? '/untuk-nadia?preview=reasons#reasons-section'
                        : '/untuk-nadia?preview=personal'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.68rem',
                      color: currentTheme.text,
                      opacity: 0.75,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.text}20`,
                      background: 'transparent',
                      transition: 'all 0.2s',
                    }}
                    title={isEn ? 'Open in new tab' : 'Buka di tab baru'}
                  >
                    <span>{isEn ? 'New Tab' : 'Tab Baru'}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    aria-label={isEn ? 'Close preview' : 'Tutup preview'}
                    style={{
                      background: `${currentTheme.text}10`,
                      border: `1px solid ${currentTheme.text}22`,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentTheme.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${currentTheme.text}20`;
                      e.currentTarget.style.borderColor = `${currentTheme.text}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${currentTheme.text}10`;
                      e.currentTarget.style.borderColor = `${currentTheme.text}22`;
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Iframe Viewport */}
              <div style={{ position: 'relative', flex: 1, width: '100%', background: '#0a0a0a', overflow: 'hidden' }}>
                {previewLoading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: currentTheme.bg,
                      color: currentTheme.text,
                      zIndex: 2,
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        border: `2.5px solid ${currentTheme.text}25`,
                        borderTop: `2.5px solid ${currentTheme.text}`,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', opacity: 0.65 }}>
                      {isEn ? 'Loading sample ' : 'Memuat contoh '}{previewTab === 'gallery' ? (isEn ? 'Memory Gallery' : 'Galeri Kenangan') : previewTab === 'gallery-circle' ? (isEn ? 'Circle Edition Gallery' : 'Galeri Circle Edition') : previewTab === 'circle' ? 'Circle Edition' : previewTab === 'letter' ? (isEn ? 'Main Letter' : 'Surat Utama') : previewTab === 'reasons' ? (isEn ? 'Reason Cards' : 'Kartu Alasan') : 'Personal Edition'}...
                    </span>
                  </div>
                )}

                <iframe
                  key={previewTab}
                  src={
                    previewTab === 'gallery'
                      ? '/untuk-nadia?preview=gallery#gallery-section'
                      : previewTab === 'gallery-circle'
                      ? '/auto-circle?preview=gallery#gallery-section'
                      : previewTab === 'circle'
                      ? '/auto-circle?preview=circle#circle-wishes-section'
                      : previewTab === 'letter'
                      ? '/untuk-nadia?preview=letter#letter-section'
                      : previewTab === 'reasons'
                      ? '/untuk-nadia?preview=reasons#reasons-section'
                      : '/untuk-nadia?preview=personal'
                  }
                  title={
                    previewTab === 'gallery'
                      ? (isEn ? 'Sample Memory Gallery' : 'Contoh Tampilan Galeri Kenangan')
                      : previewTab === 'gallery-circle'
                      ? (isEn ? 'Sample Circle Edition Gallery' : 'Contoh Tampilan Galeri Circle Edition')
                      : previewTab === 'circle'
                      ? (isEn ? 'Sample Circle Edition' : 'Contoh Tampilan Circle Edition')
                      : previewTab === 'letter'
                      ? (isEn ? 'Sample Main Letter' : 'Contoh Tampilan Surat Utama')
                      : previewTab === 'reasons'
                      ? (isEn ? 'Sample Reason Cards' : 'Contoh Tampilan Kartu Alasan')
                      : (isEn ? 'Sample Personal Edition' : 'Contoh Tampilan Personal Edition')
                  }
                  onLoad={() => setPreviewLoading(false)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                  allow="autoplay"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* --- ORDER REVIEW MODAL (FINAL CONFIRMATION STEP) --- */}
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { if (!submitting) setShowReviewModal(false); }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 260,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: currentTheme.bg,
                color: currentTheme.text,
                width: '100%',
                maxWidth: '480px',
                height: '88vh',
                maxHeight: '840px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px rgba(0,0,0,0.45)',
                overflow: 'hidden',
                border: `1px solid ${currentTheme.text}20`,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '0.9rem 1.15rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${currentTheme.text}12`,
                  background: currentTheme.bg,
                  flexShrink: 0,
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.01em' }}>
                    {isEn ? 'Order Summary' : 'Ringkasan Formulir'}
                  </div>
                  <div style={{ fontSize: '0.67rem', opacity: 0.6, marginTop: '1px' }}>
                    {isEn ? 'Please double check your gift details before submitting' : 'Periksa kembali data kado sebelum dikirimkan'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { if (!submitting) setShowReviewModal(false); }}
                  disabled={submitting}
                  aria-label={isEn ? 'Close summary' : 'Tutup ringkasan'}
                  style={{
                    background: `${currentTheme.text}10`,
                    border: `1px solid ${currentTheme.text}22`,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentTheme.text,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = `${currentTheme.text}20`;
                      e.currentTarget.style.borderColor = `${currentTheme.text}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = `${currentTheme.text}10`;
                      e.currentTarget.style.borderColor = `${currentTheme.text}22`;
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Bento Card Body */}
              <div
                style={{
                  padding: '1rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Card 1: Tentang Kalian */}
                <div
                  style={{
                    background: `${currentTheme.text}06`,
                    border: `1px solid ${currentTheme.text}15`,
                    borderRadius: '16px',
                    padding: '0.85rem 0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>
                      {isEn ? 'About You' : 'Tentang Kalian'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: data.isCircle ? `${currentTheme.accent || currentTheme.text}22` : `${currentTheme.text}12`,
                        color: currentTheme.text,
                        border: `1px solid ${currentTheme.text}18`,
                      }}
                    >
                      {data.isCircle ? `Circle Edition (${data.circleQuota || 8} ${isEn ? 'Friends' : 'Teman'})` : 'Personal Edition'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Recipient (To)' : 'Penerima (Untuk)'}</span>
                      <span style={{ fontWeight: 600, wordBreak: 'break-word' }}>
                        {data.recipient || '-'}
                        {data.nickname ? ` (${data.nickname})` : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Sender (From)' : 'Pengirim (Dari)'}</span>
                      <span style={{ fontWeight: 600, wordBreak: 'break-word' }}>{data.sender || '-'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', paddingTop: '6px', borderTop: `1px dashed ${currentTheme.text}12` }}>
                    <div>
                      <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Special Occasion' : 'Momen Spesial'}</span>
                      <span style={{ fontWeight: 500 }}>
                        {data.moment === 'Lainnya' ? (data.customMoment || (isEn ? 'Other' : 'Lainnya')) : (MOMENTS.find(m => m.id === data.moment)?.label || data.moment || '-')}
                      </span>
                    </div>
                    {data.recipientBirthdate && (
                      <div>
                        <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? "Recipient's Date of Birth" : 'Tgl Lahir Penerima'}</span>
                        <span style={{ fontWeight: 500 }}>{data.recipientBirthdate}</span>
                      </div>
                    )}
                    {data.milestoneNumber && (
                      <div>
                        <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Age / Milestone' : 'Usia / Ke'}</span>
                        <span style={{ fontWeight: 500 }}>{data.milestoneNumber}</span>
                      </div>
                    )}
                    {data.relationship && (
                      <div>
                        <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Relationship Status' : 'Status Hubungan'}</span>
                        <span style={{ fontWeight: 500 }}>{RELATIONSHIPS.find(r => r.id === data.relationship)?.label || data.relationship}</span>
                      </div>
                    )}
                    {data.deadline && (
                      <div>
                        <span style={{ opacity: 0.55, display: 'block', fontSize: '0.66rem' }}>{isEn ? 'Gift Deadline' : 'Deadline Gift'}</span>
                        <span style={{ fontWeight: 500 }}>{data.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Gaya & Musik */}
                <div
                  style={{
                    background: `${currentTheme.text}06`,
                    border: `1px solid ${currentTheme.text}15`,
                    borderRadius: '16px',
                    padding: '0.85rem 0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>
                    {isEn ? 'Style & Music' : 'Gaya & Musik'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: currentTheme.bg,
                          border: `2px solid ${currentTheme.accent || currentTheme.text}`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        {themes[data.theme]?.name || data.theme}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>
                      {data.language === 'Lainnya / Custom' ? (data.customLanguage || 'Custom') : (LANGUAGES.find(l => l.id === data.language)?.label || data.language)}
                    </span>
                  </div>

                  {/* Tone tags */}
                  {(() => {
                    const tones = Array.isArray(data.tone) ? data.tone : (data.tone ? [data.tone] : []);
                    if (tones.length === 0) return null;
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {tones.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.66rem',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              background: `${currentTheme.text}0d`,
                              border: `1px solid ${currentTheme.text}18`,
                              opacity: 0.85,
                            }}
                          >
                            {VIBES.find(v => v.id === t)?.label || t}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Music info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', paddingTop: '6px', borderTop: `1px dashed ${currentTheme.text}12` }}>
                    <Music size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                    <span style={{ opacity: 0.6, fontSize: '0.67rem' }}>{isEn ? 'Music:' : 'Lagu:'}</span>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {data.musicChoice === 'random'
                        ? (isEn ? 'Free / Team Choice' : 'Bebas / Rekomendasi Tim')
                        : data.music
                        ? (formatMusicInfo(data.music).full || (isEn ? 'Selected' : 'Dipilih'))
                        : (isEn ? 'Not selected yet' : 'Belum dipilih')}
                    </span>
                  </div>
                </div>

                {/* Card 3: Pesan & Konsep */}
                <div
                  style={{
                    background: `${currentTheme.text}06`,
                    border: `1px solid ${currentTheme.text}15`,
                    borderRadius: '16px',
                    padding: '0.85rem 0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>
                      {isEn ? 'Message & Concept' : 'Pesan & Konsep'}
                    </span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.65 }}>
                      {REASON_THEMES.find(t => t.id === data.reasonChoice)?.title || data.reasonChoice || (isEn ? 'Special Qualities' : 'Sifat Spesial')}
                    </span>
                  </div>

                  {data.message ? (
                    <div
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: '0.78rem',
                        lineHeight: 1.6,
                        opacity: 0.9,
                        background: `${currentTheme.text}06`,
                        padding: '0.75rem 0.9rem',
                        borderRadius: '10px',
                        borderLeft: `2.5px solid ${currentTheme.accent || currentTheme.text}`,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      &ldquo;{data.message}&rdquo;
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.74rem', opacity: 0.5, fontStyle: 'italic' }}>{isEn ? 'No message written yet' : 'Pesan belum diisi'}</span>
                  )}

                  {data.specialDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', opacity: 0.75 }}>
                      <Clock size={12} style={{ opacity: 0.6 }} />
                      <span>{isEn ? 'Count Date:' : 'Tanggal Hitungan:'} <strong>{data.specialDate}</strong> {data.specialDateOccasion ? `(${data.specialDateOccasion})` : ''}</span>
                    </div>
                  )}

                  {data.pinEnabled && data.pinCode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', opacity: 0.75, paddingTop: '4px', borderTop: `1px dashed ${currentTheme.text}12` }}>
                      <Lock size={12} style={{ opacity: 0.6 }} />
                      <span>{isEn ? 'Active PIN Gate:' : 'PIN Gate Aktif:'} <strong>••••••</strong> {data.pinHint ? `(Clue: ${data.pinHint})` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Card 4: Galeri Media & Foto */}
                <div
                  style={{
                    background: `${currentTheme.text}06`,
                    border: `1px solid ${currentTheme.text}15`,
                    borderRadius: '16px',
                    padding: '0.85rem 0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>
                      {isEn ? 'Photo & Media Gallery' : 'Galeri Foto & Media'}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {uploadedPhotos.filter(p => p.status === 'done').length} {isEn ? 'Photos Selected' : 'Foto Terpilih'}
                    </span>
                  </div>

                  {uploadedPhotos.filter(p => p.status === 'done').length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '6px',
                        marginTop: '2px',
                      }}
                    >
                      {uploadedPhotos.filter(p => p.status === 'done').map((p, i) => (
                        <div
                          key={p.id || i}
                          style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: `${currentTheme.text}15`,
                            border: `1px solid ${currentTheme.text}20`,
                          }}
                        >
                          {p.isVideo ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                              <Video size={14} color="#fff" />
                            </div>
                          ) : (
                            <img
                              src={p.localUrl || p.remoteUrl}
                              alt={isEn ? `Photo ${i + 1}` : `Foto ${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '3px',
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              color: '#fff',
                              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                            }}
                          >
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.74rem', opacity: 0.5, fontStyle: 'italic' }}>
                      {isEn ? 'No photos uploaded yet' : 'Belum ada foto yang diunggah'}
                    </span>
                  )}

                  {secretPhoto && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', paddingTop: '6px', borderTop: `1px dashed ${currentTheme.text}12` }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: `1px solid ${currentTheme.text}25` }}>
                        {secretPhoto.isVideo ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                            <Video size={14} color="#fff" />
                          </div>
                        ) : (
                          <img src={secretPhoto.localUrl || secretPhoto.remoteUrl} alt="Secret" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>{secretPhoto.isVideo ? (isEn ? 'Secret Video Included' : 'Secret Video Disertakan') : (isEn ? 'Secret Media Included' : 'Secret Media Disertakan')}</span>
                        <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>{isEn ? 'Will appear at the end of the gift' : 'Akan muncul di akhir kado'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderTop: `1px solid ${currentTheme.text}12`,
                  background: currentTheme.bg,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.6fr',
                  gap: '8px',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  disabled={submitting}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${currentTheme.text}25`,
                    color: currentTheme.text,
                    padding: '0.75rem 0.5rem',
                    borderRadius: '24px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.5 : 0.85,
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.85'; }}
                >
                  {isEn ? 'Back to Edit' : 'Kembali Edit'}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    background: currentTheme.text,
                    color: currentTheme.bg,
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '24px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          border: `2px solid ${currentTheme.bg}40`,
                          borderTop: `2px solid ${currentTheme.bg}`,
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>{isEn ? 'Submitting Order...' : 'Mengirim Formulir...'}</span>
                    </>
                  ) : (
                    <span>{isEn ? 'Confirm & Submit Order' : 'Konfirmasi & Kirim Formulir'}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
