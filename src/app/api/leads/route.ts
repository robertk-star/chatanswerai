import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildLeadWebhookPayload,
  recordLeadWebhookResult,
  sendLeadWebhookForBusiness,
} from "@/lib/leadWebhook";
import { sendLeadEmailNotification } from "@/lib/leadEmailNotification";

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

const leadSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  siteId: z.string().optional(),
  businessId: z.string().uuid().nullable().optional(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  company: z.string().optional().nullable(),
  serviceNeeded: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  preferredTimeline: z.string().optional().nullable(),
  propertyAddress: z.string().optional().nullable(),
  propertyCity: z.string().optional().nullable(),
  situation: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  propertyCondition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  customFields: z.record(z.any()).optional().nullable(),
});

async function resolveConversationId(
  supabase: any,
  conversationId?: string | null,
) {
  if (!conversationId) return null;

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  return data?.id || null;
}

async function resolveBusinessId(
  supabase: any,
  siteId?: string | null,
  businessId?: string | null,
) {
  if (businessId) return businessId;
  if (!siteId) return null;

  const { data } = await supabase
    .from("widget_sites")
    .select("business_id")
    .eq("site_id", siteId)
    .maybeSingle();

  return data?.business_id || null;
}

function hasCustomFieldValue(customFields?: Record<string, any> | null) {
  if (!customFields) return false;
  return Object.values(customFields).some((value) => String(value || "").trim());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid lead request" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const data = parsed.data;
  const customFields = data.customFields || {};

  const hasUsefulLeadInfo = Boolean(
    data.name ||
      data.phone ||
      data.email ||
      data.company ||
      data.serviceNeeded ||
      data.message ||
      data.propertyAddress ||
      data.propertyCity ||
      data.situation ||
      data.notes ||
      hasCustomFieldValue(customFields),
  );

  if (!hasUsefulLeadInfo) {
    return NextResponse.json(
      { error: "At least one lead field is required" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500, headers: corsHeaders() },
    );
  }

  const [resolvedBusinessId, resolvedConversationId] = await Promise.all([
    resolveBusinessId(supabase, data.siteId, data.businessId),
    resolveConversationId(supabase, data.conversationId),
  ]);

  const insertPayload = {
    conversation_id: resolvedConversationId,
    business_id: resolvedBusinessId,
    site_id: data.siteId || null,
    status: "new",
    name: data.name || customFields.name || "Not provided",
    phone: data.phone || customFields.phone || "Not provided",
    email: data.email || customFields.email || null,
    company: data.company || customFields.company || null,
    service_needed: data.serviceNeeded || customFields.service_needed || customFields.serviceNeeded || data.situation || null,
    message: data.message || customFields.message || data.notes || null,
    preferred_timeline: data.preferredTimeline || customFields.preferred_timeline || customFields.preferredTimeline || data.timeline || null,
    property_address: data.propertyAddress || customFields.street_address || customFields.property_address || null,
    property_city: data.propertyCity || customFields.city || customFields.property_city || null,
    situation: data.situation || data.serviceNeeded || customFields.service_needed || customFields.serviceNeeded || null,
    timeline: data.timeline || data.preferredTimeline || customFields.preferred_timeline || customFields.preferredTimeline || null,
    property_condition: data.propertyCondition || customFields.property_condition || null,
    notes: data.notes || data.message || customFields.message || null,
    custom_fields: customFields,
    source_url: data.sourceUrl || null,
  };

  const { data: lead, error } = await supabase
    .from("seller_leads")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !lead) {
    return NextResponse.json(
      { error: error?.message || "Lead could not be saved" },
      { status: 500, headers: corsHeaders() },
    );
  }

  try {
    const emailResult = await sendLeadEmailNotification({ supabase, lead });
    if (!emailResult.sent && !emailResult.skipped) {
      console.error("Lead email notification failed", emailResult.error);
    }
  } catch (emailError) {
    console.error(
      "Lead email notification failed",
      emailError instanceof Error ? emailError.message : emailError,
    );
  }

  try {
    const payload = buildLeadWebhookPayload(lead, "seller_lead.created");
    const webhookResult = await sendLeadWebhookForBusiness({
      businessId: lead.business_id,
      payload,
    });

    if (!webhookResult.skipped) {
      await recordLeadWebhookResult(lead.id, {
        sent: webhookResult.sent,
        error: webhookResult.error,
      });
    }
  } catch (webhookError) {
    await recordLeadWebhookResult(lead.id, {
      sent: false,
      error:
        webhookError instanceof Error
          ? webhookError.message
          : "Unknown webhook error",
    });
  }

  return NextResponse.json(
    { ok: true, leadId: lead.id },
    { headers: corsHeaders() },
  );
}
