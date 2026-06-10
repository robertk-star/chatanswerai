import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function cleanHexColor(value: string, fallback: string) {
  const color = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) return color.toLowerCase();
  return fallback;
}

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function parseLines(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function replaceNamedRows(
  supabase: any,
  table: string,
  businessId: string,
  names: string[],
) {
  await supabase.from(table).delete().eq("business_id", businessId);
  if (names.length)
    await supabase
      .from(table)
      .insert(names.map((name) => ({ business_id: businessId, name })));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token))
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.redirect(
      new URL("/admin/settings?error=1", request.url),
      { status: 303 },
    );

  const formData = await request.formData();
  const businessId = value(formData, "business_id");
  if (!businessId)
    return NextResponse.redirect(
      new URL("/admin/settings?error=1", request.url),
      { status: 303 },
    );

  const businessName = value(formData, "business_name");
  const now = new Date().toISOString();

  await supabase
    .from("businesses")
    .update({
      name: businessName,
      website: value(formData, "website"),
      phone: value(formData, "phone"),
      email: value(formData, "email"),
      primary_market: value(formData, "primary_market"),
      description: value(formData, "description"),
      updated_at: now,
    })
    .eq("id", businessId);

  const { error: settingsError } = await supabase
    .from("business_settings")
    .upsert(
      {
        business_id: businessId,
        business_name: businessName,
        website: value(formData, "website"),
        phone: value(formData, "phone"),
        email: value(formData, "email"),
        primary_market: value(formData, "primary_market"),
        business_type:
          value(formData, "business_type") || "General Service Business",
        business_description: value(formData, "description"),
        description: value(formData, "description"),
        services_offered: value(formData, "services_offered"),
        services_not_offered: value(formData, "services_not_offered"),
        service_area: value(formData, "service_area"),
        target_customer: value(formData, "target_customer"),
        custom_ai_instructions: value(formData, "custom_ai_instructions"),
        important_disclaimers_or_limits: value(
          formData,
          "important_disclaimers_or_limits",
        ),
        widget_title: value(formData, "widget_title"),
        widget_subtitle: value(formData, "widget_subtitle"),
        widget_quote_button_text: value(formData, "widget_quote_button_text"),
        widget_header_color: cleanHexColor(
          value(formData, "widget_header_color"),
          "#0f172a",
        ),
        widget_header_text_color: cleanHexColor(
          value(formData, "widget_header_text_color"),
          "#ffffff",
        ),
        widget_button_color: cleanHexColor(
          value(formData, "widget_button_color"),
          "#f5b51b",
        ),
        widget_button_text_color: cleanHexColor(
          value(formData, "widget_button_text_color"),
          "#0f172a",
        ),
        widget_show_call_button: isChecked(formData, "widget_show_call_button"),
        widget_call_button_text:
          value(formData, "widget_call_button_text") || "Call Now",
        lead_notification_email: value(formData, "lead_notification_email"),
        widget_allowed_domains: value(formData, "widget_allowed_domains"),
        updated_at: now,
      },
      { onConflict: "business_id" },
    );

  if (settingsError)
    return NextResponse.redirect(
      new URL("/admin/settings?error=1", request.url),
      { status: 303 },
    );

  await replaceNamedRows(
    supabase,
    "service_areas",
    businessId,
    parseLines(
      value(formData, "service_areas") || value(formData, "service_area"),
    ),
  );
  await replaceNamedRows(
    supabase,
    "referral_areas",
    businessId,
    parseLines(value(formData, "referral_areas")),
  );

  await supabase
    .from("property_buying_criteria")
    .delete()
    .eq("business_id", businessId);
  const willBuy = parseLines(
    value(formData, "will_buy") || value(formData, "services_offered"),
  ).map((label) => ({ business_id: businessId, type: "will_buy", label }));
  const willNotBuy = parseLines(
    value(formData, "will_not_buy") || value(formData, "services_not_offered"),
  ).map((label) => ({ business_id: businessId, type: "will_not_buy", label }));
  if (willBuy.length || willNotBuy.length)
    await supabase
      .from("property_buying_criteria")
      .insert([...willBuy, ...willNotBuy]);

  const faqIds = formData.getAll("faq_id").map((item) => String(item || ""));
  const faqQuestions = formData
    .getAll("faq_question")
    .map((item) => String(item || "").trim());
  const faqAnswers = formData
    .getAll("faq_answer")
    .map((item) => String(item || "").trim());
  const removeIndexes = new Set(
    formData.getAll("faq_remove").map((item) => Number(item)),
  );

  await supabase
    .from("managed_faq_items")
    .delete()
    .eq("business_id", businessId);

  const faqs = faqQuestions
    .map((question, index) => ({
      question,
      answer: faqAnswers[index] || "",
      removed: removeIndexes.has(index),
    }))
    .filter((faq) => faq.question && faq.answer && !faq.removed);

  const newQuestion = value(formData, "new_faq_question");
  const newAnswer = value(formData, "new_faq_answer");
  if (newQuestion && newAnswer)
    faqs.push({
      question: newQuestion,
      answer: newAnswer,
      removed: false,
    } as any);

  if (faqs.length) {
    await supabase.from("managed_faq_items").insert(
      faqs.map((faq, index) => ({
        business_id: businessId,
        question: faq.question,
        answer: faq.answer,
        is_enabled: true,
        sort_order: index,
      })),
    );
  }

  return NextResponse.redirect(
    new URL("/admin/settings?saved=1", request.url),
    { status: 303 },
  );
}
