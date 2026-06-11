import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function redirectWithMessage(
  request: Request,
  kind: "saved" | "error",
  message?: string,
) {
  const url = new URL("/client/settings", request.url);
  if (kind === "saved")
    url.searchParams.set("saved", message || "Settings saved.");
  else url.searchParams.set("error", message || "Settings could not be saved.");
  return NextResponse.redirect(url, { status: 303 });
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

function cleanDbMessage(message?: string | null) {
  if (!message) return "Database update failed.";
  if (message.includes("multiple (or no) rows returned")) {
    return "More than one settings row exists for this business. This has been handled in the updated save route; reload and try again.";
  }
  if (
    message.includes("business_settings_business_id") ||
    message.includes("ON CONFLICT")
  ) {
    return "The business_settings table is missing the multi-business unique index. Run sql/017_multibusiness_settings_fix.sql.";
  }
  if (message.includes("singleton_key") && message.includes("duplicate")) {
    return "The old singleton settings constraint is still active. Run sql/017_multibusiness_settings_fix.sql.";
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return `Settings table is missing a required column: ${message}`;
  }
  return message;
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
  if (!supabase) {
    return redirectWithMessage(request, "error", "Supabase is not configured.");
  }

  if (!session.businessId) {
    return redirectWithMessage(
      request,
      "error",
      "Your client account is not attached to a business.",
    );
  }

  const formData = await request.formData();
  const businessName = value(formData, "business_name");
  const phone = value(formData, "phone");
  const website = value(formData, "website");
  const primaryMarket = value(formData, "primary_market");
  const businessType =
    value(formData, "business_type") || "General Service Business";
  const businessDescription = value(formData, "description");
  const servicesOffered = value(formData, "services_offered");
  const servicesNotOffered = value(formData, "services_not_offered");
  const serviceArea = value(formData, "service_area");
  const targetCustomer = value(formData, "target_customer");
  const customAiInstructions = value(formData, "custom_ai_instructions");
  const importantDisclaimersOrLimits = value(
    formData,
    "important_disclaimers_or_limits",
  );
  const widgetTitle =
    value(formData, "widget_title") || "Service Inquiry Assistant";
  const widgetSubtitle =
    value(formData, "widget_subtitle") ||
    "Answers questions and collects service inquiries";
  const widgetQuoteButtonText =
    value(formData, "widget_quote_button_text") || "Request Information";
  const widgetCallButtonText =
    value(formData, "widget_call_button_text") || "Call Now";
  const widgetQuickQuestion1 = value(formData, "widget_quick_question_1");
  const widgetQuickQuestion2 = value(formData, "widget_quick_question_2");
  const widgetQuickQuestion3 = value(formData, "widget_quick_question_3");
  const widgetQuickQuestion4 = value(formData, "widget_quick_question_4");
  const widgetShowCallButton = isChecked(formData, "widget_show_call_button");
  const widgetFormShowName = isChecked(formData, "widget_form_show_name");
  const widgetFormShowEmail = isChecked(formData, "widget_form_show_email");
  const widgetFormShowPhone = isChecked(formData, "widget_form_show_phone");
  const widgetFormShowCompany = isChecked(formData, "widget_form_show_company");
  const widgetFormShowServiceNeeded = isChecked(formData, "widget_form_show_service_needed");
  const widgetFormShowPreferredTimeline = isChecked(formData, "widget_form_show_preferred_timeline");
  const widgetFormShowMessage = isChecked(formData, "widget_form_show_message");
  const widgetHeaderColor = cleanHexColor(
    value(formData, "widget_header_color"),
    "#0f172a",
  );
  const widgetHeaderTextColor = cleanHexColor(
    value(formData, "widget_header_text_color"),
    "#ffffff",
  );
  const widgetButtonColor = cleanHexColor(
    value(formData, "widget_button_color"),
    "#f5b51b",
  );
  const widgetButtonTextColor = cleanHexColor(
    value(formData, "widget_button_text_color"),
    "#0f172a",
  );
  const now = new Date().toISOString();

  if (!businessName) {
    return redirectWithMessage(request, "error", "Business name is required.");
  }

  const businessUpdate = await supabase
    .from("businesses")
    .update({
      name: businessName,
      phone,
      website,
      primary_market: primaryMarket,
      description: businessDescription,
      updated_at: now,
    })
    .eq("id", session.businessId);

  if (businessUpdate.error) {
    return redirectWithMessage(
      request,
      "error",
      `Business profile could not be saved: ${cleanDbMessage(businessUpdate.error.message)}`,
    );
  }

  const settingsPayload = {
    business_id: session.businessId,
    business_name: businessName,
    phone,
    website,
    primary_market: primaryMarket,
    business_type: businessType,
    business_description: businessDescription,
    description: businessDescription,
    services_offered: servicesOffered,
    services_not_offered: servicesNotOffered,
    service_area: serviceArea,
    target_customer: targetCustomer,
    custom_ai_instructions: customAiInstructions,
    important_disclaimers_or_limits: importantDisclaimersOrLimits,
    widget_title: widgetTitle,
    widget_subtitle: widgetSubtitle,
    widget_quote_button_text: widgetQuoteButtonText,
    widget_quick_question_1: widgetQuickQuestion1,
    widget_quick_question_2: widgetQuickQuestion2,
    widget_quick_question_3: widgetQuickQuestion3,
    widget_quick_question_4: widgetQuickQuestion4,
    widget_form_show_name: widgetFormShowName,
    widget_form_show_email: widgetFormShowEmail,
    widget_form_show_phone: widgetFormShowPhone,
    widget_form_show_company: widgetFormShowCompany,
    widget_form_show_service_needed: widgetFormShowServiceNeeded,
    widget_form_show_preferred_timeline: widgetFormShowPreferredTimeline,
    widget_form_show_message: widgetFormShowMessage,
    widget_header_color: widgetHeaderColor,
    widget_header_text_color: widgetHeaderTextColor,
    widget_button_color: widgetButtonColor,
    widget_button_text_color: widgetButtonTextColor,
    widget_show_call_button: widgetShowCallButton,
    widget_call_button_text: widgetCallButtonText,
    updated_at: now,
  };

  const existingSettings = await supabase
    .from("business_settings")
    .select("id")
    .eq("business_id", session.businessId)
    .order("updated_at", { ascending: false });

  if (existingSettings.error) {
    return redirectWithMessage(
      request,
      "error",
      `Settings row could not be checked: ${cleanDbMessage(existingSettings.error.message)}`,
    );
  }

  if ((existingSettings.data || []).length > 0) {
    const settingsUpdate = await supabase
      .from("business_settings")
      .update(settingsPayload)
      .eq("business_id", session.businessId);

    if (settingsUpdate.error) {
      return redirectWithMessage(
        request,
        "error",
        `Widget settings could not be saved: ${cleanDbMessage(settingsUpdate.error.message)}`,
      );
    }
  } else {
    const settingsInsert = await supabase.from("business_settings").insert({
      ...settingsPayload,
      singleton_key: session.businessId,
    });

    if (settingsInsert.error) {
      return redirectWithMessage(
        request,
        "error",
        `Widget settings row could not be created: ${cleanDbMessage(settingsInsert.error.message)}`,
      );
    }
  }

  return redirectWithMessage(
    request,
    "saved",
    "Settings saved. The widget may need a hard refresh or updated embed script if the external site was using an old widget.js URL.",
  );
}
