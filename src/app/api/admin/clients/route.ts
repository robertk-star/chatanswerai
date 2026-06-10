import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) { return String(formData.get(key) || "").trim(); }

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");

  if (!businessId || !email || password.length < 8) return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });

  const { error } = await supabase.from("business_users").upsert({
    business_id: businessId,
    email,
    name: value(formData, "name") || null,
    role: "owner",
    password_hash: hashClientPassword(password),
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  }, { onConflict: "email" });

  if (error) return NextResponse.redirect(new URL("/admin/clients?error=1", request.url), { status: 303 });
  return NextResponse.redirect(new URL("/admin/clients?saved=1", request.url), { status: 303 });
}
