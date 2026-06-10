import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getDefaultFaqItems } from "@/lib/defaultFaqKnowledge";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function safeRedirectPath(input: string) {
  if (!input || !input.startsWith("/admin/")) return "/admin/settings?faqsImported=1";
  if (input.startsWith("//") || input.includes("http://") || input.includes("https://")) return "/admin/settings?faqsImported=1";
  return input;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/settings?error=1", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  const redirectTo = safeRedirectPath(value(formData, "redirect_to"));

  if (!businessId) {
    return NextResponse.redirect(new URL("/admin/settings?error=1", request.url), { status: 303 });
  }

  const faqItems = getDefaultFaqItems();

  await supabase.from("managed_faq_items").delete().eq("business_id", businessId);

  const { error } = await supabase.from("managed_faq_items").insert(
    faqItems.map((faq, index) => ({
      business_id: businessId,
      question: faq.question,
      answer: faq.answer,
      is_enabled: true,
      sort_order: index,
    }))
  );

  if (error) {
    return NextResponse.redirect(new URL("/admin/settings?error=1", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}
