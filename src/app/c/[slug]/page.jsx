import { notFound } from 'next/navigation';
import { getGiftBySlug } from '@/lib/getData';
import ContributorForm from './ContributorForm';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) {
    return { title: 'Kirim Ucapan | Memoria' };
  }
  const recipient = gift.recipient || 'Sahabat';
  return {
    title: `Kirim Ucapan Spesial untuk ${recipient} | Memoria`,
    description: `Tulis pesan ucapan dan bagikan momen kenangan terindahmu untuk ${recipient}.`,
  };
}

export default async function ContributorPortalPage({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    notFound();
  }

  // Privacy Isolation: Extract ONLY public recipient metadata
  const publicData = {
    slug,
    recipient: gift.recipient || 'Teman Kita',
    moment: gift.moment || 'Ulang Tahun',
    theme: gift.theme || 'classic-light',
  };

  return <ContributorForm {...publicData} />;
}
