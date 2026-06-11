# Phase 12A - AI Blog Draft Intake API

This phase adds a private API endpoint that allows an AI-generated blog draft to be saved into the SaffHire blog admin review queue.

## Endpoint

POST `/api/admin/blogs/ai-draft`

## Security

The endpoint requires this Vercel environment variable:

```text
BLOG_DRAFT_API_KEY=your-long-random-secret
```

The key can be sent in any of these ways:

```text
Authorization: Bearer your-long-random-secret
x-blog-draft-api-key: your-long-random-secret
x-api-key: your-long-random-secret
```

The JSON body can also include one of these fields, but headers are preferred:

```json
{
  "apiKey": "your-long-random-secret"
}
```

## Required JSON fields

```json
{
  "title": "Blog title",
  "slug": "blog-url-slug",
  "excerpt": "Short blog summary.",
  "content": "Full blog draft content."
}
```

## Optional JSON fields

```json
{
  "category": "Background Screening",
  "author": "SaffHire Compliance Team",
  "image_url": "https://example.com/image.webp",
  "read_time": "8 min read",
  "notes": "AI-generated draft submitted for review."
}
```

The endpoint saves drafts to the `blog_drafts` table with this status:

```text
pending_review
```

The draft will appear in:

```text
/admin/blogs
```

It will not appear publicly until approved and published in the admin dashboard.

## Example request

```bash
curl -X POST "https://www.saffhire.com/api/admin/blogs/ai-draft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-long-random-secret" \
  -d '{
    "title": "Identity Verification Before the Background Check",
    "slug": "identity-verification-before-background-check",
    "excerpt": "Why employers need to confirm who they are screening before relying on a background check.",
    "category": "Hiring Risk",
    "author": "SaffHire Compliance Team",
    "read_time": "8 min read",
    "content": "Full draft content goes here."
  }'
```

## Public publishing behavior

Once a draft is published in `/admin/blogs`, it is included in:

```text
/blog
/blog/[slug]
/sitemap.xml
/rss.xml
/llms.txt
```
