import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { maxWidgetSitesForPlan, normalizePlanName } from "@/lib/planLimits";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL(`/admin/businesses/${id}?error=1`, request.url), { status: 303 });

  const formData = await request.formData();
  const name = value(formData, "name");
  const planName = normalizePlanName(value(formData, "plan_name"));
  const maxWidgetSites = maxWidgetSitesForPlan(planName);

  if (!name) return NextResponse.redirect(new URL(`/admin/businesses/${id}?error=1`, request.url), { status: 303 });

  const { error } = await supabase.from("businesses").update({
    name,
    website: value(formData, "website"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    primary_market: value(formData, "primary_market"),
    description: value(formData, "description"),
    plan_name: planName,
    max_widget_sites: maxWidgetSites,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return NextResponse.redirect(new URL(`/admin/businesses/${id}?error=1`, request.url), { status: 303 });
  return NextResponse.redirect(new URL(`/admin/businesses/${id}?saved=1`, request.url), { status: 303 });
}
