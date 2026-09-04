import { redirect } from 'next/navigation';

export default async function ContributeRedirectPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedParams = searchParams ? await searchParams : {};
  const queryStr = new URLSearchParams(resolvedParams).toString();
  redirect(`/c/${slug}${queryStr ? `?${queryStr}` : ''}`);
}
