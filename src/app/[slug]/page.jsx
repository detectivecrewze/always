import { Suspense } from 'react';
import { getGiftBySlug } from '@/lib/getData';
import { notFound } from 'next/navigation';
import GiftPage from './GiftPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) return { title: 'Not Found' };

  const recipient = gift.recipient ? gift.recipient.trim() : 'You';
  const title = `For ${recipient} — A Special Gift`;
  const description = gift.gateSubtitle || 'Something Special For u';

  const previewImage = gift.photos?.find(p => 
    p && p.url && typeof p.url === 'string' && 
    !p.url.toLowerCase().endsWith('.mp4') && 
    !p.url.toLowerCase().endsWith('.heic')
  )?.url || 'https://for-you-always.my.id/assets/opening_gate.png';

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
          alt: `A special gift for ${recipient}`,
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
