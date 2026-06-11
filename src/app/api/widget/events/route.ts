import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Origin",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  };
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders() });
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

async function insertEventWithFallback(
  supabase: any,
  payload: Record<string, unknown>,
) {
  const firstTry = await supabase.from("widget_events").insert(payload);
  if (!firstTry.error) return firstTry;

  const message = String(firstTry.error.message || "");
  const safePayload = { ...payload } as Record<string, unknown>;

  if (message.includes("column") && message.includes("type")) {
    delete safePayload.type;
  }
  if (message.includes("column") && message.includes("metadata")) {
    delete safePayload.metadata;
  }
  if (message.includes("column") && message.includes("lead_id")) {
    delete safePayload.lead_id;
  }
  if (message.includes("column") && message.includes("conversation_id")) {
    delete safePayload.conversation_id;
  }

  if (Object.keys(safePayload).length === Object.keys(payload).length) {
    return firstTry;
  }

  return supabase.from("widget_events").insert(safePayload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { ok: true, skipped: true, warning: parsed.error.errors[0]?.message || "Invalid widget event" },
        200,
      );
    }

    const data = parsed.data;
    const eventType = data.eventType || data.type || "unknown";
    const siteId = data.siteId || "demo";
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return jsonResponse({ ok: true, skipped: true });
    }

    const businessId = await resolveBusinessId(supabase, siteId);

    const { error } = await insertEventWithFallback(supabase, {
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
      console.error("Widget event could not be saved", error.message);
      return jsonResponse({ ok: true, skipped: true, warning: error.message });
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: true, skipped: true });
  }
}
