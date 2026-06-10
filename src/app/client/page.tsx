import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ClientLeadExportButton } from "@/components/ClientLeadExportButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Dashboard | CashOfferChat" };

const statusOptions = [
  "all",
  "new",
  "contacted",
  "appointment_set",
  "offer_made",
  "under_contract",
  "closed",
  "not_interested",
  "bad_lead",
  "referral",
];

function statusLabel(status?: string | null) {
  return (status || "new").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function siteLabel(site: any) {
  return site.site_name || site.name || site.site_id || "Widget Site";
}

function buildDashboardHref(status: string, siteId: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (siteId !== "all") params.set("site", siteId);
  const query = params.toString();
  return query ? `/client?${query}` : "/client";
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; site?: string; leadDeleted?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let businessName = "Your Business";
  let leads: any[] = [];
  let sites: any[] = [];
  let errorMessage: string | null = null;

  const selectedStatus = statusOptions.includes(query.status || "") ? query.status || "all" : "all";
  const selectedSite = query.site || "all";

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const br = await supabase.from("businesses").select("name").eq("id", session.businessId).maybeSingle();
    businessName = br.data?.name || businessName;

    const sr = await supabase
      .from("widget_sites")
      .select("id, site_id, name, site_name, domain, is_active")
      .eq("business_id", session.businessId)
      .order("created_at", { ascending: false });

    sites = sr.data || [];
    const validSiteIds = new Set(sites.map((site) => site.site_id));
    const activeSiteFilter = selectedSite !== "all" && validSiteIds.has(selectedSite) ? selectedSite : "all";

    let leadQuery = supabase
      .from("seller_leads")
      .select("id, created_at, name, phone, email, property_address, property_city, timeline, situation, property_condition, status, last_contacted_at, site_id")
      .eq("business_id", session.businessId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (selectedStatus !== "all") {
      leadQuery = leadQuery.eq("status", selectedStatus);
    }

    if (activeSiteFilter !== "all") {
      leadQuery = leadQuery.eq("site_id", activeSiteFilter);
    }

    const lr = await leadQuery;

    if (lr.error) errorMessage = lr.error.message;
    leads = lr.data || [];
  }

  const siteNameById = new Map(sites.map((site) => [site.site_id, siteLabel(site)]));
  const activeSiteValue = selectedSite !== "all" && siteNameById.has(selectedSite) ? selectedSite : "all";
  const newCount = leads.filter((lead) => (lead.status || "new") === "new").length;
  const contactedCount = leads.filter((lead) => (lead.status || "") === "contacted").length;
  const closedCount = leads.filter((lead) => (lead.status || "") === "closed").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">{businessName}</h1>
            <p className="text-sm text-slate-500">Client dashboard</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ClientLeadExportButton status={selectedStatus === "all" ? undefined : selectedStatus} />
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/sites">Widget Sites</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/settings">Settings</Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" href="/client/account">Account</Link>
            <form action="/api/client/logout" method="post">
              <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.leadDeleted && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Lead deleted and reset.</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Visible Leads</p>
            <p className="mt-2 text-4xl font-bold text-navy">{leads.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">New</p>
            <p className="mt-2 text-4xl font-bold text-navy">{newCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Contacted</p>
            <p className="mt-2 text-4xl font-bold text-navy">{contactedCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Widget Sites</p>
            <p className="mt-2 text-4xl font-bold text-navy">{sites.length}</p>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-navy">Filter leads</div>
              <p className="text-xs text-slate-500">For Pro accounts, use the site filter to separate leads by website.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={buildDashboardHref(selectedStatus, "all")} className={activeSiteValue === "all" ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"}>All Sites</Link>
              {sites.map((site) => (
                <Link key={site.id} href={buildDashboardHref(selectedStatus, site.site_id)} className={activeSiteValue === site.site_id ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"}>{siteLabel(site)}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Link
                key={status}
                href={buildDashboardHref(status, activeSiteValue)}
                className={
                  selectedStatus === status
                    ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                }
              >
                {statusLabel(status)}
              </Link>
            ))}
          </div>
          <ClientLeadExportButton status={selectedStatus === "all" ? undefined : selectedStatus} />
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Seller</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Site</th>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={8}>No leads found.</td></tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4 text-slate-500">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-navy">{lead.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.phone || "—"}</div><div>{lead.email || ""}</div></td>
                  <td className="px-5 py-4 text-slate-600"><div>{lead.property_address || "—"}</div><div>{lead.property_city || ""}</div></td>
                  <td className="px-5 py-4 text-slate-600">{siteNameById.get(lead.site_id) || lead.site_id || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{lead.timeline || "—"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{statusLabel(lead.status)}</span></td>
                  <td className="px-5 py-4"><Link className="font-bold text-navy underline" href={`/client/leads/${lead.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
