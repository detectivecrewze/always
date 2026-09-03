import { redirect } from 'next/navigation';

export default async function ContributeRedirectPage({ params }) {
  const { slug } = await params;
  redirect(`/c/${slug}`);
}
