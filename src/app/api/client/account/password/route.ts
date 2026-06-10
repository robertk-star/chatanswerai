import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, hashClientPassword, verifyClientPassword, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });

  const formData = await request.formData();
  const currentPassword = String(formData.get("current_password") || "");
  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return NextResponse.redirect(new URL("/client/account?error=1", request.url), { status: 303 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL("/client/account?error=1", request.url), { status: 303 });

  const { data: user } = await supabase.from("business_users").select("password_hash").eq("id", session.userId).eq("business_id", session.businessId).maybeSingle();
  if (!user || !verifyClientPassword(currentPassword, user.password_hash)) return NextResponse.redirect(new URL("/client/account?error=1", request.url), { status: 303 });

  const { error } = await supabase.from("business_users").update({ password_hash: hashClientPassword(newPassword), updated_at: new Date().toISOString() }).eq("id", session.userId);
  if (error) return NextResponse.redirect(new URL("/client/account?error=1", request.url), { status: 303 });
  return NextResponse.redirect(new URL("/client/account?saved=1", request.url), { status: 303 });
}
