import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const eventSchema = z.object({
  eventType: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(100).optional(),
  siteId: z.string().max(150).optional().nullable(),
  sourceUrl: z.string().max(2000).optional().nullable(),
  pageUrl: z.string().max(2000).optional().nullable(),
  domain: z.string().max(255).optional().nullable(),
  conversationId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

async function resolveBusinessId(supabase: any, siteId?: string | null) {
  if (!siteId) return null;

  const { data } = await supabase
    .from("widget_sites")
    .select("business_id")
    .eq("site_id", siteId)
    .maybeSingle();

  return data?.business_id || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid widget event" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const data = parsed.data;
  const eventType = data.eventType || data.type || "unknown";
  const siteId = data.siteId || "demo";
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: true }, { headers: corsHeaders() });
  }

  const businessId = await resolveBusinessId(supabase, siteId);

  const { error } = await supabase.from("widget_events").insert({
    event_type: eventType,
    type: eventType,
    site_id: siteId,
    business_id: businessId,
    source_url: data.sourceUrl || data.pageUrl || null,
    page_url: data.pageUrl || data.sourceUrl || null,
    domain: data.domain || null,
    conversation_id: data.conversationId || null,
    lead_id: data.leadId || null,
    metadata: data.metadata || {},
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
