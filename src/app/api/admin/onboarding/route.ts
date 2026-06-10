import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  normalizeDomain,
  normalizeDomainInput,
  normalizeWebsite,
  parseLines,
  slugifyBusinessSlug,
  slugifySiteId,
} from "@/lib/siteId";
import { maxWidgetSitesForPlan, normalizePlanName } from "@/lib/planLimits";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function detailText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  return [candidate.message, candidate.details, candidate.hint, candidate.code]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500);
}

function fail(request: Request, code: string, error?: unknown) {
  const detail = detailText(error);
  const suffix = detail ? `&detail=${encodeURIComponent(detail)}` : "";
  return NextResponse.redirect(
    new URL(
      `/admin/onboarding?error=${encodeURIComponent(code)}${suffix}`,
      request.url,
    ),
    { status: 303 },
  );
}

function recoverExistingSite(request: Request, siteId: string) {
  return NextResponse.redirect(
    new URL(
      `/admin/onboarding?recovered=1&siteId=${encodeURIComponent(siteId)}`,
      request.url,
    ),
    { status: 303 },
  );
}

async function insertNamedRows(
  supabase: any,
  table: string,
  businessId: string,
  lines: string[],
) {
  if (lines.length === 0) return null;
  const { error } = await supabase
    .from(table)
    .insert(lines.map((name) => ({ business_id: businessId, name })));
  return error;
}

