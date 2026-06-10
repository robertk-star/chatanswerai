import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDomain, normalizeDomainInput } from "@/lib/siteId";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/client/sites/${id}?error=1`, request.url), { status: 303 });
  }

  const formData = await request.formData();
  const siteName = value(formData, "site_name");
  const domain = normalizeDomain(value(formData, "domain"));
  const allowedDomains = normalizeDomainInput(value(formData, "allowed_domains")) || domain;
  const isActive = formData.get("is_active") === "on";

  const { data: existingSite } = await supabase
    .from("widget_sites")
    .select("id, business_id")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!existingSite) {
    return NextResponse.redirect(new URL("/client/sites?error=1", request.url), { status: 303 });
  }

  const { error } = await supabase
    .from("widget_sites")
    .update({
      name: siteName || null,
      site_name: siteName || null,
      domain,
      allowed_domains: allowedDomains,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) {
    return NextResponse.redirect(new URL(`/client/sites/${id}?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/client/sites/${id}?saved=1`, request.url), { status: 303 });
}
