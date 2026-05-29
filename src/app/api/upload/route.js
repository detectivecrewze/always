import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { isR2Configured, uploadFile, getPublicUrl } from '@/lib/r2';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  if (!await verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const slug = formData.get('slug') || 'default';

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${slug}/${Date.now()}-${filename}`;

  if (isR2Configured()) {
    const result = await uploadFile(key, buffer, file.type);
    return NextResponse.json({ url: result.url, key });
  }

  // Local fallback — save to public/uploads/
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', slug);
  fs.mkdirSync(uploadDir, { recursive: true });
  const localPath = path.join(uploadDir, `${Date.now()}-${filename}`);
  fs.writeFileSync(localPath, buffer);
  const url = `/uploads/${slug}/${path.basename(localPath)}`;
  return NextResponse.json({ url, key: url });
}
