'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, defaultTheme } from '@/lib/themes';
import { compressImage } from '@/lib/imageCompression';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 2 ? 1 : 0)} ${sizes[i]}`;
}

export default function ContributorForm({ slug, recipient, moment, theme }) {
  const t = themes[theme] || themes[defaultTheme];

  const themeStyles = {
    '--color-bg': t.bg,
    '--color-surface': t.surface,
    '--color-text': t.text,
    '--color-text-muted': t.textMuted,
    '--color-accent': t.accent,
    '--color-particle': t.particle,
  };

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [compressedResult, setCompressedResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedWish, setSubmittedWish] = useState(null);

  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    setErrorMsg('');
    setIsCompressing(true);

    try {
      const res = await compressImage(file);
      setCompressedResult(res);
      setPhotoFile(res.file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error('Compression error:', err);
      // Fallback to original file
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedResult(null);
    } finally {
      setIsCompressing(false);
      // Reset input value to allow selecting same file again if desired
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhotoFile(null);
    setCompressedResult(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName) {
      setErrorMsg('Mohon isi nama atau panggilanmu.');
      return;
    }
    if (!cleanMessage) {
      setErrorMsg('Mohon tuliskan pesan ucapanmu.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    let uploadedPhotoUrl = '';

    try {
      // 1. Upload photo if selected
      if (photoFile) {
        setStatusStep('Mengompres & mengunggah foto...');
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('slug', slug);

        const uploadRes = await fetch('/api/upload-public', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah foto');
        }

        const uploadData = await uploadRes.json();
        uploadedPhotoUrl = uploadData.url || '';
      }

      // 2. Submit wish to circle-wishes endpoint
      setStatusStep('Menyimpan pesan ucapan...');
      const wishRes = await fetch(`/api/circle-wishes/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          message: cleanMessage,
          photoUrl: uploadedPhotoUrl,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!wishRes.ok) {
        const errJson = await wishRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengirim ucapan');
      }

      const wishData = await wishRes.json();
      setSubmittedWish(wishData.wish || {
        name: cleanName,
        message: cleanMessage,
        photoUrl: uploadedPhotoUrl,
      });
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim ucapan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
      setStatusStep('');
    }
  };

  const handleResetForm = () => {
    setName('');
    setMessage('');
    handleRemovePhoto();
    setSubmittedWish(null);
    setErrorMsg('');
  };

  return (
    <div
      style={themeStyles}
      className="min-h-screen bg-bg text-text selection:bg-accent/30 font-sans flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-lg">
        {/* Top Branding / Moment Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-3 border border-accent/20 bg-accent/10 text-accent">
            <span>✨</span>
            <span>Circle of Wishes</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal leading-tight">
            Kado Ucapan untuk <span className="text-accent italic">{recipient}</span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Tuliskan pesan ucapan dan bagikan momen kenangan manismu untuk kado kejutan {moment.toLowerCase()} {recipient}.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 75%, transparent)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}
        >
          <AnimatePresence mode="wait">
            {!submittedWish ? (
              // ── Input Form ──
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Friend Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Nama / Panggilanmu <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Sarah / Sahabat SMA"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Wish Message */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Pesan Ucapan <span className="text-accent">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted">
                      {message.length}/500
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Selamat ulang tahun ${recipient}! Semoga sehat selalu, lancar segala impiannya, dan bahagia terus ya...`}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Memory Photo (Optional) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Foto Kenangan (Opsional)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSubmitting || isCompressing}
                  />

                  {!previewUrl ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing || isSubmitting}
                      className="w-full border-2 border-dashed border-white/15 hover:border-accent/50 rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer bg-white/[0.02] hover:bg-white/[0.05]"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        {isCompressing ? (
                          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-medium text-text">
                        {isCompressing ? 'Mengompres foto...' : 'Pilih Foto dari Galeri / Kamera'}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Otomatis dikompresi & dioptimasi di HP Anda
                      </span>
                    </button>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30 p-3 flex items-center gap-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-text font-medium truncate">
                          <span>📸</span>
                          <span className="truncate">{photoFile?.name || 'Foto Terpilih'}</span>
                        </div>
                        {compressedResult && (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                            <span>⚡</span>
                            <span>
                              {formatBytes(compressedResult.originalSize)} → {formatBytes(compressedResult.compressedSize)} (-{compressedResult.compressionRatio}%)
                            </span>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] text-accent hover:underline"
                            disabled={isSubmitting}
                          >
                            Ganti Foto
                          </button>
                          <span className="text-[11px] text-text-muted">•</span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-[11px] text-red-400 hover:underline"
                            disabled={isSubmitting}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2"
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, #000))',
                    boxShadow: '0 8px 24px color-mix(in srgb, var(--color-accent) 30%, transparent)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{statusStep || 'Mengirim Ucapan...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Ucapan</span>
                      <span>💌</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              // ── Success State ──
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4 space-y-6"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-2xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-text mb-1">
                    Terima Kasih, {submittedWish.name}!
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm">
                    Pesan hangatmu telah tersimpan dan akan ditampilkan di kado spesial {recipient}.
                  </p>
                </div>

                {/* Polaroid Preview Card */}
                <div className="max-w-xs mx-auto p-4 rounded-xl bg-surface/90 border border-white/10 shadow-xl text-left transform rotate-1 transition-transform hover:rotate-0">
                  {submittedWish.photoUrl ? (
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-black/30">
                      <img
                        src={submittedWish.photoUrl}
                        alt="Memory"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 text-accent font-serif flex items-center justify-center text-lg mb-3">
                      {submittedWish.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-text text-xs italic line-clamp-4 mb-2">
                    &ldquo;{submittedWish.message}&rdquo;
                  </p>
                  <p className="text-accent text-[11px] font-semibold text-right">
                    — {submittedWish.name}
                  </p>
                </div>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 text-xs font-medium transition-all"
                >
                  <span>✍️</span>
                  <span>Kirim Ucapan Lain</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-text-muted/60 text-[11px] mt-6 font-serif">
          Memoria · Handcrafted digital gift atelier
        </p>
      </div>
    </div>
  );
}
