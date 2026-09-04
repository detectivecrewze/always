'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  MessageSquare,
  Volume2,
} from 'lucide-react';
import { themes, defaultTheme } from '@/lib/themes';
import { compressImage } from '@/lib/imageCompression';
import { checkVideoMetadata, isVideoMedia } from '@/lib/videoValidation';
import {
  getSupportedAudioMimeType,
  formatAudioTime,
  getAudioDuration,
} from '@/lib/audioRecorder';

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

  // Voice Note states
  const [wishMode, setWishMode] = useState('text'); // 'text' | 'voice'
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  const fileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioPreviewElRef = useRef(null);
  // Ref to track recordingSeconds inside MediaRecorder onstop callback (avoids stale closure)
  const recordingSecondsRef = useRef(0);

  // Clean up object URLs and recording resources on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewUrl, audioUrl]);

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
        // Validate video duration: 1 to 30 seconds (tolerance up to 30.9s)
        const dur = await checkVideoMetadata(file, 1, 30);
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

  const handleRemoveAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl('');
    setAudioDuration(0);
    setIsPlayingAudioPreview(false);
    if (audioPreviewElRef.current) {
      audioPreviewElRef.current.pause();
      audioPreviewElRef.current.currentTime = 0;
    }
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser kamu tidak mendukung perekaman mikrofon. Silakan gunakan opsi unggah rekaman.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const actualMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualMime });

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }

        if (blob.size < 100) {
          setErrorMsg('Rekaman suara terlalu pendek atau kosong. Silakan coba lagi.');
          return;
        }

        try {
          const detectedDur = await getAudioDuration(blob, 30);
          // getAudioDuration returns 0 for live WebM blobs (Infinity duration) — use ref as fallback
          const finalDur = (detectedDur > 0) ? detectedDur : recordingSecondsRef.current;
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          const preview = URL.createObjectURL(blob);
          setAudioFile(blob);
          setAudioDuration(finalDur);
          setAudioUrl(preview);
        } catch (durErr) {
          setErrorMsg(durErr.message || 'Gagal memproses rekaman audio.');
        }
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          recordingSecondsRef.current = next; // keep ref in sync
          if (next >= 30) {
            stopRecording();
            return 30;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Izin mikrofon ditolak oleh browser. Harap izinkan akses mic atau gunakan tombol unggah file.');
      } else {
        setErrorMsg(err.message || 'Gagal mengakses mikrofon.');
      }
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
  };

  const handleAudioFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg('Ukuran file audio melebihi 20 MB.');
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
      return;
    }

    try {
      const dur = await getAudioDuration(file, 30);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const preview = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioDuration(dur);
      setAudioUrl(preview);
    } catch (err) {
      setErrorMsg(err.message || 'Format audio tidak didukung atau melebihi 30 detik.');
    } finally {
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    }
  };

  const toggleAudioPreviewPlay = () => {
    if (!audioPreviewElRef.current) return;
    if (isPlayingAudioPreview) {
      audioPreviewElRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPreviewElRef.current.play().then(() => {
        setIsPlayingAudioPreview(true);
      }).catch(() => {});
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

    if (wishMode === 'voice') {
      if (!audioFile) {
        setErrorMsg('Mohon rekam atau unggah pesan suaramu terlebih dahulu.');
        return;
      }
    } else {
      if (!cleanMessage) {
        setErrorMsg('Mohon tuliskan pesan ucapanmu.');
        return;
      }
    }

    setErrorMsg('');
    setIsSubmitting(true);
    let uploadedMediaUrl = '';
    let uploadedAudioUrl = '';

    try {
      // 1. Upload Voice Note if in voice mode
      if (wishMode === 'voice' && audioFile) {
        setStatusStep('Mengunggah pesan suara...');
        const audioFormData = new FormData();
        const ext = audioFile.name ? audioFile.name.split('.').pop() : 'webm';
        audioFormData.append('file', audioFile, `voice-note-${Date.now()}.${ext}`);
        audioFormData.append('slug', slug);

        const audioRes = await fetch('/api/upload-public', {
          method: 'POST',
          body: audioFormData,
        });

        if (!audioRes.ok) {
          throw new Error('Gagal mengunggah pesan suara');
        }

        const audioData = await audioRes.json();
        uploadedAudioUrl = audioData.url || '';
      }

      // 2. Upload photo/video if selected
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

      // 3. Submit wish with token to circle-wishes endpoint
      setStatusStep('Menyimpan pesan ucapan...');
      const finalMediaType =
        wishMode === 'voice'
          ? 'audio'
          : mediaType || (uploadedMediaUrl ? (isVideoMedia(uploadedMediaUrl) ? 'video' : 'photo') : null);

      const wishPayload = {
        token,
        name: cleanName,
        message: cleanMessage,
        photoUrl: uploadedMediaUrl,
        mediaUrl: wishMode === 'voice' ? (uploadedAudioUrl || uploadedMediaUrl) : uploadedMediaUrl,
        mediaType: finalMediaType,
        audioUrl: uploadedAudioUrl || null,
        audioDuration: audioDuration || null,
        createdAt: new Date().toISOString(),
      };

      const wishRes = await fetch(`/api/circle-wishes/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishPayload),
      });

      if (!wishRes.ok) {
        const errJson = await wishRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengirim ucapan');
      }

      const wishData = await wishRes.json();
      setSubmittedWish(wishData.wish || wishPayload);
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
                  ? `Halaman pengisian ucapan untuk ${recipient} bersifat privat. Pastikan kamu membuka tautan khusus yang dibagikan oleh koordinator kado.`
                  : (validationData?.message || 'Tautan undangan ini tidak valid atau sudah kedaluwarsa. Silakan hubungi koordinator kado untuk mendapatkan tautan baru.')}
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
                      disabled={isSubmitting || isRecording}
                    />
                  </div>

                  {/* Wish Format Switcher: Pesan Teks vs Voice Note */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                      Format Ucapan
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/30 border border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          if (isRecording) stopRecording();
                          setWishMode('text');
                          setErrorMsg('');
                        }}
                        disabled={isSubmitting || isRecording}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          wishMode === 'text'
                            ? 'bg-accent text-white shadow-md font-semibold'
                            : 'text-text-muted hover:text-text hover:bg-white/5'
                        }`}
                      >
                        <MessageSquare size={14} />
                        <span>Pesan Teks</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWishMode('voice');
                          setErrorMsg('');
                        }}
                        disabled={isSubmitting || isRecording}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          wishMode === 'voice'
                            ? 'bg-accent text-white shadow-md font-semibold'
                            : 'text-text-muted hover:text-text hover:bg-white/5'
                        }`}
                      >
                        <Mic size={14} />
                        <span>Voice Note (Suara)</span>
                      </button>
                    </div>
                  </div>

                  {/* CONDITIONAL: Text Wish Mode */}
                  {wishMode === 'text' && (
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
                  )}

                  {/* CONDITIONAL: Voice Note Wish Mode */}
                  {wishMode === 'voice' && (
                    <div className="space-y-4">
                      {/* Hidden inputs & audio elements for voice note */}
                      <input
                        type="file"
                        ref={audioFileInputRef}
                        accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg"
                        onChange={handleAudioFileSelect}
                        className="hidden"
                        disabled={isSubmitting || isRecording}
                      />
                      {audioUrl && (
                        <audio
                          ref={audioPreviewElRef}
                          src={audioUrl}
                          onEnded={() => setIsPlayingAudioPreview(false)}
                          onPause={() => setIsPlayingAudioPreview(false)}
                          className="hidden"
                        />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Rekaman Suaramu <span className="text-accent">*</span>
                          </label>
                          <span className="text-[11px] text-text-muted">
                            Maks 30 Detik
                          </span>
                        </div>

                        {/* State A: Idle (Belum merekam & belum ada file) */}
                        {!audioUrl && !isRecording && (
                          <div className="rounded-xl border border-white/15 bg-black/30 p-5 text-center flex flex-col items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={startRecording}
                              disabled={isSubmitting}
                              className="relative w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group"
                              style={{
                                background: 'linear-gradient(135deg, #E11D48, #BE123C)',
                                boxShadow: '0 8px 24px rgba(225,29,72,0.4)',
                              }}
                              title="Mulai Rekam Suara"
                            >
                              <Mic size={26} className="group-hover:scale-110 transition-transform" />
                              <span className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping opacity-30 pointer-events-none" />
                            </button>

                            <div>
                              <div className="text-xs font-semibold text-text">
                                Tekan Tombol untuk Rekam Suara
                              </div>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                Bicara santai & tulus untuk {recipient}. Batas maksimal 30 detik.
                              </p>
                            </div>

                            <div className="pt-2 border-t border-white/10 w-full flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => audioFileInputRef.current?.click()}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent transition-colors cursor-pointer"
                              >
                                <Upload size={12} />
                                <span>Atau unggah file rekaman suara (.mp3 / .m4a / .wav)</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* State B: Active Recording */}
                        {isRecording && (
                          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-semibold tracking-wide uppercase">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                              <span>Sedang Merekam Suara...</span>
                            </div>

                            {/* Animated waveform bars simulation */}
                            <div className="flex items-center justify-center gap-1.5 h-8">
                              {[18, 30, 24, 12, 28, 20, 32, 16, 26, 14, 22].map((h, i) => (
                                <motion.span
                                  key={i}
                                  animate={{
                                    height: [8, h, 8],
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.05,
                                    ease: 'easeInOut',
                                  }}
                                  className="w-1 bg-rose-500 rounded-full"
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>

                            {/* Timer */}
                            <div className="font-mono text-2xl font-bold text-text">
                              {formatAudioTime(recordingSeconds)} <span className="text-xs text-text-muted font-normal">/ 0:30</span>
                            </div>

                            <div className="flex items-center justify-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={stopRecording}
                                className="py-2.5 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
                              >
                                <Check size={14} />
                                <span>Selesai Rekam</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelRecording}
                                className="py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 text-text-muted text-xs font-medium cursor-pointer transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}

                        {/* State C: Preview Player */}
                        {audioUrl && !isRecording && (
                          <div className="rounded-xl border border-white/15 bg-black/30 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={toggleAudioPreviewPlay}
                                  className="w-11 h-11 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                                  title={isPlayingAudioPreview ? 'Jeda' : 'Dengarkan Rekaman'}
                                >
                                  {isPlayingAudioPreview ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                                </button>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-text truncate flex items-center gap-1.5">
                                    <Volume2 size={13} className="text-accent shrink-0" />
                                    <span>Pesan Suara Siap Dikirim</span>
                                  </div>
                                  <div className="text-[11px] text-text-muted mt-0.5">
                                    Durasi: <strong className="text-text">{formatAudioTime(audioDuration)}</strong> · {formatBytes(audioFile?.size)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={handleRemoveAudio}
                                  disabled={isSubmitting}
                                  className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/25 bg-white/5 text-[11px] text-text-muted hover:text-text flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Rekam Ulang"
                                >
                                  <RotateCcw size={11} />
                                  <span>Ulang</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Optional Caption for Voice Note */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Catatan / Teks Pengantar (Opsional)
                          </label>
                          <span className="text-[11px] text-text-muted">
                            {message.length}/300
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={300}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={`Misal: Dengerin yaa ${recipient}! Selamat ulang tahun! 🤍`}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  )}

                  {/* Memory Media (Photo or Short Video) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Foto Kenangan / Video Pendek (Opsional)
                    </label>
                    <p className="text-[11.5px] text-text-muted/70 mb-2.5 leading-relaxed">
                      Bisa foto {recipient || 'si penerima'} saja atau momen kenangan kalian bersama.
                    </p>

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
                            <Camera size={18} />
                          )}
                        </div>
                        <span className="text-xs font-medium text-text">
                          {isProcessingMedia ? 'Memeriksa & memproses media...' : 'Pilih Foto atau Video Pendek'}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Foto otomatis dioptimasi · Video maks 30 dtk &amp; 20 MB
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
                    {submittedWish.photoUrl || (submittedWish.mediaType !== 'audio' && submittedWish.mediaUrl) ? (
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-black/30 relative">
                        {submittedWish.mediaType !== 'audio' && (submittedWish.mediaType === 'video' || isVideoMedia(submittedWish.mediaUrl || submittedWish.photoUrl)) ? (
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
                            src={submittedWish.photoUrl}
                            alt="Memory"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {submittedWish.mediaType === 'audio' && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 border border-white/20 text-[10px] text-white flex items-center gap-1 backdrop-blur-sm">
                            <Mic size={10} className="text-rose-400" />
                            <span>{formatAudioTime(submittedWish.audioDuration)}</span>
                          </div>
                        )}
                      </div>
                    ) : submittedWish.mediaType === 'audio' || submittedWish.audioUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-accent/15 border border-accent/30 flex flex-col items-center justify-center p-3 text-accent gap-1">
                        <Mic size={24} />
                        <span className="text-xs font-medium text-text">Voice Note Terkirim</span>
                        {submittedWish.audioDuration && (
                          <span className="text-[10px] text-text-muted font-mono">{formatAudioTime(submittedWish.audioDuration)}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 text-accent font-serif flex items-center justify-center text-lg mb-3">
                        {submittedWish.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-text text-xs italic line-clamp-4 mb-2">
                      {submittedWish.message ? `“${submittedWish.message}”` : (submittedWish.mediaType === 'audio' ? '🎙️ Pesan suara telah terkirim rapi' : '')}
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
