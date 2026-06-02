import { NextResponse } from 'next/server';
import { isR2Configured, uploadFile } from '@/lib/r2';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const slug = formData.get('slug') || 'orders';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size: 10MB max
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `orders/${slug}/${Date.now()}-${filename}`;

    if (isR2Configured()) {
      const result = await uploadFile(key, buffer, file.type);
      return NextResponse.json({ url: result.url, key });
    }

    // Local fallback
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders', slug);
    fs.mkdirSync(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, `${Date.now()}-${filename}`);
    fs.writeFileSync(localPath, buffer);
    const url = `/uploads/orders/${slug}/${path.basename(localPath)}`;
    return NextResponse.json({ url, key: url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
