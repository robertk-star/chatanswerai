import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDomain, normalizeDomainInput, slugifySiteId } from "@/lib/siteId";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/admin/sites/${id}?error=1`, request.url), { status: 303 });
  }

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  const siteId = slugifySiteId(value(formData, "site_id"));
  const siteName = value(formData, "site_name") || siteId;
  const domain = normalizeDomain(value(formData, "domain"));
  const allowedDomains = normalizeDomainInput(value(formData, "allowed_domains")) || domain;
  const isActive = formData.get("is_active") === "on";

  if (!businessId || !siteId) {
    return NextResponse.redirect(new URL(`/admin/sites/${id}?error=1`, request.url), { status: 303 });
  }

  const duplicate = await supabase
    .from("widget_sites")
    .select("id")
    .eq("site_id", siteId)
    .neq("id", id)
    .maybeSingle();

  if (duplicate.data?.id) {
    return NextResponse.redirect(new URL(`/admin/sites/${id}?error=1`, request.url), { status: 303 });
  }

  const { error } = await supabase
    .from("widget_sites")
    .update({
      business_id: businessId,
      site_id: siteId,
      name: siteName,
      site_name: siteName,
      domain,
      allowed_domains: allowedDomains,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL(`/admin/sites/${id}?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/admin/sites/${id}?saved=1`, request.url), { status: 303 });
}
