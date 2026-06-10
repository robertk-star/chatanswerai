import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const allowedRoles = new Set(["owner", "manager", "staff"]);

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function redirectBack(request: Request, id: string, params: Record<string, string>) {
  const url = new URL(`/admin/clients/${id}`, request.url);
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
  return NextResponse.redirect(url, { status: 303 });
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
    return redirectBack(request, id, { error: "supabase" });
  }

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  const email = value(formData, "email").toLowerCase();
  const role = value(formData, "role") || "owner";
  const password = value(formData, "password");

  if (!businessId) {
    return redirectBack(request, id, { error: "business_required" });
  }

  if (!email) {
    return redirectBack(request, id, { error: "email_required" });
  }

  if (!allowedRoles.has(role)) {
    return redirectBack(request, id, { error: "role_invalid" });
  }

  const updatePayload: Record<string, unknown> = {
    business_id: businessId,
    email,
    name: value(formData, "name") || null,
    role,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };

  if (password.length > 0) {
    if (password.length < 8) {
      return redirectBack(request, id, { error: "password_short" });
    }
    updatePayload.password_hash = hashClientPassword(password);
  }

  const { error } = await supabase.from("business_users").update(updatePayload).eq("id", id);

  if (error) {
    const message = encodeURIComponent(error.message || "Database update failed").slice(0, 180);
    return redirectBack(request, id, { error: "database", message });
  }

  return redirectBack(request, id, { saved: password.length > 0 ? "password" : "profile" });
}
