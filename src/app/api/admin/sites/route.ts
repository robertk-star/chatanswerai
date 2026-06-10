import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDomain, normalizeDomainInput, slugifySiteId } from "@/lib/siteId";
import { maxWidgetSitesForPlan } from "@/lib/planLimits";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function redirectError(request: Request, code: string) {
  return NextResponse.redirect(new URL(`/admin/sites?error=${encodeURIComponent(code)}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return redirectError(request, "Supabase is not configured.");
  }

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  const siteId = slugifySiteId(value(formData, "site_id"));
  const siteName = value(formData, "site_name") || siteId;
  const domain = normalizeDomain(value(formData, "domain"));
  const allowedDomains = normalizeDomainInput(value(formData, "allowed_domains")) || domain;
  const isActive = formData.get("is_active") === "on";

  if (!businessId || !siteId) {
    return redirectError(request, "missing_required");
  }

  const [{ data: business, error: businessError }, { data: existingSite }, { data: existingSites, error: sitesError }] = await Promise.all([
    supabase.from("businesses").select("id, plan_name, max_widget_sites").eq("id", businessId).maybeSingle(),
    supabase.from("widget_sites").select("id").eq("site_id", siteId).maybeSingle(),
    supabase.from("widget_sites").select("id").eq("business_id", businessId),
  ]);

  if (businessError || !business) {
    return redirectError(request, "Selected business could not be found.");
  }

  if (existingSite) {
    return redirectError(request, "duplicate_site_id");
  }

  if (sitesError) {
    return redirectError(request, sitesError.message);
  }

  const maxSites = business.max_widget_sites || maxWidgetSitesForPlan(business.plan_name);
  if ((existingSites || []).length >= maxSites) {
    return redirectError(request, "site_limit");
  }

  const { error } = await supabase.from("widget_sites").insert({
    business_id: businessId,
    site_id: siteId,
    name: siteName,
    site_name: siteName,
    domain,
    allowed_domains: allowedDomains,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return redirectError(request, error.message);
  }

  return NextResponse.redirect(new URL("/admin/sites?saved=1", request.url), { status: 303 });
}
