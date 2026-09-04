'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Camera,
  Video,
  Zap,
  AlertCircle,
  Send,
  Check,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { themes, defaultTheme } from '@/lib/themes';
import { compressImage } from '@/lib/imageCompression';
import { checkVideoMetadata, isVideoMedia } from '@/lib/videoValidation';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 2 ? 1 : 0)} ${sizes[i]}`;
}

export default function ContributorForm({
  slug,
  recipient,
  moment,
  theme,
  initialToken = '',
  initialValidation = null,
}) {
  const t = themes[theme] || themes[defaultTheme];

  const themeStyles = {
    '--color-bg': t.bg,
    '--color-surface': t.surface,
    '--color-text': t.text,
    '--color-text-muted': t.textMuted,
    '--color-accent': t.accent,
    '--color-particle': t.particle,
  };

  const searchParams = useSearchParams();
  const urlToken = (searchParams?.get('token') || initialToken || '').trim();

  const [token, setToken] = useState(urlToken);
  const [tokenState, setTokenState] = useState(() => {
    if (initialValidation) {
      if (initialValidation.valid) return 'valid';
      if (initialValidation.reason === 'already_used' || initialValidation.status === 'used') return 'used';
      return 'invalid';
    }
    return urlToken ? 'checking' : 'missing';
  });
  const [validationData, setValidationData] = useState(initialValidation);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video' | null
  const [videoDuration, setVideoDuration] = useState(null);
  const [compressedResult, setCompressedResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedWish, setSubmittedWish] = useState(null);

  const fileInputRef = useRef(null);

  // Clean up object URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Client-side verification fallback if initialValidation was not passed
  useEffect(() => {
    if (!initialValidation && urlToken) {
      let isMounted = true;
      setToken(urlToken);
      setTokenState('checking');
      fetch(`/api/circle-wishes/${encodeURIComponent(slug)}?token=${encodeURIComponent(urlToken)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setValidationData(data);
          if (data.valid) {
            setTokenState('valid');
          } else if (data.reason === 'already_used' || data.status === 'used') {
            setTokenState('used');
          } else {
            setTokenState('invalid');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setTokenState('invalid');
          setValidationData({ valid: false, message: 'Gagal memverifikasi tautan undangan.' });
        });
      return () => {
        isMounted = false;
      };
    }
  }, [slug, urlToken, initialValidation]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    // 1. Check Max Size: 20 MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMsg(`Ukuran file terlalu besar (${sizeMB} MB). Batas maksimal adalah 20 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Classify media type
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isImage && !isVideo) {
      setErrorMsg('Format file tidak didukung. Harap pilih foto (JPG, PNG, WebP) atau video pendek (MP4, WebM, MOV).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessingMedia(true);

    try {
      if (isVideo) {
        // Validate video duration: 1 to 15 seconds (tolerance up to 15.9s)
        const dur = await checkVideoMetadata(file, 1, 15);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const newPreview = URL.createObjectURL(file);
        setMediaType('video');
        setMediaFile(file);
        setVideoDuration(dur);
        setCompressedResult(null);
        setPreviewUrl(newPreview);
      } else {
        // Compress image via canvas downsampler
        const res = await compressImage(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setMediaType('image');
        setCompressedResult(res);
        setMediaFile(res.file);
        setVideoDuration(null);
        setPreviewUrl(URL.createObjectURL(res.blob));
      }
    } catch (err) {
      console.error('Media processing error:', err);
      setErrorMsg(err.message || 'Gagal memproses file yang dipilih.');
      handleRemoveMedia();
    } finally {
      setIsProcessingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setMediaFile(null);
    setMediaType(null);
    setVideoDuration(null);
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
    let uploadedMediaUrl = '';

    try {
      // 1. Upload media if selected
      if (mediaFile) {
        if (mediaType === 'video') {
          setStatusStep('Mengunggah video pendek...');
        } else {
          setStatusStep('Mengompres & mengunggah foto...');
        }

        const formData = new FormData();
        formData.append('file', mediaFile);
        formData.append('slug', slug);

        const uploadRes = await fetch('/api/upload-public', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah media');
        }

        const uploadData = await uploadRes.json();
        uploadedMediaUrl = uploadData.url || '';
      }

      // 2. Submit wish with token to circle-wishes endpoint
      setStatusStep('Menyimpan pesan ucapan...');
      const wishRes = await fetch(`/api/circle-wishes/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: cleanName,
          message: cleanMessage,
          photoUrl: uploadedMediaUrl,
          mediaUrl: uploadedMediaUrl,
          mediaType: mediaType || (uploadedMediaUrl ? (isVideoMedia(uploadedMediaUrl) ? 'video' : 'photo') : null),
          createdAt: new Date().toISOString(),
        }),
      });

      if (!wishRes.ok) {
        const errJson = await wishRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengirim ucapan');
      }

      const wishData = await wishRes.json();
      setSubmittedWish(
        wishData.wish || {
          name: cleanName,
          message: cleanMessage,
          photoUrl: uploadedMediaUrl,
          mediaUrl: uploadedMediaUrl,
          mediaType: mediaType,
        }
      );
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim ucapan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
      setStatusStep('');
    }
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
            <Sparkles size={13} />
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
          {/* STATE 1: CHECKING TOKEN */}
          {tokenState === 'checking' && (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-text-muted">Memverifikasi tautan undangan...</p>
            </div>
          )}

          {/* STATE 2: TOKEN MISSING OR INVALID */}
          {(tokenState === 'invalid' || tokenState === 'missing') && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert size={28} />
              </div>
              <h3 className="font-serif text-2xl text-text">
                {validationData?.reason === 'missing_parameters' || tokenState === 'missing'
                  ? 'Undangan Khusus Diperlukan'
                  : 'Tautan Tidak Valid'}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
                {validationData?.reason === 'missing_parameters' || tokenState === 'missing'
                  ? `Halaman pengisian ucapan untuk ${recipient} dilindungi dengan sistem slot undangan privat. Pastikan kamu membuka tautan khusus yang dibagikan oleh koordinator kado.`
                  : (validationData?.message || 'Token undangan ini tidak valid atau sudah kedaluwarsa. Silakan hubungi koordinator kado untuk mendapatkan tautan baru.')}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted">
                  <Lock size={12} />
                  <span>Sistem Tautan Privat · Memoria Circle</span>
                </span>
              </div>
            </div>
          )}

          {/* STATE 3: TOKEN ALREADY USED */}
          {tokenState === 'used' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-serif text-2xl text-text">
                Tautan Sudah Digunakan
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
                Tautan undangan ini sudah digunakan oleh{' '}
                <strong className="text-text font-semibold">
                  {validationData?.claimedBy || 'seorang teman'}
                </strong>{' '}
                untuk mengirimkan ucapan kado {recipient}.
              </p>
              <p className="text-[11px] text-text-muted/70 max-w-xs mx-auto">
                Setiap tautan bersifat personal dan sekali pakai demi menjaga integritas kuota slot kado.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Lock size={12} />
                  <span>Slot Telah Terisi · Memoria Circle</span>
                </span>
              </div>
            </div>
          )}

          {/* STATE 4: TOKEN VALID -> FORM / SUCCESS */}
          {tokenState === 'valid' && (
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
                  {/* Verified Slot Indicator */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <ShieldCheck size={13} />
                      <span>
                        Slot Undangan Terverifikasi
                        {validationData?.slotIndex ? ` #${validationData.slotIndex}` : ''}
                      </span>
                    </span>
                    <span className="text-[10px] text-text-muted/60 uppercase tracking-wider">
                      Tautan Privat
                    </span>
                  </div>

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

                  {/* Memory Media (Photo or Short Video) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                      Foto Kenangan / Video Pendek (Opsional)
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      onChange={handleMediaSelect}
                      className="hidden"
                      disabled={isSubmitting || isProcessingMedia}
                    />

                    {!previewUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingMedia || isSubmitting}
                        className="w-full border-2 border-dashed border-white/15 hover:border-accent/50 rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer bg-white/[0.02] hover:bg-white/[0.05]"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                          {isProcessingMedia ? (
                            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <Camera size={16} />
                              <Video size={16} />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-text">
                          {isProcessingMedia ? 'Memeriksa & memproses media...' : 'Pilih Foto atau Video Pendek'}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Foto otomatis dioptimasi · Video maks 15 dtk &amp; 20 MB
                        </span>
                      </button>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30 p-3 flex items-center gap-4">
                        {mediaType === 'video' ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/60 flex items-center justify-center">
                            <video
                              src={previewUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              webkit-playsinline=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono leading-none">
                              {videoDuration ? `${videoDuration.toFixed(1)}s` : 'Video'}
                            </div>
                          </div>
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-text font-medium truncate">
                            {mediaType === 'video' ? (
                              <Video size={13} className="text-accent shrink-0" />
                            ) : (
                              <Camera size={13} className="text-accent shrink-0" />
                            )}
                            <span className="truncate">{mediaFile?.name || 'Media Terpilih'}</span>
                          </div>

                          {mediaType === 'video' && videoDuration && (
                            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                              <Video size={11} />
                              <span>
                                {videoDuration.toFixed(1)} dtk · {formatBytes(mediaFile?.size)}
                              </span>
                            </div>
                          )}

                          {mediaType === 'image' && compressedResult && (
                            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                              <Zap size={11} />
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
                              {mediaType === 'video' ? 'Ganti Video' : 'Ganti Foto'}
                            </button>
                            <span className="text-[11px] text-text-muted">•</span>
                            <button
                              type="button"
                              onClick={handleRemoveMedia}
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
                      <AlertCircle size={14} className="text-red-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isProcessingMedia}
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
                        <Send size={15} />
                        <span>Kirim Ucapan</span>
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
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check size={28} />
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-text mb-1">
                      Terima Kasih, {submittedWish.name}!
                    </h3>
                    <p className="text-text-muted text-xs sm:text-sm">
                      Pesan hangatmu telah tersimpan rapi dan slot undangan ini telah berhasil dikunci untuk kado spesial {recipient}.
                    </p>
                  </div>

                  {/* Polaroid Preview Card */}
                  <div className="max-w-xs mx-auto p-4 rounded-xl bg-surface/90 border border-white/10 shadow-xl text-left transform rotate-1 transition-transform hover:rotate-0">
                    {submittedWish.photoUrl || submittedWish.mediaUrl ? (
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-black/30">
                        {submittedWish.mediaType === 'video' || isVideoMedia(submittedWish.photoUrl || submittedWish.mediaUrl) ? (
                          <video
                            src={submittedWish.mediaUrl || submittedWish.photoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            webkit-playsinline=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={submittedWish.photoUrl || submittedWish.mediaUrl}
                            alt="Memory"
                            className="w-full h-full object-cover"
                          />
                        )}
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

                  {/* Locked Confirmation Badge */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium">
                      <ShieldCheck size={14} />
                      <span>Slot Undangan Berhasil Terkunci</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-text-muted/60 text-[11px] mt-6 font-serif">
          Memoria · Handcrafted digital gift atelier
        </p>
      </div>
    </div>
  );
}
