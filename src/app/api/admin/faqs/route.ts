import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function safeRedirectPath(input: string) {
  if (!input || !input.startsWith("/admin/faqs")) return "/admin/faqs";
  if (input.startsWith("//") || input.includes("http://") || input.includes("https://")) return "/admin/faqs";
  return input;
}

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    return redirectTo(request, "/admin/login");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return redirectTo(request, "/admin/faqs?error=1");
  }

  const formData = await request.formData();
  const action = value(formData, "action");
  const businessId = value(formData, "business_id");
  const faqId = value(formData, "faq_id");
  const redirectBase = businessId ? `/admin/faqs?businessId=${encodeURIComponent(businessId)}` : "/admin/faqs";
  const redirectToPath = safeRedirectPath(value(formData, "redirect_to") || redirectBase);

  if (!businessId && action !== "delete") {
    return redirectTo(request, "/admin/faqs?error=missing_business");
  }

  if (action === "create") {
    const question = value(formData, "question");
    const answer = value(formData, "answer");

    if (!question || !answer) {
      return redirectTo(request, `${redirectToPath}&error=missing_fields`);
    }

    const { count } = await supabase
      .from("managed_faq_items")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    const { error } = await supabase.from("managed_faq_items").insert({
      business_id: businessId,
      question,
      answer,
      is_enabled: true,
      sort_order: count || 0,
    });

    if (error) return redirectTo(request, `${redirectToPath}&error=1`);
    return redirectTo(request, `${redirectToPath}&saved=created`);
  }

  if (action === "update") {
    const question = value(formData, "question");
    const answer = value(formData, "answer");

    if (!faqId || !question || !answer) {
      return redirectTo(request, `${redirectToPath}&error=missing_fields`);
    }

    const { error } = await supabase
      .from("managed_faq_items")
      .update({
        question,
        answer,
        updated_at: new Date().toISOString(),
      })
      .eq("id", faqId)
      .eq("business_id", businessId);

    if (error) return redirectTo(request, `${redirectToPath}&error=1`);
    return redirectTo(request, `${redirectToPath}&saved=updated`);
  }

  if (action === "toggle") {
    if (!faqId) return redirectTo(request, `${redirectToPath}&error=missing_faq`);
    const enabled = value(formData, "is_enabled") === "true";

    const { error } = await supabase
      .from("managed_faq_items")
      .update({
        is_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", faqId)
      .eq("business_id", businessId);

    if (error) return redirectTo(request, `${redirectToPath}&error=1`);
    return redirectTo(request, `${redirectToPath}&saved=toggled`);
  }

  if (action === "delete") {
    if (!faqId || !businessId) return redirectTo(request, "/admin/faqs?error=missing_faq");

    const { error } = await supabase
      .from("managed_faq_items")
      .delete()
      .eq("id", faqId)
      .eq("business_id", businessId);

    if (error) return redirectTo(request, `${redirectToPath}&error=1`);
    return redirectTo(request, `${redirectToPath}&saved=deleted`);
  }

  return redirectTo(request, `${redirectToPath}&error=unknown_action`);
}
