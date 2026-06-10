import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDefaultFaqItems } from "@/lib/defaultFaqKnowledge";

export const dynamic = "force-dynamic";

type ChatRequest = {
  siteId?: string;
  conversationId?: string | null;
  message?: string;
  sourceUrl?: string | null;
};

type BusinessContext = {
  businessId: string | null;
  siteId: string | null;
  businessName: string;
  phone: string;
  primaryMarket: string;
  businessType: string;
  businessDescription: string;
  servicesOffered: string;
  servicesNotOffered: string;
  serviceArea: string;
  targetCustomer: string;
  customAiInstructions: string;
  importantDisclaimersOrLimits: string;
  serviceAreas: string[];
  referralAreas: string[];
  managedFaqs: Array<{
    question: string;
    answer: string;
    is_enabled?: boolean | null;
  }>;
  customFaqs: Array<{
    question_trigger: string;
    answer: string;
    is_enabled?: boolean | null;
  }>;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((token) => token.length > 2),
  );
}

function keywordScore(message: string, keywords: string[]) {
  const normalizedMessage = normalize(message);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;

    if (normalizedMessage.includes(normalizedKeyword)) {
      score += normalizedKeyword.split(" ").length >= 2 ? 4 : 2;
    }
  }

  return score;
}

function questionSimilarityScore(message: string, question: string) {
  const messageTokens = tokenize(message);
  const questionTokens = tokenize(question);
  let overlap = 0;

  for (const token of questionTokens) {
    if (messageTokens.has(token)) overlap += 1;
  }

  return overlap;
}

function softCta(context?: BusinessContext) {
  const businessType = normalize(context?.businessType || "");
  if (businessType.includes("home buyer")) {
    return " If you want the team to review your property, use the request button and enter the property details.";
  }
  return " If you want help from the team, use the request button and send your service inquiry.";
}

function shouldAddCta(answer: string) {
  const normalized = normalize(answer);
  return (
    !normalized.includes("request button") &&
    !normalized.includes("service inquiry") &&
    !normalized.includes("contact form") &&
    !normalized.includes("lead form")
  );
}

function withCta(answer: string, context?: BusinessContext) {
  return shouldAddCta(answer) ? `${answer}${softCta(context)}` : answer;
}

function answerFromFaqList(
  message: string,
  faqs: Array<{
    question: string;
    answer: string;
    keywords?: string[];
    is_enabled?: boolean | null;
  }>,
  context?: BusinessContext,
) {
  let best: { answer: string; score: number } | null = null;

  for (const faq of faqs) {
    if (faq.is_enabled === false) continue;

    const score =
      questionSimilarityScore(message, faq.question) +
      keywordScore(message, faq.keywords || []) +
      keywordScore(message, [faq.question]);

    if (score > (best?.score || 0)) {
      best = { answer: faq.answer, score };
    }
  }

  if (!best || best.score < 2) return null;
  return withCta(best.answer, context);
}

function answerFromCustomFaqs(
  message: string,
  faqs: Array<{
    question_trigger: string;
    answer: string;
    is_enabled?: boolean | null;
  }>,
  context?: BusinessContext,
) {
  let best: { answer: string; score: number } | null = null;

  for (const faq of faqs) {
    if (faq.is_enabled === false) continue;

    const score =
      questionSimilarityScore(message, faq.question_trigger) +
      keywordScore(message, [faq.question_trigger]);

    if (score > (best?.score || 0)) {
      best = { answer: faq.answer, score };
    }
  }

  if (!best || best.score < 2) return null;
  return withCta(best.answer, context);
}

