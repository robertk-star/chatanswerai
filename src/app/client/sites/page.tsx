import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildWidgetEmbedCode } from "@/lib/widgetEmbed";
import { maxWidgetSitesForPlan, planDescription, planLabel } from "@/lib/planLimits";
import { CopyEmbedButton } from "@/components/CopyEmbedButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Sites | ChatAnswerAI" };

function siteLabel(site: any) {
  return site.site_name || site.name || site.site_id || "Widget Site";
}

function errorMessage(code?: string) {
  switch (code) {
    case "site_limit":
      return "Your current plan has reached its widget site limit.";
    case "duplicate_site_id":
      return "That Site ID already exists. Choose a different Site ID.";
    case "missing_required":
      return "Site ID is required.";
    default:
      return code ? decodeURIComponent(code) : null;
  }
}

export default async function ClientSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let business: any = null;
  let businessName = "Your Business";
  let sites: any[] = [];
  let leadCounts: Record<string, number> = {};
  let eventCounts: Record<string, number> = {};
  let errorText: string | null = errorMessage(query.error);

  if (!supabase) {
    errorText = "Supabase is not configured.";
  } else {
    const [businessResult, sitesResult, leadsResult, eventsResult] = await Promise.all([
      supabase.from("businesses").select("name, plan_name, max_widget_sites").eq("id", session.businessId).maybeSingle(),
      supabase
        .from("widget_sites")
        .select("id, site_id, name, site_name, domain, allowed_domains, is_active, created_at")
        .eq("business_id", session.businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("seller_leads")
        .select("site_id")
        .eq("business_id", session.businessId),
      supabase
        .from("widget_events")
        .select("site_id")
        .eq("business_id", session.businessId),
    ]);

    business = businessResult.data || null;
    businessName = business?.name || businessName;

    if (sitesResult.error) errorText = sitesResult.error.message;
    sites = sitesResult.data || [];

    for (const lead of leadsResult.data || []) {
      if (!lead.site_id) continue;
      leadCounts[lead.site_id] = (leadCounts[lead.site_id] || 0) + 1;
    }

    for (const event of eventsResult.data || []) {
      if (!event.site_id) continue;
      eventCounts[event.site_id] = (eventCounts[event.site_id] || 0) + 1;
    }
  }

  const planName = business?.plan_name || "starter";
  const maxSites = business?.max_widget_sites || maxWidgetSitesForPlan(planName);
  const canAddSite = sites.length < maxSites;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Widget Sites</h1>
            <p className="text-sm text-slate-500">{businessName} · Install and manage your website widget.</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Widget site saved.</div>}
        {errorText && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorText}</div>}

        <div className="mb-8 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Your Plan</h2>
            <div className="mt-4 text-3xl font-black text-navy">{planLabel(planName)}</div>
            <p className="mt-2 text-sm text-slate-600">{planDescription(planName)}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <strong className="text-navy">Sites used:</strong> {sites.length}/{maxSites}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">How to Install</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>Copy the embed code for the correct site below.</li>
              <li>Paste it before the closing <code className="rounded bg-slate-100 px-1">body</code> tag on your website.</li>
              <li>Open your website in a private/incognito browser window.</li>
              <li>Open the chat bubble and submit a test lead.</li>
              <li>Confirm the lead appears in your ChatAnswerAI dashboard.</li>
            </ol>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add Widget Site</h2>
          {canAddSite ? (
            <form action="/api/client/sites" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Site ID *
                <input name="site_id" required placeholder="dallas-home-buyer" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                <span className="mt-1 block text-xs text-slate-500">Lowercase letters, numbers, and hyphens. This becomes the widget data-site-id.</span>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Site Name
                <input name="site_name" placeholder="Dallas Home Buyer Site" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Primary Domain
                <input name="domain" placeholder="example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Allowed Domains
                <textarea name="allowed_domains" placeholder={"example.com\nwww.example.com"} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input name="is_active" type="checkbox" defaultChecked /> Active
              </label>
              <div className="md:col-span-2">
                <button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">Save Widget Site</button>
              </div>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              You have reached your plan limit of {maxSites} widget site{maxSites === 1 ? "" : "s"}. Contact support to upgrade or remove an old site.
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {sites.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200 lg:col-span-2">
              No widget sites have been assigned to this business yet.
            </div>
          )}

          {sites.map((site) => {
            const label = siteLabel(site);
            const embedCode = buildWidgetEmbedCode(site.site_id);
            return (
              <div key={site.id} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-navy">{label}</h3>
                    <p className="text-sm text-slate-500">Site ID: {site.site_id}</p>
                    <p className="text-sm text-slate-500">Domain: {site.domain || "No domain set"}</p>
                  </div>
                  <span className={site.is_active === false ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700" : "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"}>
                    {site.is_active === false ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Leads</div>
                    <div className="mt-1 text-2xl font-bold text-navy">{leadCounts[site.site_id] || 0}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Events</div>
                    <div className="mt-1 text-2xl font-bold text-navy">{eventCounts[site.site_id] || 0}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-700">Embed code</div>
                    <CopyEmbedButton value={embedCode} />
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">{embedCode}</pre>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/client/sites/${site.id}`} className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy">
                    Open Site Settings
                  </Link>
                  <Link href="/client/analytics" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
                    View Analytics
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
