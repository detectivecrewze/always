import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getGiftBySlug } from '@/lib/getData';
import { validateSlotToken } from '@/lib/circleSlots';
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

export default async function ContributorPortalPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const token = (resolvedSearchParams?.token || '').trim();
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    notFound();
  }

  // Validate slot token
  let tokenValidation = null;
  if (token) {
    tokenValidation = await validateSlotToken(slug, token);
  } else {
    tokenValidation = {
      valid: false,
      reason: 'missing_parameters',
      message: 'Tautan memerlukan token undangan yang valid.',
    };
  }

  // Privacy Isolation: Extract ONLY public recipient metadata
  const publicData = {
    slug,
    recipient: gift.recipient || 'Teman Kita',
    moment: gift.moment || 'Ulang Tahun',
    theme: gift.theme || 'classic-light',
  };

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d070b', color: '#f5f5f5' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E11D48', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <ContributorForm
        {...publicData}
        initialToken={token}
        initialValidation={tokenValidation}
      />
    </Suspense>
  );
}