function splitKnowledgeLines(value: string) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function answerFromBusinessRules(message: string, context: BusinessContext) {
  const normalized = normalize(message);
  const servicesOffered = splitKnowledgeLines(context.servicesOffered);
  const servicesNotOffered = splitKnowledgeLines(context.servicesNotOffered);
  const serviceAreas = splitKnowledgeLines(context.serviceArea).length
    ? splitKnowledgeLines(context.serviceArea)
    : context.serviceAreas;

  if (
    (normalized.includes("where") ||
      normalized.includes("area") ||
      normalized.includes("city") ||
      normalized.includes("serve") ||
      normalized.includes("service area")) &&
    serviceAreas.length
  ) {
    return withCta(
      `The service area currently listed is ${serviceAreas.slice(0, 12).join(", ")}. If you are nearby or not sure, you can still send an inquiry and the team can confirm.`,
      context,
    );
  }

  for (const area of serviceAreas) {
    if (normalize(area) && normalized.includes(normalize(area))) {
      return withCta(
        `Yes, ${area} is listed in this business's service area.`,
        context,
      );
    }
  }

  if (
    (normalized.includes("what") ||
      normalized.includes("services") ||
      normalized.includes("offer") ||
      normalized.includes("do you")) &&
    servicesOffered.length
  ) {
    return withCta(
      `This business lists these services: ${servicesOffered.slice(0, 12).join(", ")}.`,
      context,
    );
  }

  for (const service of servicesOffered) {
    if (normalize(service) && normalized.includes(normalize(service))) {
      return withCta(
        `Yes, ${service} is listed as a service this business offers.`,
        context,
      );
    }
  }

  for (const service of servicesNotOffered) {
    if (normalize(service) && normalized.includes(normalize(service))) {
      return withCta(
        `${service} is listed as a service this business does not offer. The team can still answer general questions or point you to the right next step if appropriate.`,
        context,
      );
    }
  }

  if (
    (normalized.includes("who") ||
      normalized.includes("customer") ||
      normalized.includes("client")) &&
    context.targetCustomer
  ) {
    return withCta(
      `This business is mainly set up to help: ${context.targetCustomer}.`,
      context,
    );
  }

  if (
    (normalized.includes("disclaimer") ||
      normalized.includes("legal advice") ||
      normalized.includes("limit")) &&
    context.importantDisclaimersOrLimits
  ) {
    return context.importantDisclaimersOrLimits;
  }

  return null;
}

function safeFallback(message: string, context: BusinessContext) {
  const normalized = normalize(message);
  const businessType = context.businessType || "General Service Business";

  if (
    normalized.includes("price") ||
    normalized.includes("quote") ||
    normalized.includes("estimate") ||
    normalized.includes("consultation") ||
    normalized.includes("review")
  ) {
    return withCta(
      `I can help collect your service request so ${context.businessName || "the team"} can review it and follow up.`,
      context,
    );
  }

  const description = context.businessDescription
    ? ` ${context.businessDescription}`
    : "";
  return `I can help answer questions about ${context.businessName || "this business"}, a ${businessType}.${description} If I do not have enough information from the business settings or FAQs, I will not guess. Please send a service inquiry and the team can follow up.`;
}

