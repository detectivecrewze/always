import { NextResponse } from 'next/server';
import { getDraft, putDraft, deleteDraft } from '@/lib/kv';

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const data = await getDraft(params.slug);
    if (!data) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PUT(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const body = await request.json();
    body.updatedAt = new Date().toISOString(); // Inject timestamp
    await putDraft(params.slug, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

export async function DELETE(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    await deleteDraft(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
