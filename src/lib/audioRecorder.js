/**
 * Utility for recording and validating voice notes in browser
 * Supports iOS Safari (audio/mp4) and Chrome/Firefox/Edge (audio/webm;codecs=opus)
 */

export function getSupportedAudioMimeType() {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }

  const candidates = [
    'audio/webm;codecs=opus', // Modern Chrome, Firefox, Edge desktop & Android
    'audio/mp4',              // Safari on iOS / macOS
    'audio/webm',             // Fallback WebM
    'audio/ogg;codecs=opus',  // Fallback Ogg
    'audio/aac',              // Fallback AAC
  ];

  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // ignore
    }
  }

  return '';
}

export function formatAudioTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const totalSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate an uploaded or recorded audio file duration using HTMLAudioElement
 * @param {File|Blob} file
 * @param {number} maxSeconds
 * @returns {Promise<number>} duration in seconds
 */
export function getAudioDuration(file, maxSeconds = 30) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return resolve(0);
    }

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.remove();
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanup();

      if (!isFinite(dur) || isNaN(dur)) {
        return resolve(0);
      }

      // Allow small tolerance (e.g. 30.8s counts as 30s)
      if (dur > maxSeconds + 0.9) {
        return reject(
          new Error(`Durasi rekaman melebihi batas maksimal ${maxSeconds} detik (durasi kamu: ${dur.toFixed(1)} detik).`)
        );
      }

      resolve(dur);
    };

    audio.onerror = () => {
      cleanup();
      // On some mobile devices loadedmetadata fails for recorded blob, accept if size is reasonable
      resolve(0);
    };

    audio.src = objectUrl;
  });
}
