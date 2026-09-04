/**
 * Video Validation & Detection Helpers
 * Provides client-side duration extraction and media format detection for Circle Wishes.
 */

/**
 * Check if a URL points to a supported video format (.mp4, .webm, .mov)
 * Strips query parameters and hashes before testing.
 * @param {string} url
 * @returns {boolean}
 */
export function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].split('#')[0].trim();
  return /\.(mp4|webm|mov)$/i.test(clean);
}

/**
 * Inspect video metadata in-browser without uploading to server.
 * Handles WebKit/iOS Infinity/NaN quirks, errors, and sets an 8s timeout safeguard.
 * @param {File} file
 * @param {number} minDuration Minimum duration in seconds (default 1)
 * @param {number} maxDuration Maximum duration in seconds (default 15)
 * @returns {Promise<number>} Returns verified duration in seconds
 */
export function checkVideoMetadata(file, minDuration = 1, maxDuration = 15) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return resolve(minDuration);
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
      video.onloadedmetadata = null;
      video.onerror = null;
      video.ontimeupdate = null;
      video.removeAttribute('src');
      video.load();
    };

    // 8-second safety timeout in case corrupted video or unsupported codec hangs
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Waktu pemeriksaan video habis. Pastikan format video adalah MP4, WebM, atau MOV standar.'));
    }, 8000);

    const validate = (dur) => {
      if (!dur || isNaN(dur) || !isFinite(dur) || dur <= 0) {
        return reject(new Error('Gagal mendeteksi durasi video. Harap periksa format file video kamu.'));
      }
      if (dur < minDuration - 0.2) {
        return reject(new Error(`Durasi video minimal ${minDuration} detik (video kamu: ${dur.toFixed(1)} detik). Harap pilih video yang lebih panjang.`));
      }
      // 0.9s tolerance for GOP/keyframe cut misalignment (e.g. 15.4s camera cut)
      if (dur > maxDuration + 0.9) {
        return reject(new Error(`Durasi video maksimal ${maxDuration} detik (video kamu: ${Math.round(dur)} detik). Harap potong terlebih dahulu.`));
      }
      resolve(dur);
    };

    video.onloadedmetadata = () => {
      const dur = video.duration;

      // iOS Safari / WebKit workaround: duration can initially be Infinity or NaN
      if (dur === Infinity || isNaN(dur)) {
        try {
          video.currentTime = 1e101;
          video.ontimeupdate = function () {
            video.ontimeupdate = null;
            const resolvedDur = video.duration;
            cleanup();
            validate(resolvedDur);
          };
        } catch {
          cleanup();
          validate(dur);
        }
      } else {
        cleanup();
        validate(dur);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Format video tidak dapat diputar di browser ini. Harap gunakan format MP4, WebM, atau MOV standar.'));
    };
  });
}
