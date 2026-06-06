import { getGiftBySlug } from '@/lib/getData';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);
  if (!gift) return { title: 'Not Found' };
  return { title: `Form for ${slug}` };
}

export default async function FormLayout({ children, params }) {
  const { slug } = await params;
  
  // VALIDATION: Ensure the slug exists as a gift created by Admin
  // If it doesn't exist, we block the page completely (404)
  const giftExists = await getGiftBySlug(slug);
  if (!giftExists) {
    notFound();
  }

  return <>{children}</>;
}
