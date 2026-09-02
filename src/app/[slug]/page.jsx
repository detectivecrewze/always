import { Suspense } from 'react';
import { getGiftBySlug } from '@/lib/getData';
import { notFound } from 'next/navigation';
import GiftPage from './GiftPage';
import playlistData from '@/app/studio/playlist.json';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) return { title: 'Not Found' };

  const recipient = gift.recipient ? gift.recipient.trim() : 'You';
  const title = `For ${recipient} — A Special Gift`;
  const description = gift.gateSubtitle || 'Something Special For u';

  // Take preview image from music gallery (playlist) — never use customer's personal photos
  let previewImage = '';

  // 1. Try matching song from playlist by title
  const songTitle = (gift.music?.title || gift.musicTitle || '').toLowerCase().trim();
  if (songTitle) {
    const matched = playlistData.find(s => 
      s.title && (
        s.title.toLowerCase() === songTitle ||
        songTitle.includes(s.title.toLowerCase()) ||
        s.title.toLowerCase().includes(songTitle)
      )
    );
    if (matched?.coverUrl) {
      previewImage = matched.coverUrl;
    }
  }

  // 2. If gift.music has a cover from music gallery
  if (!previewImage && gift.music?.cover && typeof gift.music.cover === 'string' && gift.music.cover.includes('arcade-edition.aldoramadhan16.workers.dev')) {
    previewImage = gift.music.cover;
  }

  // 3. Fallback: default album cover from music gallery
  if (!previewImage) {
    const defaultSong = playlistData.find(s => s.title?.toLowerCase() === 'semua aku dirayakan') || playlistData[0];
    previewImage = defaultSong?.coverUrl || 'https://arcade-edition.aldoramadhan16.workers.dev/files/1774553222239-jk1brr.jpg';
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://anniv.for-you-always.my.id/${slug}`,
      siteName: 'For you, Always.',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: `For ${recipient} — A Special Gift`,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage],
    },
  };
}

export default async function SlugPage({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) notFound();
  return (
    <Suspense>
      <GiftPage data={gift} />
    </Suspense>
  );
}
