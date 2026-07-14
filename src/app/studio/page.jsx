'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import playlist from './playlist.json';
import AestheticQRCode from '@/components/AestheticQRCode';
import { themes } from '@/lib/themes';

const HISTORY_PAGE_SIZE = 20;
const DRAFT_STALE_DAYS = 7;

export default function StudioDashboard() {
  const [gifts, setGifts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdSlug, setCreatedSlug] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRename, setShowRename] = useState(false);
  const [renameData, setRenameData] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  // Order editing state
  const [editingOrder, setEditingOrder] = useState(null); // { orderId, photos: [...], message: '', secretPhoto: '' }
  const [savingOrder, setSavingOrder] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const newPhotoInputRef = useRef(null);

  // Tab & Search state
  const [activeTab, setActiveTab] = useState('gifts');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination for history
  const [historyPage, setHistoryPage] = useState(1);

  // QR Generator State
  const [qrUrl, setQrUrl] = useState('');
  const [qrTheme, setQrTheme] = useState('vintage-burgundy');

  const router = useRouter();

  // ── Derived data ────────────────────────────────────────────────
  const pendingOrders = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending');
    // Sort by deadline soonest first; orders without deadline go to end
    return pending.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    });
  }, [orders]);

  const doneOrders = useMemo(() => orders.filter(o => o.status === 'done'), [orders]);
  const liveDrafts = useMemo(() => drafts.filter(d => !orders.some(o => o.slug === d.slug)), [drafts, orders]);

  const staleDraftCount = useMemo(() => {
    const cutoff = Date.now() - DRAFT_STALE_DAYS * 24 * 60 * 60 * 1000;
    return liveDrafts.filter(d => new Date(d.updatedAt).getTime() < cutoff).length;
  }, [liveDrafts]);

  // ── Search filtering ─────────────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();
  const filteredGifts = useMemo(() =>
    q ? gifts.filter(g => (g.slug + g.recipient).toLowerCase().includes(q)) : gifts
  , [gifts, q]);
  const filteredPending = useMemo(() =>
    q ? pendingOrders.filter(o => (o.sender + o.recipient + o.slug + o.orderId).toLowerCase().includes(q)) : pendingOrders
  , [pendingOrders, q]);
  const filteredDrafts = useMemo(() =>
    q ? liveDrafts.filter(d => (d.sender + d.recipient + d.slug).toLowerCase().includes(q)) : liveDrafts
  , [liveDrafts, q]);
  const filteredDone = useMemo(() =>
    q ? doneOrders.filter(o => (o.sender + o.recipient + o.slug + o.orderId).toLowerCase().includes(q)) : doneOrders
  , [doneOrders, q]);

  // History pagination
  const paginatedHistory = useMemo(() => filteredDone.slice(0, historyPage * HISTORY_PAGE_SIZE), [filteredDone, historyPage]);

  // Warna tab statistics
  const themeData = useMemo(() => {
    const aggregated = {};
    gifts.forEach(g => {
      const t = g.theme || 'unknown';
      if (!aggregated[t]) aggregated[t] = [];
      aggregated[t].push(g);
    });
    return Object.entries(aggregated)
      .map(([theme, list]) => ({ theme, list, count: list.length }))
      .sort((a, b) => b.count - a.count);
  }, [gifts]);

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchGifts = async () => {
    try {
      const resGifts = await fetch('/api/gifts');
      if (resGifts.status === 401) { router.push('/studio/login'); return; }
      setGifts(await resGifts.json());

      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      const resDrafts = await fetch('/api/drafts');
      if (resDrafts.ok) setDrafts(await resDrafts.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchGifts(); }, []);

  // Auto-switch to incoming tab if there are pending orders
  useEffect(() => {
    if (!loading && pendingOrders.length > 0 && activeTab === 'gifts') {
      // Don't auto-switch, just badge it
    }
  }, [loading, pendingOrders.length, activeTab]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleDownloadQR = () => {
    const svg = document.getElementById('aesthetic-qr-svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const size = 1000;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = themes[qrTheme].bg;
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = 'loves-qr.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const slug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const template = {
      slug, recipient: newRecipient, sender: 'Your Name',
      gateSubtitle: 'something made just for you',
      heroPreTitle: 'a love letter in bloom',
      heroLine1: newRecipient + ',', heroLine2: 'My Everything',
      heroSubtitle: 'Every petal holds a whisper of how much you mean to me.',
      introIcons: true, introPreTitle: 'from my heart',
      introHeadline1: 'You are my', introHeadline2: 'wildest dream', introHeadline3: 'come true.',
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
      reasonsTitle1: 'The Reasons', reasonsTitle2: 'I Love You',
      seasons: [
        { icon: 'spring', name: 'Spring', teaser: 'where it all began', message: 'Like the first bloom after a long winter, you arrived when I least expected — and everything grew.' },
        { icon: 'summer', name: 'Summer', teaser: 'when love was loudest', message: 'In the fullness of us, I felt the sun from the inside. No distance, no doubt — just warmth.' },
        { icon: 'autumn', name: 'Autumn', teaser: 'beautiful even as things changed', message: "Loving you through change taught me that some things don't need to stay the same to stay beautiful." },
        { icon: 'winter', name: 'Winter', teaser: "I stayed, and I'd stay again", message: 'In the quiet and the cold, I chose you still. I will always choose you still.' }
      ],
      seasonsTitle1: 'A Love For', seasonsTitle2: 'Every Season',
      seasonsHint: 'tap each season to discover its meaning',
      photos: [
        { url: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=600&auto=format&fit=crop', caption: 'you' },
        { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', caption: 'are' },
        { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop', caption: 'loved' },
        { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop', caption: '♡' }
      ],
      galleryTitle1: 'Our Beautiful', galleryTitle2: 'Memories',
      music: { title: 'Kita Punya Waktu', artist: 'Banda Neira', file: '/music/track.mp3', cover: '/photos/cover.jpg' },
      theme: 'vintage-burgundy',
      closingLine: 'always yours,', closingPreTitle: 'always & forever',
      closingTitle1: 'You Are Loved', closingTitle2: 'Beyond Words',
      closingParagraph: 'No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything.',
      celebrateBtnText: 'celebrate ✨',
      secretPhoto: '/photos/1.jpg',
      secretCaption: 'this is just for you — my favourite memory of us.',
      createdAt: new Date().toISOString().split('T')[0],
    };
    await fetch('/api/gifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(template) });
    setCreating(false); setShowNew(false); setNewRecipient('');
    setCreatedSlug(slug);
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
        await fetch(`/api/gifts/${renameData.oldSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(giftData) });
      }
    } catch { /* ignore */ }
    setRenaming(false); setShowRename(false);
    await fetchGifts();
  };

  const handleDelete = async (slug) => {
    if (!confirm(`Delete gift "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    await fetch(`/api/gifts/${slug}`, { method: 'DELETE' });
    await fetchGifts();
    setDeleting(null);
  };

  const handleApplyOrder = async (order) => {
    if (!confirm(`Terapkan data pesanan ini ke kado /${order.slug}? Data lama akan ditimpa.`)) return;
    setProcessingOrder(order.orderId);
    try {
      const res = await fetch(`/api/gifts/${order.slug}`);
      if (!res.ok) {
        alert(`Kado dengan link /${order.slug} belum dibuat. Harap buat kado barunya dulu di atas!`);
        setProcessingOrder(null); return;
      }
      const existingGift = await res.json();
      let newMusic = existingGift.music;
      if (order.musicChoice === 'request' && order.music) {
        newMusic = { title: order.music, artist: 'Custom (Request)', file: '', cover: '' };
      } else if (order.musicChoice === 'playlist' && order.music) {
        const foundSong = playlist.find(s => `${s.title} - ${s.artist}` === order.music);
        if (foundSong) newMusic = { title: foundSong.title, artist: foundSong.artist, file: foundSong.audioUrl, cover: foundSong.coverUrl };
      }
      const updatedGift = {
        ...existingGift, theme: order.theme, music: newMusic,
        photos: order.photos && order.photos.length > 0 ? order.photos.map(p => ({ url: p, caption: '' })) : existingGift.photos,
        secretPhoto: order.secretPhoto || existingGift.secretPhoto,
        introText: order.message ? [order.message] : existingGift.introText,
        ...(order.specialDate && { 
          timeEnabled: true, 
          timeStartDate: order.specialDate,
          ...(order.specialDateOccasion && { timeTitle: order.specialDateOccasion })
        }),
      };
      await fetch(`/api/gifts/${order.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedGift) });
      await fetch(`/api/orders/${order.orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
      await fetchGifts();
      router.push(`/studio/${order.slug}/edit`);
    } catch { alert('Failed to process order'); }
    setProcessingOrder(null);
  };

  const copyFormLink = (slug) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    alert(`Link form tersalin: ${url}`);
  };

  const handleExport = (slug) => window.open(`/api/export/${slug}`, '_blank');

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Hapus pesanan ini secara permanen? Data tidak dapat dikembalikan.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) fetchGifts();
      else alert('Gagal menghapus pesanan.');
    } catch { alert('Terjadi kesalahan jaringan saat menghapus pesanan.'); }
  };

  const handleDeleteDraft = async (slug) => {
    if (!confirm('Hapus live draft ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/drafts/${slug}`, { method: 'DELETE' });
      if (res.ok) fetchGifts();
      else alert('Gagal menghapus draft.');
    } catch { alert('Terjadi kesalahan jaringan saat menghapus draft.'); }
  };

  const handleCleanupStaleDrafts = async () => {
    if (!confirm(`Hapus ${staleDraftCount} draft yang tidak aktif lebih dari ${DRAFT_STALE_DAYS} hari? Tindakan ini tidak dapat dibatalkan.`)) return;
    setCleaningUp(true);
    const cutoff = Date.now() - DRAFT_STALE_DAYS * 24 * 60 * 60 * 1000;
    const staleDrafts = liveDrafts.filter(d => new Date(d.updatedAt).getTime() < cutoff);
    for (const d of staleDrafts) {
      await fetch(`/api/drafts/${d.slug}`, { method: 'DELETE' }).catch(() => {});
    }
    await fetchGifts();
    setCleaningUp(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/studio/login');
  };

  // ── Order Edit Handlers ───────────────────────────────────────────
  const startEditOrder = (order) => {
    setEditingOrder({
      orderId: order.orderId,
      photos: order.photos ? [...order.photos] : [],
      message: order.message || '',
      secretPhoto: order.secretPhoto || '',
    });
  };

  const handleAddPhoto = () => {
    // Read from ref as fallback in case React state is stale
    const url = (newPhotoInputRef.current?.value || newPhotoUrl || '').trim();
    if (!url) {
      alert('Paste URL foto/video dulu sebelum klik Tambah');
      return;
    }
    setEditingOrder(prev => ({ ...prev, photos: [...prev.photos, url] }));
    setNewPhotoUrl('');
    if (newPhotoInputRef.current) newPhotoInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    setEditingOrder(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    setSavingOrder(true);
    try {
      // Fetch the full order first
      const res = await fetch(`/api/orders/${editingOrder.orderId}`);
      if (!res.ok) throw new Error('Cannot fetch order');
      const existing = await res.json();
      const updated = {
        ...existing,
        photos: editingOrder.photos,
        message: editingOrder.message,
        secretPhoto: editingOrder.secretPhoto,
      };
      const putRes = await fetch(`/api/orders/${editingOrder.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!putRes.ok) throw new Error('Failed to save');
      // Refresh data and update selectedOrder
      await fetchGifts();
      setSelectedOrder(updated);
      setEditingOrder(null);
      alert('✅ Pesanan berhasil diupdate!');
    } catch (err) {
      alert('❌ Gagal menyimpan: ' + err.message);
    }
    setSavingOrder(false);
  };

  // ── Styles ────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: '100vh', background: '#050505', fontFamily: 'Inter, system-ui, sans-serif', color: '#f5f5f5' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: '#050505', zIndex: 50 },
    brand: { fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 400 },
    dot: { color: '#E11D48' },
    logoutBtn: { background: 'none', border: '1px solid #262626', borderRadius: '6px', color: '#888', fontSize: '0.75rem', padding: '0.4rem 1rem', cursor: 'pointer' },
    main: { padding: '1.5rem 2rem', maxWidth: '1000px', margin: '0 auto' },
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
    title: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#666' },
    newBtn: { background: 'linear-gradient(135deg, #E11D48, #9D174D)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 500, padding: '0.6rem 1.2rem', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    card: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '1.5rem', transition: 'border-color 0.2s' },
    cardSlug: { fontSize: '0.65rem', color: '#555', fontFamily: 'monospace', marginBottom: '0.25rem' },
    cardName: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' },
    cardDate: { fontSize: '0.7rem', color: '#555', marginBottom: '1rem' },
    actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    actionBtn: (color) => ({ background: 'none', border: `1px solid ${color}30`, borderRadius: '6px', color, fontSize: '0.7rem', padding: '0.35rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }),
    empty: { textAlign: 'center', padding: '4rem 2rem', color: '#444' },
    modal: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' },
    modalCard: { background: '#141414', border: '1px solid #262626', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', margin: '1rem' },
    label: { display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '0.4rem' },
    input: { width: '100%', padding: '0.65rem 0.75rem', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', color: '#f5f5f5', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' },
    skeleton: { background: '#1a1a1a', borderRadius: '8px', height: '140px', animation: 'pulse 1.5s infinite' },
  };

  // ── Tab config ────────────────────────────────────────────────────
  const tabs = [
    { id: 'gifts', label: 'Kado', badge: gifts.length, badgeColor: '#E11D48' },
    { id: 'orders', label: 'Pesanan Masuk', badge: pendingOrders.length, badgeColor: '#3B82F6' },
    { id: 'drafts', label: 'Live Drafts', badge: liveDrafts.length, badgeColor: '#EAB308' },
    { id: 'history', label: 'Riwayat', badge: doneOrders.length, badgeColor: '#888' },
    { id: 'colors', label: 'Warna', badge: null, badgeColor: null },
    { id: 'qr', label: 'QR Generator', badge: null, badgeColor: null },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <span style={S.brand}>loves<span style={S.dot}>·</span>studio</span>
        <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
      </header>

      {/* Main */}
      <main style={S.main}>

        {/* Tab Bar + Search + New Gift */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '0.25rem', background: '#0a0a0a', padding: '4px', borderRadius: '10px', border: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setHistoryPage(1); }}
                  style={{
                    padding: '0.4rem 0.85rem', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                    background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                    color: activeTab === tab.id ? '#f5f5f5' : '#666',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {tab.label}
                  {tab.badge !== null && tab.badge > 0 && (
                    <span style={{
                      background: activeTab === tab.id ? tab.badgeColor : tab.badgeColor + '60',
                      color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* New Gift button — only on gifts tab */}
            {activeTab === 'gifts' && (
              <button onClick={() => {
                setNewSlug('');
                setNewRecipient('');
                setShowNew(true);
              }} style={S.newBtn}>+ New Gift</button>
            )}
          </div>

          {/* Search Bar — only when not on QR tab */}
          {activeTab !== 'qr' && (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama, link, atau ID pesanan..."
                style={{ ...S.input, paddingLeft: '2.25rem', marginBottom: 0, fontSize: '0.8rem', background: '#0a0a0a' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
              )}
            </div>
          )}
        </div>

        {/* ── TAB: GIFTS ─────────────────────────────────────────── */}
        {activeTab === 'gifts' && (
          loading ? (
            <div style={S.grid}>{[1,2,3].map(i => <div key={i} style={S.skeleton} />)}</div>
          ) : filteredGifts.length === 0 ? (
            <div style={S.empty}>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q ? 'Tidak ada kado yang cocok.' : 'No gifts yet'}</p>
              <p style={{ fontSize: '0.8rem' }}>{q ? 'Coba kata kunci lain.' : 'Create your first love letter to get started.'}</p>
            </div>
          ) : (
            <div style={S.grid}>
              {filteredGifts.map((g) => (
                <div key={g.slug} style={S.card} onMouseEnter={e => e.currentTarget.style.borderColor = '#333'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                  <div style={S.cardSlug}>/{g.slug}</div>
                  <div style={S.cardName}>{g.recipient || g.slug}</div>
                  <div style={S.cardDate}>{g.createdAt || 'Unknown date'}</div>
                  <div style={S.actions}>
                    <button style={S.actionBtn('#E11D48')} onClick={() => router.push(`/studio/${g.slug}/edit`)}>Edit</button>
                    <button style={S.actionBtn('#8B5CF6')} onClick={() => window.open(`/${g.slug}`, '_blank')}>Preview</button>
                    <button style={S.actionBtn('#22C55E')} onClick={() => handleExport(g.slug)}>Export</button>
                    <button style={S.actionBtn('#10B981')} onClick={() => copyFormLink(g.slug)}>Copy Form Link</button>
                    <button style={S.actionBtn('#3B82F6')} onClick={() => openRenameModal(g)}>Settings</button>
                    <button style={S.actionBtn('#EF4444')} onClick={() => handleDelete(g.slug)} disabled={deleting === g.slug}>
                      {deleting === g.slug ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── TAB: INCOMING ORDERS ──────────────────────────────── */}
        {activeTab === 'orders' && (
          loading ? (
            <div style={S.grid}>{[1,2,3].map(i => <div key={i} style={S.skeleton} />)}</div>
          ) : filteredPending.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q ? 'Tidak ada pesanan yang cocok.' : 'Belum ada pesanan masuk.'}</p>
              <p style={{ fontSize: '0.8rem' }}>Bagikan link form ke pelanggan Anda untuk mulai menerima pesanan.</p>
            </div>
          ) : (
            <div style={{ ...S.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {filteredPending.map((o) => {
                const submittedAt = o.createdAt ? new Date(o.createdAt) : null;
                const isValidDate = submittedAt && !isNaN(submittedAt.getTime());
                const dateStr = isValidDate
                  ? submittedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : (o.createdAt || '—');
                const timeStr = isValidDate
                  ? submittedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : null;

                // Compute how long ago
                const diffMs = isValidDate ? Date.now() - submittedAt.getTime() : null;
                const diffMins = diffMs ? Math.floor(diffMs / 60000) : null;
                const agoStr = diffMins !== null
                  ? diffMins < 60
                    ? `${diffMins} mnt lalu`
                    : diffMins < 1440
                      ? `${Math.floor(diffMins / 60)} jam lalu`
                      : `${Math.floor(diffMins / 1440)} hari lalu`
                  : null;

                // ── Deadline logic ────────────────────────────────────────
                const deadlineRaw = o.deadline; // ISO string or null
                const deadlineDate = deadlineRaw ? new Date(deadlineRaw) : null;
                const deadlineValid = deadlineDate && !isNaN(deadlineDate.getTime());
                const msUntilDeadline = deadlineValid ? deadlineDate.getTime() - Date.now() : null;
                const hoursUntil = msUntilDeadline !== null ? msUntilDeadline / 3600000 : null;
                const deadlinePassed = hoursUntil !== null && hoursUntil < 0;
                const deadlineColor = deadlinePassed
                  ? '#EF4444'
                  : hoursUntil !== null && hoursUntil < 24
                    ? '#F59E0B'
                    : '#22C55E';
                const deadlineLabel = deadlineValid
                  ? deadlineDate.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
                  : null;
                const deadlineCountdown = hoursUntil !== null
                  ? deadlinePassed
                    ? `lewat ${Math.abs(Math.round(hoursUntil))} jam`
                    : hoursUntil < 24
                      ? `${Math.floor(hoursUntil)}j ${Math.floor((hoursUntil % 1) * 60)}m lagi`
                      : `${Math.floor(hoursUntil / 24)}h ${Math.floor(hoursUntil % 24)}j lagi`
                  : null;

                return (
                  <div key={o.orderId} style={{ ...S.card, border: `1px solid ${deadlineValid ? deadlineColor + '40' : '#3B82F640'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ ...S.cardSlug, color: '#3B82F6' }}>{o.orderId}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{dateStr}</div>
                        {timeStr && (
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f5', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            🕐 {timeStr}
                          </div>
                        )}
                        {agoStr && (
                          <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '1px' }}>{agoStr}</div>
                        )}
                      </div>
                    </div>

                    {/* ── Deadline badge ── */}
                    {deadlineLabel && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: deadlineColor + '18',
                        border: `1px solid ${deadlineColor}55`,
                        borderRadius: '6px',
                        padding: '0.25rem 0.6rem',
                        marginBottom: '0.75rem',
                        fontSize: '0.72rem',
                        color: deadlineColor,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                      }}>
                        <span>{deadlinePassed ? '🔴' : hoursUntil < 24 ? '🟡' : '🟢'}</span>
                        <span>Deadline: {deadlineLabel}</span>
                        {deadlineCountdown && (
                          <span style={{ opacity: 0.75, fontWeight: 400 }}>· {deadlineCountdown}</span>
                        )}
                      </div>
                    )}

                    <div style={S.cardName}>From: {o.sender}</div>
                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.2rem' }}>To: {o.recipient} (/{o.slug})</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Theme: {o.theme} | Moment: {o.moment}</div>
                    <div style={S.actions}>
                      <button style={S.actionBtn('#8B5CF6')} onClick={() => setSelectedOrder(o)}>View Details</button>
                      <button style={{ ...S.actionBtn('#22C55E'), background: '#22C55E20' }} onClick={() => handleApplyOrder(o)} disabled={processingOrder === o.orderId}>
                        {processingOrder === o.orderId ? 'Processing...' : 'Apply to Gift'}
                      </button>
                      <button style={S.actionBtn('#EF4444')} onClick={async () => {
                        if (confirm('Mark as done?')) {
                          await fetch(`/api/orders/${o.orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
                          fetchGifts();
                        }
                      }}>Mark Done</button>
                      <button style={{ ...S.actionBtn('#EF4444'), background: 'transparent', padding: '0.4rem', flex: '0 0 auto' }} onClick={() => handleDeleteOrder(o.orderId)} title="Hapus Pesanan">🗑️</button>
                    </div>
                  </div>
                );
              })}

            </div>
          )
        )}

        {/* ── TAB: LIVE DRAFTS ──────────────────────────────────── */}
        {activeTab === 'drafts' && (
          <>
            {/* Stale cleanup toolbar */}
            {staleDraftCount > 0 && (
              <div style={{ background: '#EAB30815', border: '1px solid #EAB30830', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8rem', color: '#EAB308', margin: 0 }}>
                  ⚠️ Ada <strong>{staleDraftCount} draft</strong> yang tidak aktif lebih dari {DRAFT_STALE_DAYS} hari (kemungkinan ditinggalkan).
                </p>
                <button
                  onClick={handleCleanupStaleDrafts}
                  disabled={cleaningUp}
                  style={{ background: '#EAB30820', border: '1px solid #EAB30860', borderRadius: '6px', color: '#EAB308', fontSize: '0.75rem', fontWeight: 500, padding: '0.4rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {cleaningUp ? 'Membersihkan...' : `🧹 Bersihkan ${staleDraftCount} Draft Usang`}
                </button>
              </div>
            )}

            {loading ? (
              <div style={S.grid}>{[1,2,3].map(i => <div key={i} style={S.skeleton} />)}</div>
            ) : filteredDrafts.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q ? 'Tidak ada draft yang cocok.' : 'Tidak ada draft aktif saat ini.'}</p>
                <p style={{ fontSize: '0.8rem' }}>Draft akan muncul di sini saat pelanggan mulai mengisi form.</p>
              </div>
            ) : (
              <div style={{ ...S.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {filteredDrafts.map((d) => {
                  const updatedTime = new Date(d.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                  const isStale = Date.now() - new Date(d.updatedAt).getTime() > DRAFT_STALE_DAYS * 24 * 60 * 60 * 1000;
                  return (
                    <div key={d.slug} style={{ ...S.card, border: `1px solid ${isStale ? '#44444430' : '#EAB30840'}`, opacity: isStale ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ ...S.cardSlug, color: isStale ? '#555' : '#EAB308' }}>{isStale ? 'Draft Lama' : 'Live Draft'}</div>
                        <div style={S.cardDate}>Edit: {updatedTime}</div>
                      </div>
                      <div style={S.cardName}>From: {d.sender || '...'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.2rem' }}>To: {d.recipient || '...'} (/{d.slug})</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Theme: {d.theme}</div>
                      <div style={S.actions}>
                        <button style={S.actionBtn('#8B5CF6')} onClick={() => setSelectedOrder({ ...d, isDraft: true })}>View Progress</button>
                        <button style={{ ...S.actionBtn('#EF4444'), padding: '0.4rem', flex: '0 0 auto', border: '1px solid #EF444440' }} onClick={() => handleDeleteDraft(d.slug)} title="Hapus Draft">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB: ORDER HISTORY ────────────────────────────────── */}
        {activeTab === 'history' && (
          loading ? (
            <div style={S.grid}>{[1,2,3].map(i => <div key={i} style={S.skeleton} />)}</div>
          ) : filteredDone.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📜</div>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q ? 'Tidak ada riwayat yang cocok.' : 'Belum ada riwayat pesanan selesai.'}</p>
              <p style={{ fontSize: '0.8rem' }}>Pesanan yang sudah di-apply atau di-mark done akan muncul di sini.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '1rem' }}>
                Menampilkan {paginatedHistory.length} dari {filteredDone.length} riwayat
              </p>
              <div style={{ ...S.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {paginatedHistory.map((o) => (
                  <div key={o.orderId} style={{ ...S.card, border: '1px solid #1a1a1a', opacity: 0.75 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ ...S.cardSlug, color: '#888' }}>{o.orderId}</div>
                      <div style={S.cardDate}>{o.createdAt}</div>
                    </div>
                    <div style={S.cardName}>From: {o.sender}</div>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>To: {o.recipient} (/{o.slug})</div>
                    <div style={{ ...S.actions, marginTop: '0.5rem' }}>
                      <button style={S.actionBtn('#8B5CF6')} onClick={() => setSelectedOrder(o)}>View Details</button>
                      <button style={{ ...S.actionBtn('#EF4444'), padding: '0.4rem', flex: '0 0 auto', border: '1px solid #EF444440' }} onClick={() => handleDeleteOrder(o.orderId)} title="Hapus Riwayat">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedHistory.length < filteredDone.length && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button onClick={() => setHistoryPage(p => p + 1)} style={{ background: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px', color: '#aaa', fontSize: '0.8rem', padding: '0.6rem 1.5rem', cursor: 'pointer' }}>
                    Muat Lebih Banyak ({filteredDone.length - paginatedHistory.length} lagi)
                  </button>
                </div>
              )}
            </>
          )
        )}

        {/* ── TAB: QR GENERATOR ─────────────────────────────────── */}
        {activeTab === 'qr' && (
          <div style={{ ...S.card, display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={S.label}>Website URL</label>
              <input style={S.input} value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://yourwebsite.com/untuk-nadia" />
              <label style={S.label}>Theme Colors</label>
              <select style={{ ...S.input, appearance: 'auto' }} value={qrTheme} onChange={(e) => setQrTheme(e.target.value)}>
                {Object.entries(themes).map(([key, t]) => (<option key={key} value={key}>{t.name}</option>))}
              </select>
              <button onClick={handleDownloadQR} disabled={!qrUrl} style={{ ...S.newBtn, width: '100%', marginTop: '1rem', opacity: qrUrl ? 1 : 0.5 }}>Download as PNG</button>
              <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
                Use this to print the aesthetic barcode on physical cards or share on social media.
              </p>
            </div>
            <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '12px', padding: '2rem', border: '1px solid #1a1a1a' }}>
              <AestheticQRCode url={qrUrl} themeConfig={themes[qrTheme]} size={240} />
            </div>
          </div>
        )}

        {/* ── TAB: WARNA (STATISTIK TEMA) ───────────────────────── */}
        {activeTab === 'colors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Statistik Warna / Tema</h2>
            {themeData.map(({ theme, list, count }) => (
              <div key={theme} style={{ ...S.card, padding: '1.25rem', background: '#111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#f5f5f5', textTransform: 'capitalize' }}>
                    {theme.replace(/-/g, ' ')}
                  </h3>
                  <span style={{ background: '#333', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                    {count} Kado
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {list.map(g => (
                    <a key={g.slug || g.id} href={`/${g.slug || g.id}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#1a1a1a', padding: '0.75rem', borderRadius: '8px',
                      textDecoration: 'none', color: '#ccc', fontSize: '0.85rem', transition: 'background 0.2s', border: '1px solid #333'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#262626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                      <span style={{ background: '#3B82F6', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.75rem' }}>🔗</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.recipient || g.slug || g.id}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── View Order / Draft Modal ─────────────────────────────── */}
      {selectedOrder && (
        <div style={S.modal} onClick={() => { setSelectedOrder(null); setEditingOrder(null); setNewPhotoUrl(''); }}>
          <div style={{ ...S.modalCard, maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                {selectedOrder.isDraft ? 'Live Draft Details' : 'Order Details'}
              </h2>
              {/* Edit toggle — only for real orders (not drafts) */}
              {!selectedOrder.isDraft && (
                <button
                  onClick={() => editingOrder ? setEditingOrder(null) : startEditOrder(selectedOrder)}
                  style={{ ...S.actionBtn(editingOrder ? '#EF4444' : '#F59E0B'), padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}
                >
                  {editingOrder ? '✕ Batal Edit' : '✏️ Edit Pesanan'}
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: selectedOrder.isDraft ? '#EAB308' : '#888', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
              {selectedOrder.isDraft ? 'DRAFT IN PROGRESS' : selectedOrder.orderId}
            </div>

            {/* ── Order info grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><div style={S.label}>From</div><div style={{ fontSize: '1rem', color: '#f5f5f5' }}>{selectedOrder.sender}</div></div>
              <div><div style={S.label}>To</div><div style={{ fontSize: '1rem', color: '#f5f5f5' }}>{selectedOrder.recipient} {selectedOrder.nickname && <span style={{ opacity: 0.7, fontSize: '0.85em' }}>({selectedOrder.nickname})</span>}</div></div>
              <div><div style={S.label}>Moment</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{selectedOrder.moment}{selectedOrder.milestoneNumber ? ` (ke-${selectedOrder.milestoneNumber})` : ''} {selectedOrder.specialDate && `(${selectedOrder.specialDate}${selectedOrder.specialDateOccasion ? ` - ${selectedOrder.specialDateOccasion}` : ''})`}</div></div>
              <div><div style={S.label}>Theme</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{selectedOrder.theme}</div></div>
              {selectedOrder.relationship && (
                <div><div style={S.label}>Hubungan</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{selectedOrder.relationship}</div></div>
              )}
              {selectedOrder.recipientBirthdate && (
                <div><div style={S.label}>Tgl Lahir Penerima</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{selectedOrder.recipientBirthdate}</div></div>
              )}
              {selectedOrder.deadline && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={S.label}>Deadline</div>
                  <div style={{ fontSize: '0.95rem', color: '#FCD34D', fontWeight: 600 }}>
                    {new Date(selectedOrder.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                </div>
              )}
              <div><div style={S.label}>Writing Tone</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{Array.isArray(selectedOrder.tone) ? selectedOrder.tone.join(', ') : selectedOrder.tone}</div></div>
              {selectedOrder.reasonChoice && (
                <div><div style={S.label}>Tema Alasan Cinta</div><div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>{selectedOrder.reasonChoice}</div></div>
              )}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={S.label}>Music Choice</div>
                <div style={{ fontSize: '0.9rem', color: '#f5f5f5' }}>
                  {selectedOrder.musicChoice === 'random' ? 'Let Team Decide (Random)' :
                   selectedOrder.musicChoice === 'playlist' ? `Playlist: ${selectedOrder.music || 'None'}` :
                   `Request: ${selectedOrder.music || 'None'}`}
                </div>
              </div>
            </div>

            {/* ── Message ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ ...S.label, marginBottom: 0 }}>Message</div>
              </div>
              {editingOrder ? (
                <textarea
                  value={editingOrder.message}
                  onChange={e => setEditingOrder(prev => ({ ...prev, message: e.target.value }))}
                  rows={8}
                  style={{ ...S.input, marginBottom: 0, resize: 'vertical', lineHeight: 1.6, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <div style={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem', color: '#ddd', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {selectedOrder.message || 'No message provided.'}
                </div>
              )}
            </div>

            {/* ── Photos / Videos ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ ...S.label, marginBottom: 0 }}>
                  Photos / Videos ({editingOrder ? editingOrder.photos.length : (selectedOrder.photos?.length || 0)})
                </div>
                {!editingOrder && selectedOrder.photos && selectedOrder.photos.length > 0 && (
                  <button
                    onClick={async () => {
                      const photos = selectedOrder.photos;
                      for (let i = 0; i < photos.length; i++) {
                        try {
                          const rawUrl = typeof photos[i] === 'string' ? photos[i] : photos[i]?.url;
                          if (!rawUrl) continue;
                          const res = await fetch(rawUrl);
                          const blob = await res.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          const ext = rawUrl.split('.').pop().split('?')[0] || 'jpg';
                          a.download = `order_${selectedOrder.orderId}_media_${i + 1}.${ext}`;
                          document.body.appendChild(a); a.click(); document.body.removeChild(a);
                          URL.revokeObjectURL(blobUrl);
                        } catch (err) { console.error('Failed to download', err); }
                      }
                    }}
                    style={{ ...S.actionBtn('#3B82F6'), padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    ⬇️ Download All
                  </button>
                )}
              </div>

              {editingOrder ? (
                <>
                  {/* Add new photo URL input */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      ref={newPhotoInputRef}
                      type="text"
                      value={newPhotoUrl}
                      onChange={e => setNewPhotoUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                      placeholder="Paste URL foto/video lalu Enter atau klik Tambah"
                      style={{ ...S.input, flex: 1, marginBottom: 0, fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={handleAddPhoto}
                      style={{ ...S.actionBtn('#22C55E'), background: '#22C55E20', whiteSpace: 'nowrap', padding: '0 1rem' }}
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* Photo list with remove buttons */}
                  {editingOrder.photos.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {editingOrder.photos.map((p, i) => {
                        const url = typeof p === 'string' ? p : p?.url;
                        const isVideo = url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm'));
                        return (
                          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', background: '#222', border: '1px solid #333' }}>
                            {isVideo ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.6rem', color: '#888' }}>VIDEO</div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <button
                              onClick={() => handleRemovePhoto(i)}
                              style={{
                                position: 'absolute', top: '3px', right: '3px',
                                background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%',
                                width: '20px', height: '20px', cursor: 'pointer',
                                fontSize: '0.6rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, lineHeight: 1
                              }}
                              title="Hapus foto ini"
                            >✕</button>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', fontSize: '0.55rem', color: '#aaa', textAlign: 'center', padding: '2px' }}>#{i + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#666', padding: '1rem', background: '#0a0a0a', border: '1px dashed #333', borderRadius: '8px', textAlign: 'center' }}>Belum ada foto. Paste URL di atas untuk menambah.</div>
                  )}
                </>
              ) : (
                selectedOrder.photos && selectedOrder.photos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {selectedOrder.photos.map((p, i) => {
                      const url = typeof p === 'string' ? p : p?.url;
                      return (
                        <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', background: '#222' }}>
                          {url && (url.endsWith('.mp4') || url.endsWith('.mov')) ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.6rem' }}>VIDEO</div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>No media uploaded.</div>
                )
              )}
            </div>

            {/* ── Secret Photo ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={S.label}>Secret Ending Media</div>
              {editingOrder ? (
                <input
                  type="text"
                  value={editingOrder.secretPhoto}
                  onChange={e => setEditingOrder(prev => ({ ...prev, secretPhoto: e.target.value }))}
                  placeholder="URL secret photo/video (opsional)"
                  style={{ ...S.input, marginBottom: 0, fontSize: '0.8rem' }}
                />
              ) : (
                selectedOrder.secretPhoto ? (
                  <a href={selectedOrder.secretPhoto} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#222', borderRadius: '6px', fontSize: '0.8rem', color: '#f5f5f5', textDecoration: 'none' }}>
                    View Secret File 🔗
                  </a>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>No secret media.</div>
                )
              )}
            </div>

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {editingOrder ? (
                <>
                  <button
                    onClick={() => { setEditingOrder(null); setNewPhotoUrl(''); }}
                    style={{ padding: '0.6rem 1.2rem', background: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveOrder}
                    disabled={savingOrder}
                    style={{ ...S.newBtn, background: 'linear-gradient(135deg, #22C55E, #15803D)', opacity: savingOrder ? 0.6 : 1 }}
                  >
                    {savingOrder ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setSelectedOrder(null); setEditingOrder(null); setNewPhotoUrl(''); }}
                  style={{ padding: '0.6rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── New Gift Modal ───────────────────────────────────────── */}
      {showNew && (
        <div style={S.modal} onClick={() => setShowNew(false)}>
          <form style={S.modalCard} onClick={e => e.stopPropagation()} onSubmit={handleCreate}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Create New Gift</h2>
            <label style={S.label}>Recipient Name</label>
            <input style={S.input} value={newRecipient} onChange={e => setNewRecipient(e.target.value)} placeholder="e.g. Nadia" required />
            <label style={S.label}>URL Slug</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                style={{ ...S.input, flex: 1, marginBottom: 0 }}
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                placeholder="e.g. untuk-nadia atau auto-xxxxxxx"
                required
              />
              <button
                type="button"
                onClick={() => {
                  const rand = Math.random().toString(36).slice(2, 9);
                  const id = `auto-${rand}`;
                  setNewSlug(id);
                  setNewRecipient(id);
                }}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0 0.85rem',
                  height: '42px',
                  background: '#222',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#aaa',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                🎲 Generate ID
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowNew(false)} style={{ ...S.logoutBtn, flex: 1 }}>Cancel</button>
              <button type="submit" disabled={creating} style={{ ...S.newBtn, flex: 1, opacity: creating ? 0.6 : 1 }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Post-Create Choice Modal ─────────────────────────────── */}
      {createdSlug && (
        <div style={S.modal} onClick={() => { setCreatedSlug(null); setNewSlug(''); }}>
          <div style={{ ...S.modalCard, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Gift Created!</h2>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>What would you like to do next?</p>
            </div>
            <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug / KV ID</div>
              <div style={{ fontSize: '0.85rem', color: '#f5f5f5', fontFamily: 'monospace' }}>{createdSlug}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  const formUrl = `${window.location.origin}/form/${createdSlug}`;
                  navigator.clipboard.writeText(formUrl).then(() => alert('✅ Form link copied to clipboard!'));
                }}
                style={{ ...S.newBtn, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>🔗</span> Copy Form Link
              </button>
              <button
                onClick={() => { setCreatedSlug(null); setNewSlug(''); router.push(`/studio/${createdSlug}/edit`); }}
                style={{ ...S.newBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>✏️</span> Open in Studio Editor
              </button>
              <button
                onClick={() => { setCreatedSlug(null); setNewSlug(''); }}
                style={{ ...S.logoutBtn, textAlign: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Gift Modal ────────────────────────────────────── */}
      {showRename && renameData && (
        <div style={S.modal} onClick={() => setShowRename(false)}>
          <form style={S.modalCard} onClick={e => e.stopPropagation()} onSubmit={handleRename}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gift Settings</h2>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>Update the recipient name or the URL link for this gift.</p>
            <label style={S.label}>Recipient Name</label>
            <input style={S.input} value={renameData.newRecipient} onChange={e => setRenameData({ ...renameData, newRecipient: e.target.value })} placeholder="e.g. Nadia" required />
            <label style={S.label}>URL Slug (Domain Link)</label>
            <input style={S.input} value={renameData.newSlug} onChange={e => setRenameData({ ...renameData, newSlug: e.target.value })} placeholder="e.g. untuk-nadia" required />
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
