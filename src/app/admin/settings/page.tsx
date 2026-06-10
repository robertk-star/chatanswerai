import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings | CashOfferChat" };

const BUSINESS_TYPE_OPTIONS = [
  "General Service Business",
  "Background Screening",
  "Home Buyer",
  "Roofing",
  "HVAC",
  "Plumbing",
  "Med Spa",
  "Law Firm",
  "Auto Services",
];

type Business = { id: string; name: string };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    faqsImported?: string;
  }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let business: any = null;
  let businesses: Business[] = [];
  let settings: any = null;
  let serviceAreas = "";
  let referralAreas = "";
  let willBuy = "";
  let willNotBuy = "";
  let faqs: any[] = [];
  let errorMessage: string | null = query.error
    ? "Settings could not be saved."
    : null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const { data: businessRows } = await supabase
      .from("businesses")
      .select("id, name")
      .order("created_at", { ascending: true });
    businesses = (businessRows || []) as Business[];
    business = businesses[0] || null;

    if (business) {
      const [
        { data: settingsRow },
        { data: serviceRows },
        { data: referralRows },
        { data: criteriaRows },
        { data: faqRows },
      ] = await Promise.all([
        supabase
          .from("business_settings")
          .select("*")
          .eq("business_id", business.id)
          .maybeSingle(),
        supabase
          .from("service_areas")
          .select("name")
          .eq("business_id", business.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("referral_areas")
          .select("name")
          .eq("business_id", business.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("property_buying_criteria")
          .select("type, label")
          .eq("business_id", business.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("managed_faq_items")
          .select("id, question, answer, is_enabled, sort_order")
          .eq("business_id", business.id)
          .order("sort_order", { ascending: true }),
      ]);
      settings = settingsRow || {};
      serviceAreas = (serviceRows || [])
        .map((r: any) => r.name)
        .filter(Boolean)
        .join("\n");
      referralAreas = (referralRows || [])
        .map((r: any) => r.name)
        .filter(Boolean)
        .join("\n");
      willBuy = (criteriaRows || [])
        .filter((r: any) => r.type === "will_buy")
        .map((r: any) => r.label)
        .filter(Boolean)
        .join("\n");
      willNotBuy = (criteriaRows || [])
        .filter((r: any) => r.type === "will_not_buy")
        .map((r: any) => r.label)
        .filter(Boolean)
        .join("\n");
      faqs = faqRows || [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Admin
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Settings</h1>
            <p className="text-sm text-slate-500">
              Manage default business/widget settings.
            </p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.saved && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
            Settings saved.
          </div>
        )}
        {query.faqsImported && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
            Default FAQs imported into Managed FAQs.
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {!business ? (
          <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
            No business found. Create one from{" "}
            <Link className="font-bold underline" href="/admin/onboarding">
              Onboarding
            </Link>
            .
          </div>
        ) : (
          <form
            action="/api/admin/settings"
            method="post"
            className="space-y-8"
          >
            <input type="hidden" name="business_id" value={business.id} />
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">Business Profile</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Business Name
                  <input
                    name="business_name"
                    defaultValue={
                      settings?.business_name || business.name || ""
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Website
                  <input
                    name="website"
                    defaultValue={settings?.website || ""}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone
                  <input
                    name="phone"
                    defaultValue={settings?.phone || ""}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Email
                  <input
                    name="email"
                    defaultValue={settings?.email || ""}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Primary Market
                  <input
                    name="primary_market"
                    defaultValue={settings?.primary_market || ""}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Business Type
                  <select
                    name="business_type"
                    defaultValue={
                      settings?.business_type || "General Service Business"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    {BUSINESS_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Business Description
                  <textarea
                    name="description"
                    defaultValue={
                      settings?.business_description ||
                      settings?.description ||
                      ""
                    }
                    placeholder="Briefly explain what this business does."
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Services Offered
                  <textarea
                    name="services_offered"
                    defaultValue={settings?.services_offered || willBuy}
                    placeholder={
                      "Employment background checks\nDrug screening\nVerification services"
                    }
                    className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Services Not Offered
                  <textarea
                    name="services_not_offered"
                    defaultValue={settings?.services_not_offered || willNotBuy}
                    placeholder={"Legal advice\nConsumer credit repair"}
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Service Area
                  <textarea
                    name="service_area"
                    defaultValue={settings?.service_area || serviceAreas}
                    placeholder="Cities, states, counties, or national service area"
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Target Customer
                  <textarea
                    name="target_customer"
                    defaultValue={settings?.target_customer || ""}
                    placeholder="Employers, HR teams, homeowners, patients, drivers, local customers, etc."
                    className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Custom AI Instructions
                  <textarea
                    name="custom_ai_instructions"
                    defaultValue={settings?.custom_ai_instructions || ""}
                    placeholder="Tell the assistant what to focus on, how to answer, and what to avoid."
                    className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Important Disclaimers or Limits
                  <textarea
                    name="important_disclaimers_or_limits"
                    defaultValue={
                      settings?.important_disclaimers_or_limits || ""
                    }
                    placeholder="Example: We do not provide legal advice. Final pricing requires review by the team."
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">Widget Settings</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Widget Title
                  <input
                    name="widget_title"
                    defaultValue={
                      settings?.widget_title || "Service Inquiry Assistant"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Widget Subtitle
                  <input
                    name="widget_subtitle"
                    defaultValue={
                      settings?.widget_subtitle ||
                      "Answers questions and collects service inquiries"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Request Button Text
                  <input
                    name="widget_quote_button_text"
                    defaultValue={
                      settings?.widget_quote_button_text ||
                      "Request Information"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Header Background Color
                  <input
                    name="widget_header_color"
                    type="color"
                    defaultValue={settings?.widget_header_color || "#0f172a"}
                    className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Header Font Color
                  <input
                    name="widget_header_text_color"
                    type="color"
                    defaultValue={
                      settings?.widget_header_text_color || "#ffffff"
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Button Background Color
                  <input
                    name="widget_button_color"
                    type="color"
                    defaultValue={settings?.widget_button_color || "#f5b51b"}
                    className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Button Font Color
                  <input
                    name="widget_button_text_color"
                    type="color"
                    defaultValue={
                      settings?.widget_button_text_color || "#0f172a"
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Call Button Text
                  <input
                    name="widget_call_button_text"
                    defaultValue={
                      settings?.widget_call_button_text || "Call Now"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 md:col-span-2">
                  <input
                    name="widget_show_call_button"
                    type="checkbox"
                    defaultChecked={settings?.widget_show_call_button ?? true}
                    className="h-5 w-5"
                  />
                  Show phone number / call button in the widget
                </label>
                <p className="text-xs text-slate-500 md:col-span-2">
                  The header color only changes the top part of the widget. The
                  body where the questions appear stays light.
                </p>
                <label className="block text-sm font-semibold text-slate-700">
                  Lead Notification Email
                  <input
                    name="lead_notification_email"
                    defaultValue={settings?.lead_notification_email || ""}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                  Allowed Domains
                  <textarea
                    name="widget_allowed_domains"
                    defaultValue={settings?.widget_allowed_domains || ""}
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">
                Legacy Home Buyer Criteria
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Legacy Service Areas
                  <textarea
                    name="service_areas"
                    defaultValue={serviceAreas}
                    className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Referral / Extended Areas
                  <textarea
                    name="referral_areas"
                    defaultValue={referralAreas}
                    className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Legacy Home Buyer: What You Buy
                  <textarea
                    name="will_buy"
                    defaultValue={willBuy}
                    className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Legacy Home Buyer: What You Do Not Buy
                  <textarea
                    name="will_not_buy"
                    defaultValue={willNotBuy}
                    className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy">Managed FAQs</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These approved answers are checked before the global
                    fallback FAQ library.
                  </p>
                </div>
                <button
                  type="submit"
                  formAction="/api/admin/settings/faqs/import-defaults"
                  formMethod="post"
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-navy"
                >
                  Import Top 100 FAQs
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Importing replaces this business's current Managed FAQs with the
                approved default FAQ set.
              </p>
              <div className="mt-6 space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <div
                    key={faq.id || index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <input
                      type="hidden"
                      name="faq_id"
                      defaultValue={faq.id || ""}
                    />
                    <label className="block text-sm font-semibold text-slate-700">
                      Question
                      <input
                        name="faq_question"
                        defaultValue={faq.question || ""}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                      />
                    </label>
                    <label className="mt-3 block text-sm font-semibold text-slate-700">
                      Answer
                      <textarea
                        name="faq_answer"
                        defaultValue={faq.answer || ""}
                        className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                      />
                    </label>
                    <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input
                        name="faq_remove"
                        type="checkbox"
                        value={String(index)}
                      />{" "}
                      Remove
                    </label>
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                  <h3 className="font-bold text-navy">Add a New FAQ</h3>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    Question
                    <input
                      name="new_faq_question"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    Answer
                    <textarea
                      name="new_faq_answer"
                      className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-4 rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-200">
              <button
                className="w-full rounded-full bg-gold px-7 py-4 font-bold text-navy"
                type="submit"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
