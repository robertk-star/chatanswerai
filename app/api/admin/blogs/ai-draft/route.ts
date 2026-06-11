import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function getApiKey(request: Request, body: Record<string, unknown>) {
  return (
    request.headers.get('x-blog-draft-api-key') ||
    request.headers.get('x-api-key') ||
    getBearerToken(request) ||
    String(body.apiKey || body.secret_key || body.secretKey || '')
  ).trim();
}

function stringField(body: Record<string, unknown>, key: string, fallback = '') {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

export async function POST(request: Request) {
  const configuredKey = process.env.BLOG_DRAFT_API_KEY;
  if (!configuredKey) {
    return NextResponse.json({ error: 'Blog draft intake is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const submittedKey = getApiKey(request, body);
  if (!submittedKey || submittedKey !== configuredKey) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  }

  const title = stringField(body, 'title');
  const content = stringField(body, 'content');
  const excerpt = stringField(body, 'excerpt');
  const slug = cleanSlug(stringField(body, 'slug') || title);

  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: title, slug or title, excerpt, and content are required.' },
      { status: 400 }
    );
  }

  const readTime = stringField(body, 'read_time') || stringField(body, 'readTime') || '8 min read';
  const imageUrl = stringField(body, 'image_url') || stringField(body, 'imageUrl') || null;
  const notes = stringField(body, 'notes') || 'AI-generated draft submitted for review.';

  const row = {
    title,
    slug,
    excerpt,
    content,
    category: stringField(body, 'category', 'Background Screening'),
    author: stringField(body, 'author', 'SaffHire Compliance Team'),
    image_url: imageUrl,
    read_time: readTime,
    notes,
    status: 'pending_review',
    approved_at: null,
    published_at: null,
  };

  const { data, error } = await supabase
    .from('blog_drafts')
    .upsert(row, { onConflict: 'slug' })
    .select('id, slug, title, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Could not save blog draft.' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    draft: data,
    reviewUrl: `${siteUrl}/admin/blogs/${data.id}`,
    message: 'Draft saved for review. It will not publish until approved and published in the admin dashboard.',
  });
}
