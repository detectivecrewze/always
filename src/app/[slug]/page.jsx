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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://anniv.for-you-always.my.id/${slug}`,
      siteName: 'For you, Always.',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
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
