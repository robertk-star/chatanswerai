import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Analytics | CashOfferChat" };

function countBy(rows: any[], key: string) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const value = row[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default async function ClientAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let businessName = "Your Business";
  let events: any[] = [];
  let leads: any[] = [];
  let sites: any[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [businessResult, eventsResult, leadsResult, sitesResult] =
      await Promise.all([
        supabase
          .from("businesses")
          .select("name")
          .eq("id", session.businessId)
          .maybeSingle(),
        supabase
          .from("widget_events")
          .select(
            "id, created_at, event_type, site_id, domain, page_url, lead_id, conversation_id",
          )
          .eq("business_id", session.businessId)
          .gte("created_at", since7)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("seller_leads")
          .select(
            "id, created_at, name, phone, email, property_city, property_address, service_needed, message, status, site_id",
          )
          .eq("business_id", session.businessId)
          .gte("created_at", since7)
          .order("created_at", { ascending: false })
          .limit(250),
        supabase
          .from("widget_sites")
          .select("id, site_id, name, site_name, domain, is_active")
          .eq("business_id", session.businessId)
          .order("created_at", { ascending: false }),
      ]);

    businessName = businessResult.data?.name || businessName;

    if (eventsResult.error) errorMessage = eventsResult.error.message;
    events = eventsResult.data || [];
    leads = leadsResult.data || [];
    sites = sitesResult.data || [];
  }

  const openedEvents = events.filter(
    (event) => event.event_type === "widget_opened",
  ).length;
  const formOpenedEvents = events.filter(
    (event) => event.event_type === "quote_form_opened",
  ).length;
  const leadSavedEvents = events.filter(
    (event) =>
      event.event_type === "lead_saved" ||
      event.event_type === "lead_submitted",
  ).length;

  const eventTypes = countBy(events, "event_type");
  const domains = countBy(events, "domain");
  const siteIds = countBy(events, "site_id");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/client"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Client Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Analytics</h1>
            <p className="text-sm text-slate-500">
              {businessName} · Last 7 days
            </p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">
              Widget Events
            </p>
            <p className="mt-2 text-4xl font-bold text-navy">{events.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Leads</p>
            <p className="mt-2 text-4xl font-bold text-navy">{leads.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Widget Opens</p>
            <p className="mt-2 text-4xl font-bold text-navy">{openedEvents}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">
              Quote Form Opens
            </p>
            <p className="mt-2 text-4xl font-bold text-navy">
              {formOpenedEvents}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Lead Rate</p>
            <p className="mt-2 text-4xl font-bold text-navy">
              {percent(leads.length || leadSavedEvents, events.length)}%
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Widget Sites</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.length === 0 && (
              <p className="text-sm text-slate-500">No widget sites yet.</p>
            )}
            {sites.map((site) => {
              const label = site.site_name || site.name || site.site_id;
              const siteEventCount = events.filter(
                (event) => event.site_id === site.site_id,
              ).length;
              const siteLeadCount = leads.filter(
                (lead) => lead.site_id === site.site_id,
              ).length;

              return (
                <div
                  key={site.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="font-bold text-navy">{label}</div>
                  <div className="text-sm text-slate-500">
                    {site.domain || "No domain set"}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">
                        Events
                      </div>
                      <div className="text-xl font-bold text-navy">
                        {siteEventCount}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">
                        Leads
                      </div>
                      <div className="text-xl font-bold text-navy">
                        {siteLeadCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Events by Type</h2>
            <div className="mt-4 space-y-2">
              {eventTypes.length === 0 && (
                <p className="text-sm text-slate-500">No events yet.</p>
              )}
              {eventTypes.map(([label, count]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Events by Domain</h2>
            <div className="mt-4 space-y-2">
              {domains.length === 0 && (
                <p className="text-sm text-slate-500">No domains yet.</p>
              )}
              {domains.map(([label, count]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <span className="break-all">{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Events by Site ID</h2>
            <div className="mt-4 space-y-2">
              {siteIds.length === 0 && (
                <p className="text-sm text-slate-500">No site activity yet.</p>
              )}
              {siteIds.map(([label, count]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Recent Leads</h2>
            <div className="mt-5 space-y-3">
              {leads.length === 0 && (
                <p className="text-sm text-slate-500">
                  No leads in the last 7 days.
                </p>
              )}
              {leads.slice(0, 25).map((lead) => (
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
                <p className="text-sm text-slate-500">
                  No events in the last 7 days.
                </p>
              )}
              {events.slice(0, 25).map((event) => (
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
                    {event.domain || "No domain"} · {event.site_id || "No site"}
                  </div>
                  {event.page_url && (
                    <div className="mt-1 break-all text-xs text-slate-400">
                      {event.page_url}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
