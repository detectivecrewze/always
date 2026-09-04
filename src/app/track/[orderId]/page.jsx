'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Users, ExternalLink, RefreshCw, Send, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function CoordinatorTrackPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const getContributorUrl = () => {
    if (typeof window === 'undefined' || !order?.slug) return '';
    return `${window.location.origin}/c/${order.slug}`;
  };

  const copyContributorLink = () => {
    const url = getContributorUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
        setOrder(prev => prev ? { ...prev, status: 'ready_to_craft' } : prev);
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
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Memuat status kado keroyokan...</p>
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

  const waShareText = encodeURIComponent(
    `Guys! Tolong isi ucapan & upload foto kenangan kalian buat kado ultah ${order.recipient} di sini yaa (rahasia yaa jangan bilang orangnya):\n\n` +
    `${getContributorUrl()}\n\n` +
    `Tinggal klik link-nya dan submit langsung dari HP. Makasihh yaa guys!`
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d070b', color: '#f5f5f5', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        
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
            {isCollecting && 'Sebarkan link pengumpulan ke teman-teman. Begitu semua sudah selesai mengisi, klik tombol "Siap Dibuat" agar kado segera dirangkai oleh tim FYA.'}
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

        {/* Share Box for WhatsApp */}
        <div style={{ background: '#160d13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Users size={18} color="#E11D48" />
            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Link Portal Teman-Teman</h2>
          </div>
          <p style={{ fontSize: '0.78rem', opacity: 0.65, marginBottom: '1rem', lineHeight: 1.4 }}>
            Kirimkan link ini ke grup chat teman-teman. Mereka bisa mengisi nama, pesan, dan upload 1 foto kenangan.
          </p>

          <div style={{ background: '#0a0508', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getContributorUrl()}
            </span>
            <button
              onClick={copyContributorLink}
              style={{ background: copied ? '#22C55E' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0, transition: 'all 0.2s' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${waShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '#25D366', color: '#fff', textDecoration: 'none', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(37,211,102,0.2)' }}
          >
            <Send size={16} />
            <span>Bagikan Langsung ke Grup WhatsApp</span>
          </a>
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
                return (
                  <div
                    key={w.id || idx}
                    style={{ background: '#0a0508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E11D4825', border: '1px solid #E11D4855', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{w.name}</span>
                    </div>
                    {subDate && <span style={{ fontSize: '0.72rem', opacity: 0.4 }}>{subDate}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#0a0508', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Users size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.82rem', opacity: 0.6, margin: 0 }}>Belum ada ucapan teman yang masuk.</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.4, margin: '4px 0 0' }}>Bagikan link di atas ke teman-teman agar daftar terisi.</p>
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

      </div>
    </div>
  );
}
