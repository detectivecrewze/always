'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AestheticQRCode from '@/components/AestheticQRCode';
import { themes } from '@/lib/themes';

export default function StudioDashboard() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [showRename, setShowRename] = useState(false);
  const [renameData, setRenameData] = useState(null);
  const [renaming, setRenaming] = useState(false);
  
  // QR Generator State
  const [qrUrl, setQrUrl] = useState('');
  const [qrTheme, setQrTheme] = useState('vintage-burgundy');

  const router = useRouter();

  const handleDownloadQR = () => {
    const svg = document.getElementById('aesthetic-qr-svg');
    if (!svg) return;
    
    const canvas = document.createElement('canvas');
    const size = 1000; // High res for printing
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      // Draw background
      ctx.fillStyle = themes[qrTheme].bg;
      ctx.fillRect(0, 0, size, size);
      // Draw SVG over it
      ctx.drawImage(img, 0, 0, size, size);
      
      const a = document.createElement('a');
      a.download = 'loves-qr.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/gifts');
      if (res.status === 401) { router.push('/studio/login'); return; }
      const data = await res.json();
      setGifts(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchGifts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const slug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const template = {
      slug,
      recipient: newRecipient,
      sender: 'Your Name',
      gateSubtitle: 'something made just for you',
      heroPreTitle: 'a love letter in bloom',
      heroLine1: newRecipient + ',',
      heroLine2: 'My Everything',
      heroSubtitle: 'Every petal holds a whisper of how much you mean to me.',
      introIcons: true,
      introPreTitle: 'from my heart',
      introHeadline1: 'You are my',
      introHeadline2: 'wildest dream',
      introHeadline3: 'come true.',
      introText: [
        'In a world full of ordinary moments, you are the extraordinary one. The way you laugh, the way you care, the way you simply exist — it fills every corner of my world with something I never knew I needed.',
        'These flowers are not enough. No words ever could be. But they carry every unspoken feeling I hold for you, pressed between their petals like tiny love letters waiting to be found.'
      ],
      introSignOff: '– Always yours 🌹',
      reasons: [
        { icon: '✦', title: 'Your Laugh', desc: 'The sound that makes every room feel like home.' },
        { icon: '✦', title: 'Your Patience', desc: 'How you wait for me even when I take too long.' },
        { icon: '✦', title: 'Your Kindness', desc: 'The way you care without ever being asked.' },
        { icon: '✦', title: 'Your Courage', desc: 'How you face the world even on the hardest days.' },
        { icon: '✦', title: 'Your Warmth', desc: 'The feeling of being next to you on a quiet night.' },
        { icon: '✦', title: 'Your Presence', desc: 'Just being with you is more than enough.' }
      ],
      reasonsTitle1: 'The Reasons',
      reasonsTitle2: 'I Love You',
      seasons: [
        { icon: 'spring', name: 'Spring', teaser: 'where it all began', message: 'Like the first bloom after a long winter, you arrived when I least expected — and everything grew.' },
        { icon: 'summer', name: 'Summer', teaser: 'when love was loudest', message: 'In the fullness of us, I felt the sun from the inside. No distance, no doubt — just warmth.' },
        { icon: 'autumn', name: 'Autumn', teaser: 'beautiful even as things changed', message: 'Loving you through change taught me that some things don\'t need to stay the same to stay beautiful.' },
        { icon: 'winter', name: 'Winter', teaser: 'I stayed, and I\'d stay again', message: 'In the quiet and the cold, I chose you still. I will always choose you still.' }
      ],
      seasonsTitle1: 'A Love For',
      seasonsTitle2: 'Every Season',
      seasonsHint: 'tap each season to discover its meaning',
      photos: [
        { url: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=600&auto=format&fit=crop', caption: 'you' },
        { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', caption: 'are' },
        { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop', caption: 'loved' },
        { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop', caption: '♡' }
      ],
      galleryTitle1: 'Our Beautiful',
      galleryTitle2: 'Memories',
      music: { title: 'Kita Punya Waktu', artist: 'Banda Neira', file: '/music/track.mp3', cover: '/photos/cover.jpg' },
      theme: 'vintage-burgundy',
      closingLine: 'always yours,',
      closingPreTitle: 'always & forever',
      closingTitle1: 'You Are Loved',
      closingTitle2: 'Beyond Words',
      closingParagraph: 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.',
      celebrateBtnText: 'celebrate ✨',
      secretPhoto: '/photos/1.jpg',
      secretCaption: 'this is just for you — my favourite memory of us.',
      createdAt: new Date().toISOString().split('T')[0],
    };
    await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    setCreating(false);
    setShowNew(false);
    setNewSlug('');
    setNewRecipient('');
    router.push(`/studio/${slug}/edit`);
  };

  const openRenameModal = (g) => {
    setRenameData({ oldSlug: g.slug, newSlug: g.slug, newRecipient: g.recipient || '' });
    setShowRename(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    setRenaming(true);
    const finalSlug = renameData.newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    try {
      const resGet = await fetch(`/api/gifts/${renameData.oldSlug}`);
      if (resGet.ok) {
        const giftData = await resGet.json();
        giftData.slug = finalSlug;
        giftData.recipient = renameData.newRecipient;

        await fetch(`/api/gifts/${renameData.oldSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(giftData),
        });
      }
    } catch { /* ignore */ }

    setRenaming(false);
    setShowRename(false);
    await fetchGifts();
  };

  const handleDelete = async (slug) => {
    if (!confirm(`Delete gift "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    await fetch(`/api/gifts/${slug}`, { method: 'DELETE' });
    await fetchGifts();
    setDeleting(null);
  };

  const handleExport = (slug) => {
    window.open(`/api/export/${slug}`, '_blank');
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/studio/login');
  };

  const S = {
    page: { minHeight: '100vh', background: '#050505', fontFamily: 'Inter, system-ui, sans-serif', color: '#f5f5f5' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid #1a1a1a' },
    brand: { fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 400 },
    dot: { color: '#E11D48' },
    logoutBtn: { background: 'none', border: '1px solid #262626', borderRadius: '6px', color: '#888', fontSize: '0.75rem', padding: '0.4rem 1rem', cursor: 'pointer' },
    main: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' },
    title: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#666' },
    newBtn: { background: 'linear-gradient(135deg, #E11D48, #9D174D)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 500, padding: '0.6rem 1.2rem', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    card: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '1.5rem', transition: 'border-color 0.2s' },
    cardSlug: { fontSize: '0.65rem', color: '#555', fontFamily: 'monospace', marginBottom: '0.25rem' },
    cardName: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' },
    cardDate: { fontSize: '0.7rem', color: '#555', marginBottom: '1rem' },
    actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    actionBtn: (color) => ({
      background: 'none', border: `1px solid ${color}30`, borderRadius: '6px', color, fontSize: '0.7rem',
      padding: '0.35rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s',
    }),
    empty: { textAlign: 'center', padding: '4rem 2rem', color: '#444' },
    modal: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' },
    modalCard: { background: '#141414', border: '1px solid #262626', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', margin: '1rem' },
    label: { display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '0.4rem' },
    input: { width: '100%', padding: '0.65rem 0.75rem', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', color: '#f5f5f5', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' },
    skeleton: { background: '#1a1a1a', borderRadius: '8px', height: '140px', animation: 'pulse 1.5s infinite' },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <span style={S.brand}>loves<span style={S.dot}>·</span>studio</span>
        <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
      </header>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topBar}>
          <span style={S.title}>Your Gift Pages</span>
          <button onClick={() => setShowNew(true)} style={S.newBtn}>+ New Gift</button>
        </div>

        {loading ? (
          <div style={S.grid}>
            {[1,2,3].map(i => <div key={i} style={S.skeleton} />)}
          </div>
        ) : gifts.length === 0 ? (
          <div style={S.empty}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No gifts yet</p>
            <p style={{ fontSize: '0.8rem' }}>Create your first love letter to get started.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {gifts.map((g) => (
              <div key={g.slug} style={S.card} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#333'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}>
                <div style={S.cardSlug}>/{g.slug}</div>
                <div style={S.cardName}>{g.recipient || g.slug}</div>
                <div style={S.cardDate}>{g.createdAt || 'Unknown date'}</div>
                <div style={S.actions}>
                  <button style={S.actionBtn('#E11D48')} onClick={() => router.push(`/studio/${g.slug}/edit`)}>Edit</button>
                  <button style={S.actionBtn('#8B5CF6')} onClick={() => window.open(`/${g.slug}`, '_blank')}>Preview</button>
                  <button style={S.actionBtn('#22C55E')} onClick={() => handleExport(g.slug)}>Export</button>
                  <button style={S.actionBtn('#3B82F6')} onClick={() => openRenameModal(g)}>Settings</button>
                  <button style={S.actionBtn('#EF4444')} onClick={() => handleDelete(g.slug)} disabled={deleting === g.slug}>
                    {deleting === g.slug ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code Generator Section */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ ...S.topBar, marginBottom: '1.5rem' }}>
            <span style={S.title}>Aesthetic QR Generator</span>
          </div>
          
          <div style={{ ...S.card, display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={S.label}>Website URL</label>
              <input 
                style={S.input} 
                value={qrUrl} 
                onChange={(e) => setQrUrl(e.target.value)} 
                placeholder="https://yourwebsite.com/untuk-nadia" 
              />
              
              <label style={S.label}>Theme Colors</label>
              <select 
                style={{ ...S.input, appearance: 'auto' }}
                value={qrTheme}
                onChange={(e) => setQrTheme(e.target.value)}
              >
                {Object.entries(themes).map(([key, t]) => (
                  <option key={key} value={key}>{t.name}</option>
                ))}
              </select>

              <button 
                onClick={handleDownloadQR} 
                disabled={!qrUrl}
                style={{ 
                  ...S.newBtn, 
                  width: '100%', 
                  marginTop: '1rem',
                  opacity: qrUrl ? 1 : 0.5 
                }}
              >
                Download as PNG
              </button>
              <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
                Use this to print the aesthetic barcode on physical cards or share on social media.
              </p>
            </div>
            
            <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '12px', padding: '2rem', border: '1px solid #1a1a1a' }}>
              <AestheticQRCode url={qrUrl} themeConfig={themes[qrTheme]} size={240} />
            </div>
          </div>
        </div>
      </main>

      {/* New Gift Modal */}
      {showNew && (
        <div style={S.modal} onClick={() => setShowNew(false)}>
          <form style={S.modalCard} onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Create New Gift</h2>
            <label style={S.label}>Recipient Name</label>
            <input style={S.input} value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} placeholder="e.g. Nadia" required />
            <label style={S.label}>URL Slug</label>
            <input style={S.input} value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="e.g. untuk-nadia" required />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowNew(false)} style={{ ...S.logoutBtn, flex: 1 }}>Cancel</button>
              <button type="submit" disabled={creating} style={{ ...S.newBtn, flex: 1, opacity: creating ? 0.6 : 1 }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Gift Modal */}
      {showRename && renameData && (
        <div style={S.modal} onClick={() => setShowRename(false)}>
          <form style={S.modalCard} onClick={(e) => e.stopPropagation()} onSubmit={handleRename}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gift Settings</h2>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>Update the recipient name or the URL link for this gift.</p>
            
            <label style={S.label}>Recipient Name</label>
            <input 
              style={S.input} 
              value={renameData.newRecipient} 
              onChange={(e) => setRenameData({...renameData, newRecipient: e.target.value})} 
              placeholder="e.g. Nadia" 
              required 
            />
            
            <label style={S.label}>URL Slug (Domain Link)</label>
            <input 
              style={S.input} 
              value={renameData.newSlug} 
              onChange={(e) => setRenameData({...renameData, newSlug: e.target.value})} 
              placeholder="e.g. untuk-nadia" 
              required 
            />
            <p style={{ fontSize: '0.7rem', color: '#F59E0B', marginBottom: '1rem', marginTop: '-0.5rem' }}>
              ⚠️ Changing this will change the live link. If using a custom Vercel domain, you must update it in Vercel too.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowRename(false)} style={{ ...S.logoutBtn, flex: 1 }}>Cancel</button>
              <button type="submit" disabled={renaming} style={{ ...S.newBtn, flex: 1, opacity: renaming ? 0.6 : 1, background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                {renaming ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
