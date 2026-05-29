const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function getGift(slug) {
  const res = await fetch(`${BASE_URL}/gifts/${slug}`);
  if (!res.ok) throw new Error('Gift not found');
  return res.json();
}

export async function listGifts() {
  const res = await fetch(`${BASE_URL}/gifts`);
  if (!res.ok) throw new Error('Failed to fetch gifts');
  return res.json();
}

export async function createGift(data) {
  const res = await fetch(`${BASE_URL}/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create gift');
  return res.json();
}

export async function updateGift(slug, data) {
  const res = await fetch(`${BASE_URL}/gifts/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update gift');
  return res.json();
}

export async function deleteGift(slug) {
  const res = await fetch(`${BASE_URL}/gifts/${slug}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete gift');
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
}
