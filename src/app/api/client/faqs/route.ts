import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function redirectWithMessage(request: Request, kind: "saved" | "error", message?: string) {
  const url = new URL("/client/faqs", request.url);
  url.searchParams.set(kind, message || (kind === "saved" ? "FAQ saved." : "FAQ action failed."));
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), {
      status: 303,
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return redirectWithMessage(request, "error", "Supabase is not configured.");

  const formData = await request.formData();
  const action = value(formData, "action");
  const faqId = value(formData, "faq_id");
  const now = new Date().toISOString();

  if (action === "create") {
    const question = value(formData, "question");
    const answer = value(formData, "answer");

    if (!question || !answer) {
      return redirectWithMessage(request, "error", "Question and answer are required.");
    }

    const { count } = await supabase
      .from("managed_faq_items")
      .select("id", { count: "exact", head: true })
      .eq("business_id", session.businessId);

    const { error } = await supabase.from("managed_faq_items").insert({
      business_id: session.businessId,
      question,
      answer,
      is_enabled: true,
      sort_order: count || 0,
      updated_at: now,
    });

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "FAQ added.");
  }

  if (action === "update") {
    const question = value(formData, "question");
    const answer = value(formData, "answer");

    if (!faqId || !question || !answer) {
      return redirectWithMessage(request, "error", "FAQ, question, and answer are required.");
    }

    const { error } = await supabase
      .from("managed_faq_items")
      .update({ question, answer, updated_at: now })
      .eq("id", faqId)
      .eq("business_id", session.businessId);

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "FAQ updated.");
  }

  if (action === "toggle") {
    if (!faqId) return redirectWithMessage(request, "error", "FAQ is required.");
    const enabled = value(formData, "is_enabled") === "true";

    const { error } = await supabase
      .from("managed_faq_items")
      .update({ is_enabled: enabled, updated_at: now })
      .eq("id", faqId)
      .eq("business_id", session.businessId);

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", enabled ? "FAQ enabled." : "FAQ disabled.");
  }

  if (action === "delete") {
    if (!faqId) return redirectWithMessage(request, "error", "FAQ is required.");

    const { error } = await supabase
      .from("managed_faq_items")
      .delete()
      .eq("id", faqId)
      .eq("business_id", session.businessId);

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "FAQ deleted.");
  }

  return redirectWithMessage(request, "error", "Unknown FAQ action.");
}
