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

function isMissingCustomFieldsColumn(error: any) {
  const message = String(error?.message || "");
  return message.includes("custom_fields") && message.includes("column");
}

async function insertLeadWithFallback(supabase: any, payload: Record<string, any>) {
  const firstTry = await supabase
    .from("seller_leads")
    .insert(payload)
    .select("*")
    .single();

  if (!firstTry.error || !isMissingCustomFieldsColumn(firstTry.error)) return firstTry;

  const { custom_fields, ...safePayload } = payload;
  return supabase.from("seller_leads").insert(safePayload).select("*").single();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: parsed.error.errors[0]?.message || "Invalid lead request" },
        400,
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
      return jsonResponse({ error: "At least one lead field is required" }, 400);
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return jsonResponse({ error: "Supabase is not configured" }, 500);
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
      service_needed:
        data.serviceNeeded ||
        customFields.service_needed ||
        customFields.serviceNeeded ||
        data.situation ||
        null,
      message: data.message || customFields.message || data.notes || null,
      preferred_timeline:
        data.preferredTimeline ||
        customFields.preferred_timeline ||
        customFields.preferredTimeline ||
        data.timeline ||
        null,
      property_address:
        data.propertyAddress ||
        customFields.street_address ||
        customFields.property_address ||
        null,
      property_city: data.propertyCity || customFields.city || customFields.property_city || null,
      situation:
        data.situation ||
        data.serviceNeeded ||
        customFields.service_needed ||
        customFields.serviceNeeded ||
        null,
      timeline:
        data.timeline ||
        data.preferredTimeline ||
        customFields.preferred_timeline ||
        customFields.preferredTimeline ||
        null,
      property_condition: data.propertyCondition || customFields.property_condition || null,
      notes: data.notes || data.message || customFields.message || null,
      custom_fields: customFields,
      source_url: data.sourceUrl || null,
    };

    const { data: lead, error } = await insertLeadWithFallback(supabase, insertPayload);

    if (error || !lead) {
      return jsonResponse({ error: error?.message || "Lead could not be saved" }, 500);
    }

    let emailNotification: Record<string, unknown> = {
      skipped: true,
      sent: false,
      reason: "Email notification not attempted.",
    };

    try {
      const emailResult = await sendLeadEmailNotification({ supabase, lead });
      emailNotification = {
        skipped: emailResult.skipped,
        sent: emailResult.sent,
        recipients: emailResult.recipients,
        error: emailResult.error || null,
      };

      if (emailResult.sent) {
        console.log("Lead email notification sent", {
          leadId: lead.id,
          recipients: emailResult.recipients,
        });
      } else {
        console.warn("Lead email notification not sent", {
          leadId: lead.id,
          skipped: emailResult.skipped,
          recipients: emailResult.recipients,
          error: emailResult.error,
        });
      }
    } catch (emailError) {
      const errorMessage =
        emailError instanceof Error ? emailError.message : "Unknown email notification error";
      emailNotification = {
        skipped: false,
        sent: false,
        recipients: [],
        error: errorMessage,
      };
      console.error("Lead email notification failed", errorMessage);
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
      try {
        await recordLeadWebhookResult(lead.id, {
          sent: false,
          error:
            webhookError instanceof Error
              ? webhookError.message
              : "Unknown webhook error",
        });
      } catch (_) {}
    }

    return jsonResponse({ ok: true, leadId: lead.id, emailNotification });
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Lead could not be submitted due to a server error.",
      },
      500,
    );
  }
}
