import { NextResponse } from "next/server";
import { clientCookieName, createClientSessionToken, verifyClientPassword } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const supabase = getSupabaseAdmin();
  if (!supabase || !email || !password) return NextResponse.redirect(new URL("/client/login?error=1", request.url), { status: 303 });

  const { data: user } = await supabase.from("business_users").select("id, business_id, email, role, password_hash, is_active").eq("email", email).maybeSingle();

  if (!user || !user.is_active || !verifyClientPassword(password, user.password_hash)) {
    return NextResponse.redirect(new URL("/client/login?error=1", request.url), { status: 303 });
  }

  await supabase.from("business_users").update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", user.id);

  const token = createClientSessionToken({ userId: user.id, businessId: user.business_id, email: user.email, role: user.role || "owner" });
  const response = NextResponse.redirect(new URL("/client", request.url), { status: 303 });
  response.cookies.set(clientCookieName(), token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}
