'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Users,
  ExternalLink,
  RefreshCw,
  Send,
  ShieldCheck,
  Lock,
  Plus,
  AlertCircle,
  Eye,
  Trash2,
  X,
  Video,
  MessageSquare,
} from 'lucide-react';

export default function CoordinatorTrackPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedSlotId, setCopiedSlotId] = useState(null);
  const [markingReady, setMarkingReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);
  const [resettingSlotId, setResettingSlotId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [selectedWishModal, setSelectedWishModal] = useState(null);
  const [wishToDelete, setWishToDelete] = useState(null);
  const [deletingWish, setDeletingWish] = useState(false);

  const fetchTracking = useCallback(async (isSilent = false) => {
    if (!orderId) return;
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        throw new Error('Pesanan tidak ditemukan atau link sudah kedaluwarsa.');
      }
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        throw new Error(data.error || 'Gagal memuat status pesanan.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking(true);
  };

  const getSlotUrl = (slot) => {
    if (typeof window === 'undefined' || !order?.slug) return '';
    return `${window.location.origin}/c/${order.slug}?token=${slot.token}`;
  };

  const copySlotLink = (slot) => {
    const url = getSlotUrl(slot);
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedSlotId(slot.id);
    setTimeout(() => setCopiedSlotId(null), 2500);
  };

  const getSlotWaUrl = (slot) => {
    const url = getSlotUrl(slot);
    if (!url) return '#';
    const text = encodeURIComponent(
      `Halo! Ini tautan khusus kamu untuk mengisi ucapan dan foto kenangan kado kejutan ${order.recipient}:\n\n` +
      `${url}\n\n` +
      `Catatan: Tautan ini bersifat privat dan hanya dapat digunakan 1 kali demi keamanan kado. Terima kasih banyak!`
    );
    return `https://wa.me/?text=${text}`;
  };

  const handleAddSlot = async () => {
    const currentSlots = Array.isArray(order?.slots) ? order.slots : [];
    if (currentSlots.length >= 20) {
      alert('Maksimal kuota Circle Edition adalah 20 slot.');
      return;
    }
    setAddingSlot(true);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder((prev) => (prev ? { ...prev, slots: data.slots, circleQuota: data.slots.length } : prev));
        setActionNotice({ type: 'success', text: `Slot #${data.slot.index} berhasil ditambahkan.` });
        setTimeout(() => setActionNotice(null), 3500);
      } else {
        setActionNotice({ type: 'error', text: data.error || 'Gagal menambah slot.' });
      }
    } catch {
      setActionNotice({ type: 'error', text: 'Terjadi kesalahan saat menambah slot.' });
    } finally {
      setAddingSlot(false);
    }
  };

  const handleResetSlot = async (slot) => {
    if (slot.status === 'used') {
      alert('Slot yang sudah terisi oleh teman tidak dapat direset.');
      return;
    }
    if (!confirm(`Yakin ingin mereset tautan untuk Slot #${slot.index}? Tautan lama akan hangus dan dibuatkan token baru.`)) {
      return;
    }
    setResettingSlotId(slot.id);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', slotId: slot.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder((prev) => (prev ? { ...prev, slots: data.slots } : prev));
        setActionNotice({ type: 'success', text: `Tautan Slot #${slot.index} berhasil diperbarui dengan token baru.` });
        setTimeout(() => setActionNotice(null), 3500);
      } else {
        setActionNotice({ type: 'error', text: data.error || 'Gagal mereset tautan slot.' });
      }
    } catch {
      setActionNotice({ type: 'error', text: 'Terjadi kesalahan saat mereset slot.' });
    } finally {
      setResettingSlotId(null);
    }
  };

  const getSlotWish = (slot) => {
    if (!slot || slot.status !== 'used') return null;
    const wishes = Array.isArray(order?.circleWishes) ? order.circleWishes : [];
    return (
      wishes.find((w) => slot.wishId && w.id === slot.wishId) ||
      wishes.find((w) => w.name && slot.claimedBy && w.name.trim().toLowerCase() === slot.claimedBy.trim().toLowerCase()) ||
      null
    );
  };

  const handleDeleteWish = async () => {
    if (!wishToDelete) return;
    const { slot, wish } = wishToDelete;
    setDeletingWish(true);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-wish',
          slotId: slot.id,
          wishId: wish?.id || slot.wishId || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder((prev) => {
          if (!prev) return prev;
          const updatedSlots = data.slots || prev.slots.map((s) => (s.id === slot.id ? data.slot : s));
          const deletedId = data.deletedWishId || wish?.id;
          const updatedWishes = (prev.circleWishes || []).filter((w) => w.id !== deletedId);
          return {
            ...prev,
            slots: updatedSlots,
            circleWishes: updatedWishes,
            wishesCount: Math.max(0, (prev.wishesCount || updatedWishes.length) - 1),
          };
        });

        setActionNotice({
          type: 'success',
          text: `Ucapan dari ${wish?.name || slot.claimedBy || 'teman'} berhasil dihapus. Slot #${slot.index} siap diisi ulang dengan link baru.`,
        });
        setTimeout(() => setActionNotice(null), 4000);

        setWishToDelete(null);
        setSelectedWishModal(null);
      } else {
        setActionNotice({ type: 'error', text: data.error || 'Gagal menghapus ucapan.' });
      }
    } catch {
      setActionNotice({ type: 'error', text: 'Terjadi kesalahan saat menghapus ucapan.' });
    } finally {
      setDeletingWish(false);
    }
  };

  const handleMarkReady = async () => {
    if (!confirm('Apakah seluruh teman sudah selesai mengisi? Setelah dikonfirmasi, pesanan ini akan langsung masuk antrean prioritas tim FYA untuk dirangkai.')) {
      return;
    }
    setMarkingReady(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (res.ok && (result.success || result.ok)) {
        setOrder((prev) => (prev ? { ...prev, status: 'ready_to_craft' } : prev));
      } else {
        alert(result.error || 'Gagal mengubah status pesanan.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat memperbarui status.');
    } finally {
      setMarkingReady(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d070b', color: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E11D48', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Memuat status Circle Edition...</p>
        </div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d070b', color: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Pesanan Tidak Ditemukan</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {error || 'Pastikan ID pesanan pada URL sudah benar atau hubungi admin jika pesanan baru dibuat.'}
          </p>
          <button onClick={() => fetchTracking()} style={{ background: '#E11D48', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const isCollecting = order.status === 'collecting';
  const isReadyToCraft = order.status === 'ready_to_craft';
  const isDone = order.status === 'done';

  const slots = Array.isArray(order.slots) ? order.slots : [];
  const usedSlotsCount = slots.filter((s) => s.status === 'used').length;
  const totalSlotsCount = slots.length || order.circleQuota || 8;
  const progressPercent = Math.min(100, Math.round((usedSlotsCount / (totalSlotsCount || 1)) * 100));

  return (
    <div style={{ minHeight: '100vh', background: '#0d070b', color: '#f5f5f5', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Top Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E11D48', fontWeight: 600 }}>
            Done For You · Memoria Circle Edition
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
            Hub Pantauan Koordinator
          </h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.3rem' }}>
            Kado Kejutan untuk <strong style={{ color: '#fff' }}>{order.recipient}</strong>
          </p>
        </div>

        {/* Order Status Badge & Info */}
        <div style={{ background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Pesanan</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: '#E11D48' }}>{order.orderId}</div>
            </div>

            {/* Live Status Pill */}
            <div>
              {isCollecting && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '0.35rem 0.8rem', borderRadius: '50px', color: '#FBBF24', fontSize: '0.78rem', fontWeight: 600 }}>
                  Sedang Mengumpulkan Ucapan
                </div>
              )}
              {isReadyToCraft && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', padding: '0.35rem 0.8rem', borderRadius: '50px', color: '#4ADE80', fontSize: '0.78rem', fontWeight: 600 }}>
                  Siap Dikerjakan Atelier
                </div>
              )}
              {isDone && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', padding: '0.35rem 0.8rem', borderRadius: '50px', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600 }}>
                  Kado Selesai Dibuat
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
            {isCollecting && 'Bagikan tautan privat di bawah ke masing-masing teman agar mereka bisa titip ucapan. Begitu ucapan terkumpul atau dirasa cukup, klik tombol "Siap Dibuat" agar kado segera dirangkai oleh tim atelier.'}
            {isReadyToCraft && 'Pesanan kamu sudah masuk antrean prioritas atelier tim FYA! Kami sedang merangkai tata letak ucapan dan estetika kado.'}
            {isDone && 'Kado kamu sudah terbit dan siap dinikmati! Kamu bisa melihat preview kado final lewat tombol di bawah.'}
          </p>

          {isDone && (
            <div style={{ marginTop: '1rem' }}>
              <a
                href={`/${order.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#3B82F6', color: '#fff', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <span>Buka Kado Digital Final</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: actionNotice.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${actionNotice.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: actionNotice.type === 'success' ? '#4ADE80' : '#F87171',
            }}
          >
            {actionNotice.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* Slot Management Section */}
        <div style={{ background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <Users size={18} color="#E11D48" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Daftar Link Undangan Teman</h2>
              </div>
              <p style={{ fontSize: '0.78rem', opacity: 0.65, margin: 0, lineHeight: 1.4 }}>
                Setiap tautan bersifat privat dan hanya dapat diisi satu kali agar pesan ucapan tidak tertimpa.
              </p>
            </div>

            {/* Add Slot Button */}
            {totalSlotsCount < 20 && (
              <button
                onClick={handleAddSlot}
                disabled={addingSlot}
                style={{
                  background: 'rgba(225,29,72,0.15)',
                  border: '1px solid rgba(225,29,72,0.3)',
                  color: '#FB7185',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: addingSlot ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={14} />
                <span>{addingSlot ? 'Menambah...' : 'Tambah Undangan Teman'}</span>
              </button>
            )}
          </div>

          {/* Slot Progress Bar */}
          <div style={{ background: '#0a0508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ opacity: 0.7 }}>Kemajuan Pengisian Slot</span>
              <strong style={{ color: '#fff' }}>
                {usedSlotsCount} dari {totalSlotsCount} Slot Terisi ({progressPercent}%)
              </strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: progressPercent === 100 ? '#22C55E' : 'linear-gradient(90deg, #E11D48, #FB7185)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Slot Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {slots.map((slot) => {
              const isUsed = slot.status === 'used';
              const isCopied = copiedSlotId === slot.id;
              const slotUrl = getSlotUrl(slot);
              const wish = isUsed ? getSlotWish(slot) : null;

              return (
                <div
                  key={slot.id}
                  style={{
                    background: '#0d070b',
                    border: `1px solid ${isUsed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        Slot #{slot.index}
                      </span>
                      {isUsed ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 600 }}>
                          <Check size={11} />
                          <span>Terisi oleh {slot.claimedBy || wish?.name || 'Teman'}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FBBF24', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 600 }}>
                          Belum Terisi
                        </span>
                      )}
                    </div>

                    {!isUsed && (
                      <button
                        onClick={() => handleResetSlot(slot)}
                        disabled={resettingSlotId === slot.id}
                        title="Reset token jika salah kirim link"
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.6)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: resettingSlotId === slot.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RefreshCw size={11} style={{ animation: resettingSlotId === slot.id ? 'spin 1s linear infinite' : 'none' }} />
                        <span>Reset Link</span>
                      </button>
                    )}
                  </div>

                  {isUsed ? (
                    <div>
                      {wish ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#0a0508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem' }}>
                            {/* Media thumbnail */}
                            {wish.mediaType === 'video' || (wish.mediaUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(wish.mediaUrl)) ? (
                              <div style={{ position: 'relative', width: '56px', height: '56px', minWidth: '56px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                                <video src={wish.mediaUrl} muted playsInline autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 3, right: 3, background: 'rgba(0,0,0,0.65)', borderRadius: '4px', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                  <Video size={10} color="#fff" />
                                </div>
                              </div>
                            ) : wish.photoUrl ? (
                              <div style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '8px', overflow: 'hidden', background: '#160d13' }}>
                                <img src={wish.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '8px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FB7185' }}>
                                <MessageSquare size={20} />
                              </div>
                            )}

                            {/* Snippet text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{wish.name || slot.claimedBy}</span>
                                {wish.createdAt && (
                                  <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>
                                    {new Date(wish.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p style={{
                                fontSize: '0.78rem',
                                color: 'rgba(255,255,255,0.7)',
                                margin: 0,
                                lineHeight: 1.4,
                                fontStyle: 'italic',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                &ldquo;{wish.message}&rdquo;
                              </p>
                            </div>
                          </div>

                          {/* Action buttons for filled slot */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                              onClick={() => setSelectedWishModal({ slot, wish })}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff',
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Eye size={13} />
                              <span>Lihat Ucapan</span>
                            </button>

                            <button
                              onClick={() => setWishToDelete({ slot, wish })}
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: '#F87171',
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Hapus Ucapan</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lock size={12} color="#4ADE80" />
                            <span>
                              Ucapan telah diterima
                              {slot.usedAt ? ` (${new Date(slot.usedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})` : ''}
                              . Tautan terkunci demi keamanan.
                            </span>
                          </div>
                          <button
                            onClick={() => setWishToDelete({ slot, wish: null })}
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              color: '#F87171',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Hapus Ucapan</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* URL preview */}
                      <div style={{ background: '#070406', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.65rem' }}>
                        {slotUrl}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => copySlotLink(slot)}
                          style={{
                            background: isCopied ? '#22C55E' : 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                        </button>

                        <a
                          href={getSlotWaUrl(slot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(37,211,102,0.15)',
                            border: '1px solid rgba(37,211,102,0.3)',
                            color: '#25D366',
                            textDecoration: 'none',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Send size={13} />
                          <span>Kirim via WA</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Contributor Progress Tracker */}
        <div style={{ background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                Teman yang Sudah Mengisi ({order.wishesCount || 0})
              </h2>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '2px 0 0' }}>Diperbarui secara langsung</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>
          </div>

          {order.circleWishes && order.circleWishes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.circleWishes.map((w, idx) => {
                const subDate = w.createdAt ? new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                const matchedSlot = slots.find((s) => s.wishId === w.id || (s.claimedBy && s.claimedBy.trim().toLowerCase() === w.name.trim().toLowerCase()));
                return (
                  <div
                    key={w.id || idx}
                    style={{ background: '#0a0508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div style={{ width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%', background: '#E11D4825', border: '1px solid #E11D4855', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                        {subDate && <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>{subDate}</div>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedWishModal({ slot: matchedSlot, wish: w })}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={12} />
                        <span>Lihat</span>
                      </button>
                      {matchedSlot && (
                        <button
                          onClick={() => setWishToDelete({ slot: matchedSlot, wish: w })}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#F87171',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#0a0508', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Users size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.82rem', opacity: 0.6, margin: 0 }}>Belum ada ucapan teman yang masuk.</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.4, margin: '4px 0 0' }}>Kirim tautan slot di atas ke masing-masing teman agar daftar terisi.</p>
            </div>
          )}
        </div>

        {/* Ready to Craft Action Button */}
        {isCollecting && (
          <div style={{ background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Sudah Cukup Mengumpulkan Ucapan?
            </h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.25rem', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 1.25rem' }}>
              Klik tombol di bawah ini jika semua teman sudah selesai mengisi. Tim atelier FYA akan langsung memproses dan merangkai kado finalnya untuk kamu.
            </p>

            <button
              onClick={handleMarkReady}
              disabled={markingReady}
              style={{
                width: '100%',
                maxWidth: '380px',
                padding: '1rem 1.5rem',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #E11D48, #9D174D)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: markingReady ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(225,29,72,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={18} />
              <span>{markingReady ? 'Menyimpan...' : 'Semua Teman Sudah Isi — Siap Dibuat!'}</span>
            </button>
          </div>
        )}

        {/* Modal Pratinjau Ucapan Teman */}
        {selectedWishModal && (
          <div
            onClick={() => setSelectedWishModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#160d13',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                maxWidth: '480px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E11D48', fontWeight: 600 }}>
                    {selectedWishModal.slot ? `Slot #${selectedWishModal.slot.index}` : 'Ucapan Teman'}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '2px 0 0' }}>
                    {selectedWishModal.wish?.name || selectedWishModal.slot?.claimedBy || 'Teman'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedWishModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Media display */}
              {selectedWishModal.wish && (
                <>
                  {selectedWishModal.wish.mediaType === 'video' ||
                  (selectedWishModal.wish.mediaUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(selectedWishModal.wish.mediaUrl)) ? (
                    <div style={{ marginBottom: '1.25rem', borderRadius: '14px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <video
                        src={selectedWishModal.wish.mediaUrl}
                        controls
                        playsInline
                        autoPlay
                        style={{ width: '100%', maxHeight: '340px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                  ) : selectedWishModal.wish.photoUrl ? (
                    <div style={{ marginBottom: '1.25rem', borderRadius: '14px', overflow: 'hidden', background: '#080407', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      <img
                        src={selectedWishModal.wish.photoUrl}
                        alt=""
                        style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                      />
                    </div>
                  ) : null}

                  {/* Full message text */}
                  <div style={{ background: '#0a0508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                      &ldquo;{selectedWishModal.wish.message}&rdquo;
                    </p>
                    {selectedWishModal.wish.createdAt && (
                      <div style={{ fontSize: '0.72rem', opacity: 0.45, marginTop: '0.75rem', textAlign: 'right' }}>
                        Dikirim pada {new Date(selectedWishModal.wish.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Actions in modal */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {selectedWishModal.slot && (
                  <button
                    onClick={() => {
                      const item = selectedWishModal;
                      setWishToDelete(item);
                    }}
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#F87171',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Hapus Ucapan Ini</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedWishModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dialog Konfirmasi Penghapusan */}
        {wishToDelete && (
          <div
            onClick={() => !deletingWish && setWishToDelete(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a0e16',
                border: '1px solid rgba(225,29,72,0.3)',
                borderRadius: '20px',
                maxWidth: '420px',
                width: '100%',
                padding: '1.75rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(225,29,72,0.15)',
                  border: '1px solid rgba(225,29,72,0.3)',
                  color: '#FB7185',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Trash2 size={22} />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
                Hapus Ucapan Teman?
              </h3>

              <p style={{ fontSize: '0.82rem', opacity: 0.75, lineHeight: 1.5, marginBottom: '1.5rem', color: '#f5f5f5' }}>
                Ucapan dan foto/video dari <strong style={{ color: '#fff' }}>{wishToDelete.wish?.name || wishToDelete.slot?.claimedBy || 'teman'}</strong> akan dihapus permanen.
                <br /><br />
                Tautan Slot #{wishToDelete.slot?.index} akan otomatis di-reset menjadi tautan baru yang siap dibagikan ulang agar teman bisa mengisi kembali.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setWishToDelete(null)}
                  disabled={deletingWish}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: deletingWish ? 'not-allowed' : 'pointer',
                  }}
                >
                  Batal
                </button>

                <button
                  onClick={handleDeleteWish}
                  disabled={deletingWish}
                  style={{
                    background: 'linear-gradient(135deg, #E11D48, #BE123C)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: deletingWish ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
                  }}
                >
                  {deletingWish ? (
                    <>
                      <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Ya, Hapus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
