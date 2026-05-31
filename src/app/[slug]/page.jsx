import { getGiftBySlug } from '@/lib/getData';
import { notFound } from 'next/navigation';
import GiftPage from './GiftPage';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) return { title: 'Not Found' };
  return {
    title: `For ${gift.recipient} — A Special Gift`,
    description: gift.gateSubtitle,
  };
}

export default async function SlugPage({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) notFound();
  return <GiftPage data={gift} />;
}
