import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildWidgetEmbedCode } from "@/lib/widgetEmbed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Site Settings | CashOfferChat" };

function siteLabel(site: any) {
  return site.site_name || site.name || site.site_id || "Widget Site";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default async function ClientSiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: site } = await supabase
    .from("widget_sites")
    .select(
      "id, business_id, site_id, name, site_name, domain, allowed_domains, is_active, created_at, updated_at",
    )
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!site) notFound();

  const [businessResult, leadsResult, eventsResult] = await Promise.all([
    supabase
      .from("businesses")
      .select("name")
      .eq("id", session.businessId)
      .maybeSingle(),
    supabase
      .from("seller_leads")
      .select(
        "id, created_at, name, phone, property_city, property_address, service_needed, message, status",
      )
      .eq("business_id", session.businessId)
      .eq("site_id", site.site_id)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("widget_events")
      .select("id, created_at, event_type, domain, page_url")
      .eq("business_id", session.businessId)
      .eq("site_id", site.site_id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const businessName = businessResult.data?.name || "Your Business";
  const leads = leadsResult.data || [];
  const events = eventsResult.data || [];
  const label = siteLabel(site);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/client/sites"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Widget Sites
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">{label}</h1>
            <p className="text-sm text-slate-500">
              {businessName} · Site ID: {site.site_id}
            </p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-6">
          {query.saved && (
            <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
              Widget site saved.
            </div>
          )}
          {query.error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Widget site could not be saved.
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Site Settings</h2>
            <p className="mt-2 text-sm text-slate-500">
              You can update display details and allowed domains for this widget
              site.
            </p>

            <form
              action={`/api/client/sites/${site.id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-semibold text-slate-700">
                Site Name
                <input
                  name="site_name"
                  defaultValue={label}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Primary Domain
                <input
                  name="domain"
                  defaultValue={site.domain || ""}
                  placeholder="example.com"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Allowed Domains
                <textarea
                  name="allowed_domains"
                  defaultValue={site.allowed_domains || ""}
                  placeholder={"example.com\nwww.example.com"}
                  className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={site.is_active !== false}
                />{" "}
                Active
              </label>

              <button
                className="rounded-full bg-gold px-7 py-3 font-bold text-navy"
                type="submit"
              >
                Save Site Settings
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Install Code</h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste this before the closing body tag on your website.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {buildWidgetEmbedCode(site.site_id)}
            </pre>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-bold text-navy">Test checklist</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Install the code on your website.</li>
                <li>Open the website in a private/incognito window.</li>
                <li>Open the chat bubble.</li>
                <li>Submit a test quote request.</li>
                <li>Confirm the test lead appears in CashOfferChat.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">
              Recent Leads From This Site
            </h2>
            <div className="mt-5 space-y-3">
              {leads.length === 0 && (
                <p className="text-sm text-slate-500">No leads yet.</p>
              )}
              {leads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <div className="font-bold text-navy">
                      {lead.name || "Lead"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {lead.phone || "No phone"} ·{" "}
                      {lead.property_city ||
                        lead.property_address ||
                        "No location"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                  <Link
                    href={`/client/leads/${lead.id}`}
                    className="text-sm font-bold text-navy underline"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">
              Recent Widget Events
            </h2>
            <div className="mt-5 space-y-3">
              {events.length === 0 && (
                <p className="text-sm text-slate-500">No events yet.</p>
              )}
              {events.map((event: any) => (
                <div key={event.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-bold text-navy">
                      {event.event_type}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(event.created_at)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {event.domain || "No domain"} · {event.page_url || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
