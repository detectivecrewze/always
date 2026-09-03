/**
 * Client-Side Canvas Image Compression
 * Downscales high-resolution camera photos (>5MB-10MB) to <1MB
 * to prevent Vercel 4.5MB HTTP 413 Payload Too Large errors
 * and prevent iOS WebKit memory exhaustion.
 */

export async function compressImage(file, options = {}) {
  if (!file) {
    throw new Error('No file provided for compression');
  }

  // If running on server, return file as-is
  if (typeof window === 'undefined') {
    return {
      blob: file,
      file,
      originalSize: file.size || 0,
      compressedSize: file.size || 0,
      compressionRatio: 0,
      width: 0,
      height: 0,
    };
  }

  const originalSize = file.size || 0;
  const originalName = file.name || 'image.jpg';
  // Ensure output file has .jpg extension
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const outFileName = `${baseName}.jpg`;

  // First pass settings
  const maxWidth = options.maxWidth || 1280;
  const maxHeight = options.maxHeight || 1280;
  const quality = options.quality ?? 0.82;

  // Helper to load source into ImageBitmap or Image
  let bitmap = null;
  let img = null;
  let objectUrl = null;
  let sourceWidth = 0;
  let sourceHeight = 0;

  try {
    if (typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        sourceWidth = bitmap.width;
        sourceHeight = bitmap.height;
      } catch (e) {
        bitmap = null; // fallback to Image
      }
    }

    if (!bitmap) {
      objectUrl = URL.createObjectURL(file);
      img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image for compression'));
        image.src = objectUrl;
      });
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
    }

    const source = bitmap || img;

    // Helper to render on canvas and export blob
    const renderToJpeg = (src, maxW, maxH, q) => {
      let targetW = sourceWidth;
      let targetH = sourceHeight;

      if (targetW > maxW || targetH > maxH) {
        const ratio = Math.min(maxW / targetW, maxH / targetH);
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      // Fill background with #FFFFFF to avoid black backgrounds on transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw image
      ctx.drawImage(src, 0, 0, targetW, targetH);

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            // Cleanup canvas memory
            canvas.width = 0;
            canvas.height = 0;
            resolve({ blob, width: targetW, height: targetH });
          },
          'image/jpeg',
          q
        );
      });
    };

    // Pass 1
    let result = await renderToJpeg(source, maxWidth, maxHeight, quality);

    // Pass 2 safety: If output Blob is still > 1MB, run automatic second pass at max 960px, quality 0.65
    const ONE_MB = 1024 * 1024;
    if (result.blob && result.blob.size > ONE_MB) {
      result = await renderToJpeg(source, 960, 960, 0.65);
    }

    const finalBlob = result.blob || file;
    const finalFile = new File([finalBlob], outFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const compressedSize = finalBlob.size || 0;
    const compressionRatio = originalSize > 0
      ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
      : 0;

    return {
      blob: finalBlob,
      file: finalFile,
      originalSize,
      compressedSize,
      compressionRatio,
      width: result.width,
      height: result.height,
    };
  } finally {
    // Resource cleanup
    if (objectUrl) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        // ignore
      }
    }
    if (bitmap) {
      try {
        bitmap.close();
      } catch (e) {
        // ignore
      }
    }
  }
}
