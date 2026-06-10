import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Settings | ChatarAI" };

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

type ClientSettingsSearchParams = {
  saved?: string;
  error?: string;
};

function displayMessage(value?: string) {
  if (!value) return null;
  if (value === "1") return "Settings saved.";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ClientSettingsPage({
  searchParams,
}: {
  searchParams: Promise<ClientSettingsSearchParams>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let settings: any = {};
  let business: any = {};
  let errorMessage: string | null = displayMessage(query.error);
  const savedMessage = displayMessage(query.saved);

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const br = await supabase
      .from("businesses")
      .select("*")
      .eq("id", session.businessId)
      .maybeSingle();
    const sr = await supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", session.businessId)
      .order("updated_at", { ascending: false })
      .limit(1);
    business = br.data || {};
    settings = Array.isArray(sr.data) ? sr.data[0] || {} : sr.data || {};

    if (br.error)
      errorMessage = `Business profile could not be loaded: ${br.error.message}`;
    else if (sr.error)
      errorMessage = `Widget settings could not be loaded: ${sr.error.message}`;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">
              Back to Client Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Client Settings</h1>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {savedMessage && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
            {savedMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form action="/api/client/settings" method="post" className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Business Name
                <input name="business_name" required defaultValue={business.name || settings.business_name || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input name="phone" defaultValue={business.phone || settings.phone || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Website
                <input name="website" defaultValue={business.website || settings.website || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Primary Market
                <input name="primary_market" defaultValue={business.primary_market || settings.primary_market || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Business Type
                <select name="business_type" defaultValue={settings.business_type || "General Service Business"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3">
                  {BUSINESS_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Business Description
                <textarea name="description" defaultValue={settings.business_description || settings.description || business.description || ""} placeholder="Briefly explain what this business does." className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Services Offered
                <textarea name="services_offered" defaultValue={settings.services_offered || ""} placeholder={"Employment background checks\nDrug screening\nVerification services"} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Services Not Offered
                <textarea name="services_not_offered" defaultValue={settings.services_not_offered || ""} placeholder={"Legal advice\nConsumer credit repair"} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Service Area
                <textarea name="service_area" defaultValue={settings.service_area || ""} placeholder="Cities, states, counties, or national service area" className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Target Customer
                <textarea name="target_customer" defaultValue={settings.target_customer || ""} placeholder="Employers, HR teams, homeowners, patients, drivers, local customers, etc." className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Custom AI Instructions
                <textarea name="custom_ai_instructions" defaultValue={settings.custom_ai_instructions || ""} placeholder="Tell the assistant what to focus on, how to answer, and what to avoid." className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Important Disclaimers or Limits
                <textarea name="important_disclaimers_or_limits" defaultValue={settings.important_disclaimers_or_limits || ""} placeholder="Example: We do not provide legal advice. Final pricing requires review by the team." className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Widget</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Widget Title
                <input name="widget_title" defaultValue={settings.widget_title || "Service Inquiry Assistant"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Widget Subtitle
                <input name="widget_subtitle" defaultValue={settings.widget_subtitle || "Answers questions and collects service inquiries"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Request Button Text
                <input name="widget_quote_button_text" defaultValue={settings.widget_quote_button_text || "Request Information"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Call Button Text
                <input name="widget_call_button_text" defaultValue={settings.widget_call_button_text || "Call Now"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">Common Question Buttons</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add up to 4 quick questions that appear inside the widget. Leave blank to use the default question buttons.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Question Button 1
                    <input name="widget_quick_question_1" defaultValue={settings.widget_quick_question_1 || ""} placeholder="What services do you offer?" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Question Button 2
                    <input name="widget_quick_question_2" defaultValue={settings.widget_quick_question_2 || ""} placeholder="What areas do you serve?" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Question Button 3
                    <input name="widget_quick_question_3" defaultValue={settings.widget_quick_question_3 || ""} placeholder="How fast can someone follow up?" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Question Button 4
                    <input name="widget_quick_question_4" defaultValue={settings.widget_quick_question_4 || ""} placeholder="Can I request information?" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </label>
                </div>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                Header Background Color
                <input name="widget_header_color" type="color" defaultValue={settings.widget_header_color || "#0f172a"} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Header Font Color
                <input name="widget_header_text_color" type="color" defaultValue={settings.widget_header_text_color || "#ffffff"} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Button Background Color
                <input name="widget_button_color" type="color" defaultValue={settings.widget_button_color || "#f5b51b"} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Button Font Color
                <input name="widget_button_text_color" type="color" defaultValue={settings.widget_button_text_color || "#0f172a"} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 md:col-span-2">
                <input name="widget_show_call_button" type="checkbox" defaultChecked={settings.widget_show_call_button ?? true} className="h-5 w-5" />
                Show phone number / call button in the widget
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              The header color only changes the top part of the widget. The body where the questions appear stays light.
            </p>
          </div>

          <button className="w-full rounded-full bg-gold px-7 py-4 font-bold text-navy" type="submit">
            Save Client Settings
          </button>
        </form>
      </section>
    </main>
  );
}
