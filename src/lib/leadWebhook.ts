import { createHmac } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type LeadWebhookPayload = {
  event: "lead.created" | "lead.test" | "seller_lead.created" | "seller_lead.test";
  sentAt: string;
  businessId: string | null;
  siteId: string | null;
  lead: {
    id?: string;
    createdAt?: string;
    status?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    company?: string | null;
    serviceNeeded?: string | null;
    message?: string | null;
    preferredTimeline?: string | null;
    propertyAddress?: string | null;
    propertyCity?: string | null;
    situation?: string | null;
    timeline?: string | null;
    propertyCondition?: string | null;
    notes?: string | null;
    sourceUrl?: string | null;
  };
};

type WebhookSettings = {
  webhook_enabled?: boolean | null;
  webhook_url?: string | null;
  webhook_secret?: string | null;
};

function signPayload(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function normalizeWebhookUrl(url?: string | null) {
  const trimmed = String(url || "").trim();

  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function getBusinessWebhookSettings(businessId?: string | null): Promise<WebhookSettings | null> {
  if (!businessId) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("business_settings")
    .select("webhook_enabled, webhook_url, webhook_secret")
    .eq("business_id", businessId)
    .maybeSingle();

  return data || null;
}

export function buildLeadWebhookPayload(
  lead: any,
  event: LeadWebhookPayload["event"] = "lead.created"
): LeadWebhookPayload {
  return {
    event,
    sentAt: new Date().toISOString(),
    businessId: lead.business_id || null,
    siteId: lead.site_id || null,
    lead: {
      id: lead.id,
      createdAt: lead.created_at,
      status: lead.status || "new",
      name: lead.name || null,
      phone: lead.phone || null,
      email: lead.email || null,
      company: lead.company || null,
      serviceNeeded: lead.service_needed || lead.situation || null,
      message: lead.message || lead.notes || null,
      preferredTimeline: lead.preferred_timeline || lead.timeline || null,
      propertyAddress: lead.property_address || null,
      propertyCity: lead.property_city || null,
      situation: lead.situation || null,
      timeline: lead.timeline || null,
      propertyCondition: lead.property_condition || null,
      notes: lead.notes || null,
      sourceUrl: lead.source_url || null,
    },
  };
}

export async function sendLeadWebhookForBusiness({
  businessId,
  payload,
}: {
  businessId?: string | null;
  payload: LeadWebhookPayload;
}) {
  const settings = await getBusinessWebhookSettings(businessId);

  if (!settings?.webhook_enabled) {
    return { skipped: true, sent: false, error: null, reason: "Webhook disabled" };
  }

  const webhookUrl = normalizeWebhookUrl(settings.webhook_url);

  if (!webhookUrl) {
    return {
      skipped: true,
      sent: false,
      error: "Webhook URL is missing or invalid",
      reason: "Invalid URL",
    };
  }

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "ChatAnswerAI-Webhook/1.0",
  };

  if (settings.webhook_secret) {
    const signature = signPayload(body, settings.webhook_secret);
    headers["X-ChatAnswerAI-Signature"] = signature;
    // Keep the legacy signature header during the CashOfferChat-to-ChatAnswerAI transition.
    headers["X-CashOfferChat-Signature"] = signature;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        skipped: false,
        sent: false,
        error: `Webhook failed with ${response.status}: ${text.slice(0, 300)}`,
        reason: "HTTP error",
      };
    }

    return { skipped: false, sent: true, error: null, reason: "Delivered" };
  } catch (error) {
    return {
      skipped: false,
      sent: false,
      error: error instanceof Error ? error.message : "Unknown webhook error",
      reason: "Request error",
    };
  }
}

export async function recordLeadWebhookResult(
  leadId: string,
  result: { sent: boolean; error: string | null }
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from("seller_leads")
    .update({
      webhook_sent_at: result.sent ? new Date().toISOString() : null,
      webhook_error: result.error,
    })
    .eq("id", leadId);
}