async function resolveBusinessContext(
  siteId?: string | null,
): Promise<BusinessContext> {
  const supabase = getSupabaseAdmin();

  const fallback: BusinessContext = {
    businessId: null,
    siteId: siteId || null,
    businessName: "CashOfferChat",
    phone: "",
    primaryMarket: "",
    businessType: "General Service Business",
    businessDescription: "",
    servicesOffered: "",
    servicesNotOffered: "",
    serviceArea: "",
    targetCustomer: "",
    customAiInstructions: "",
    importantDisclaimersOrLimits: "",
    serviceAreas: [],
    referralAreas: [],
    managedFaqs: [],
    customFaqs: [],
  };

  if (!supabase) return fallback;

  let businessId: string | null = null;

  if (siteId) {
    const { data: site } = await supabase
      .from("widget_sites")
      .select("business_id, site_id")
      .eq("site_id", siteId)
      .maybeSingle();

    businessId = site?.business_id || null;
  }

  if (!businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    businessId = business?.id || null;
  }

  if (!businessId) return fallback;

  const [
    businessResult,
    settingsResult,
    serviceResult,
    referralResult,
    criteriaResult,
    managedFaqResult,
    customFaqResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, phone, primary_market")
      .eq("id", businessId)
      .maybeSingle(),
    supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase
      .from("service_areas")
      .select("name")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
    supabase
      .from("referral_areas")
      .select("name")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
    supabase
      .from("property_buying_criteria")
      .select("type, label")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
    supabase
      .from("managed_faq_items")
      .select("question, answer, is_enabled")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("custom_qa_items")
      .select("question_trigger, answer, is_enabled")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true }),
  ]);

  const criteria = criteriaResult.data || [];

  return {
    businessId,
    siteId: siteId || null,
    businessName:
      settingsResult.data?.business_name ||
      businessResult.data?.name ||
      fallback.businessName,
    phone: settingsResult.data?.phone || businessResult.data?.phone || "",
    primaryMarket:
      settingsResult.data?.primary_market ||
      businessResult.data?.primary_market ||
      "",
    serviceAreas: (serviceResult.data || [])
      .map((row: any) => row.name)
      .filter(Boolean),
    referralAreas: (referralResult.data || [])
      .map((row: any) => row.name)
      .filter(Boolean),
    businessType:
      settingsResult.data?.business_type || "General Service Business",
    businessDescription:
      settingsResult.data?.business_description ||
      settingsResult.data?.description ||
      "",
    servicesOffered:
      settingsResult.data?.services_offered ||
      criteria
        .filter((row: any) => row.type === "will_buy")
        .map((row: any) => row.label)
        .filter(Boolean)
        .join("\n"),
    servicesNotOffered:
      settingsResult.data?.services_not_offered ||
      criteria
        .filter((row: any) => row.type === "will_not_buy")
        .map((row: any) => row.label)
        .filter(Boolean)
        .join("\n"),
    serviceArea:
      settingsResult.data?.service_area ||
      (serviceResult.data || [])
        .map((row: any) => row.name)
        .filter(Boolean)
        .join("\n"),
    targetCustomer: settingsResult.data?.target_customer || "",
    customAiInstructions: settingsResult.data?.custom_ai_instructions || "",
    importantDisclaimersOrLimits:
      settingsResult.data?.important_disclaimers_or_limits || "",
    managedFaqs: (managedFaqResult.data || []) as any[],
    customFaqs: (customFaqResult.data || []) as any[],
  };
}

async function saveConversation({
  conversationId,
  message,
  reply,
  sourceUrl,
  siteId,
  businessId,
}: {
  conversationId?: string | null;
  message: string;
  reply: string;
  sourceUrl?: string | null;
  siteId?: string | null;
  businessId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return conversationId || null;

  let currentConversationId = conversationId || null;

  try {
    if (currentConversationId) {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", currentConversationId)
        .maybeSingle();

      if (!existingConversation?.id) {
        currentConversationId = null;
      }
    }

    if (!currentConversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          source_url: sourceUrl || null,
          site_id: siteId || null,
          business_id: businessId || null,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      currentConversationId = conversation?.id || null;
    }

    if (currentConversationId) {
      await supabase.from("conversation_messages").insert([
        {
          conversation_id: currentConversationId,
          role: "user",
          content: message,
        },
        {
          conversation_id: currentConversationId,
          role: "assistant",
          content: reply,
        },
      ]);

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversationId);
    }
  } catch (_) {
    return currentConversationId;
  }

  return currentConversationId;
}

function getAnswer(message: string, context: BusinessContext) {
  const customAnswer = answerFromCustomFaqs(
    message,
    context.customFaqs,
    context,
  );
  if (customAnswer) return customAnswer;

  const managedAnswer = answerFromFaqList(
    message,
    context.managedFaqs,
    context,
  );
  if (managedAnswer) return managedAnswer;

  const businessAnswer = answerFromBusinessRules(message, context);
  if (businessAnswer) return businessAnswer;

  // The old global FAQ library is cash-home-buyer specific. Keep it available only
  // when the configured business type is Home Buyer.
  if (normalize(context.businessType).includes("home buyer")) {
    const defaultAnswer = answerFromFaqList(
      message,
      getDefaultFaqItems(),
      context,
    );
    if (defaultAnswer) return defaultAnswer;
  }

  return safeFallback(message, context);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;

  const message = String(body?.message || "").trim();
  const siteId = body?.siteId || "demo";

  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const context = await resolveBusinessContext(siteId);
  const reply = getAnswer(message, context);

  const conversationId = await saveConversation({
    conversationId: body?.conversationId || null,
    message,
    reply,
    sourceUrl: body?.sourceUrl || null,
    siteId,
    businessId: context.businessId,
  });

  return NextResponse.json(
    {
      ok: true,
      reply,
      conversationId,
      businessId: context.businessId,
      siteId,
    },
    { headers: corsHeaders() },
  );
}
