import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'missing slug' }, { status: 400 });
    }

    const dir = path.join(process.cwd(), 'public', 'projects', slug);

    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return NextResponse.json({ screenshots: [] });
    }

    const files = fs.readdirSync(dir);
    const images = files
      .filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => `/projects/${slug}/${f}`);

    return NextResponse.json({ screenshots: images });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'unknown' }, { status: 500 });
  }
}