async function makeUniqueBusinessSlug(supabase: any, baseSlug: string) {
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();
  if (!existing?.id) return baseSlug;
  return `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
}

async function saveBusinessSettings(
  supabase: any,
  businessId: string,
  settingsPayload: Record<string, unknown>,
) {
  const { data: existing, error: lookupError } = await supabase
    .from("business_settings")
    .select("id")
    .eq("business_id", businessId)
    .maybeSingle();

  if (lookupError) return lookupError;

  if (existing?.id) {
    const { error } = await supabase
      .from("business_settings")
      .update(settingsPayload)
      .eq("id", existing.id);
    return error;
  }

  const { error } = await supabase
    .from("business_settings")
    .insert(settingsPayload);
  return error;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail(request, "supabase_not_configured");

  const formData = await request.formData();
  const businessName = value(formData, "business_name");
  const siteId = slugifySiteId(value(formData, "site_id"));
  const planName = normalizePlanName(value(formData, "plan_name"));
  const maxWidgetSites = maxWidgetSitesForPlan(planName);
  const now = new Date().toISOString();

  if (!businessName || !siteId) return fail(request, "missing_required");

  const existingSite = await supabase
    .from("widget_sites")
    .select("id, site_id")
    .eq("site_id", siteId)
    .maybeSingle();

  if (existingSite.data?.id) {
    return recoverExistingSite(request, siteId);
  }

  const rawWebsite = value(formData, "website");
  const website = normalizeWebsite(rawWebsite);
  const phone = value(formData, "phone");
  const email = value(formData, "email");
  const primaryMarket = value(formData, "primary_market");
  const description = value(formData, "description");
  const businessType =
    value(formData, "business_type") || "General Service Business";
  const servicesOffered = value(formData, "services_offered");
  const servicesNotOffered = value(formData, "services_not_offered");
  const serviceArea = value(formData, "service_area");
  const targetCustomer = value(formData, "target_customer");
  const customAiInstructions = value(formData, "custom_ai_instructions");
  const importantDisclaimersOrLimits = value(
    formData,
    "important_disclaimers_or_limits",
  );

  let domain = normalizeDomain(value(formData, "domain"));
  if (!domain && rawWebsite) domain = normalizeDomain(rawWebsite);

  let allowedDomains = normalizeDomainInput(value(formData, "allowed_domains"));
  if (!allowedDomains && domain) allowedDomains = domain;

  const businessSlug = await makeUniqueBusinessSlug(
    supabase,
    slugifyBusinessSlug(businessName),
  );

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: businessName,
      slug: businessSlug,
      website,
      phone,
      email,
      primary_market: primaryMarket,
      description,
      plan_name: planName,
      max_widget_sites: maxWidgetSites,
      is_active: true,
      updated_at: now,
    })
    .select("id")
    .single();

  if (businessError || !business?.id)
    return fail(request, "business_create_failed", businessError);

  const businessId = business.id;
  const siteDisplayName =
    value(formData, "site_name") || `${businessName} Widget`;

  const { error: siteError } = await supabase.from("widget_sites").insert({
    business_id: businessId,
    site_id: siteId,
    name: siteDisplayName,
    site_name: siteDisplayName,
    domain,
    allowed_domains: allowedDomains,
    is_active: true,
    updated_at: now,
  });

  if (siteError) return fail(request, "site_create_failed", siteError);

  const settingsPayload = {
    business_id: businessId,
    singleton_key: businessId,
    business_name: businessName,
    website,
    phone,
    email,
    primary_market: primaryMarket,
    business_type: businessType,
    business_description: description,
    description,
    services_offered: servicesOffered,
    services_not_offered: servicesNotOffered,
    service_area: serviceArea,
    target_customer: targetCustomer,
    custom_ai_instructions:
      customAiInstructions ||
      "Answer questions helpfully using the business settings and FAQs. If unsure, do not guess. Invite the visitor to send a service inquiry when appropriate.",
    important_disclaimers_or_limits: importantDisclaimersOrLimits,
    lead_notification_email: value(formData, "lead_notification_email"),
    widget_title:
      value(formData, "widget_title") || "Service Inquiry Assistant",
    widget_subtitle:
      value(formData, "widget_subtitle") ||
      "Answers questions and collects service inquiries",
    widget_bubble_text: "Questions? Chat with us",
    widget_quote_button_text:
      value(formData, "widget_quote_button_text") || "Request Information",
    widget_success_message:
      "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widget_header_color: "#0f172a",
    widget_button_color: "#f5b51b",
    widget_show_call_button: true,
    widget_call_button_text: "Call Now",
    widget_allowed_domains: allowedDomains,
    updated_at: now,
  };

  const settingsError = await saveBusinessSettings(
    supabase,
    businessId,
    settingsPayload,
  );

  if (settingsError)
    return fail(request, "settings_create_failed", settingsError);

  const serviceAreaError = await insertNamedRows(
    supabase,
    "service_areas",
    businessId,
    parseLines(value(formData, "service_areas") || serviceArea),
  );
  if (serviceAreaError)
    return fail(request, "service_areas_create_failed", serviceAreaError);

  const referralAreaError = await insertNamedRows(
    supabase,
    "referral_areas",
    businessId,
    parseLines(value(formData, "referral_areas")),
  );
  if (referralAreaError)
    return fail(request, "referral_areas_create_failed", referralAreaError);

  const willBuy = parseLines(
    value(formData, "will_buy") || servicesOffered,
  ).map((label) => ({ business_id: businessId, type: "will_buy", label }));
  const willNotBuy = parseLines(
    value(formData, "will_not_buy") || servicesNotOffered,
  ).map((label) => ({ business_id: businessId, type: "will_not_buy", label }));

  if (willBuy.length || willNotBuy.length) {
    const { error: criteriaError } = await supabase
      .from("property_buying_criteria")
      .insert([...willBuy, ...willNotBuy]);
    if (criteriaError)
      return fail(request, "criteria_create_failed", criteriaError);
  }

  if (formData.get("create_client_user") === "on") {
    const clientEmail = value(formData, "client_email").toLowerCase();
    const clientPassword = value(formData, "client_password");

    if (!clientEmail || clientPassword.length < 8) {
      return fail(request, "client_login_missing_required");
    }

    const { error: clientError } = await supabase.from("business_users").upsert(
      {
        business_id: businessId,
        email: clientEmail,
        name: value(formData, "client_name") || null,
        role: "owner",
        password_hash: hashClientPassword(clientPassword),
        is_active: true,
        updated_at: now,
      },
      { onConflict: "email" },
    );

    if (clientError)
      return fail(request, "client_user_create_failed", clientError);
  }

  return NextResponse.redirect(
    new URL(
      `/admin/onboarding?saved=1&siteId=${encodeURIComponent(siteId)}`,
      request.url,
    ),
    { status: 303 },
  );
}
