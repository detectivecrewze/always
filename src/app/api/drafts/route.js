import { NextResponse } from 'next/server';
import { listDrafts, getDraft } from '@/lib/kv';

export async function GET() {
  try {
    const slugs = await listDrafts();
    
    // Fetch all draft data in parallel
    const drafts = await Promise.all(
      slugs.map(async (slug) => {
        const data = await getDraft(slug);
        return { slug, ...data };
      })
    );
    
    // Sort by updated time descending
    const sorted = drafts.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('List drafts error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}
