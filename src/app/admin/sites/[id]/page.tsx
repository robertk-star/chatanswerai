import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildWidgetEmbedCode } from "@/lib/widgetEmbed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Widget Site Detail | ChatAnswerAI" };

export default async function AdminSiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: site } = await supabase
    .from("widget_sites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!site) notFound();

  const [businessesResult, leadsResult, eventsResult] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("seller_leads")
      .select(
        "id, created_at, name, phone, property_city, service_needed, message, status",
      )
      .eq("site_id", site.site_id)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("widget_events")
      .select("id, created_at, event_type, domain, page_url")
      .eq("site_id", site.site_id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const businesses = businessesResult.data || [];
  const leads = leadsResult.data || [];
  const events = eventsResult.data || [];
  const label = site.site_name || site.name || site.site_id;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/sites"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Widget Sites
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">{label}</h1>
            <p className="text-sm text-slate-500">Site ID: {site.site_id}</p>
          </div>
          <form action="/api/admin/logout" method="post">
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
              Widget site could not be saved. Make sure Site ID is unique.
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Edit Widget Site</h2>
            <p className="mt-2 text-sm text-slate-500">
              Required fields are marked with *.
            </p>

            <form
              action={`/api/admin/sites/${site.id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-semibold text-slate-700">
                Business *
                <select
                  name="business_id"
                  required
                  defaultValue={site.business_id || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="">Select a business</option>
                  {businesses.map((business: any) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Site ID *
                <input
                  name="site_id"
                  required
                  defaultValue={site.site_id || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Site Name
                <input
                  name="site_name"
                  defaultValue={label || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Primary Domain
                <input
                  name="domain"
                  defaultValue={site.domain || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Allowed Domains
                <textarea
                  name="allowed_domains"
                  defaultValue={site.allowed_domains || ""}
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
                Save Widget Site
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Installation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste this before the closing body tag on the customer website.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {buildWidgetEmbedCode(site.site_id)}
            </pre>
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
                      {lead.service_needed ||
                        lead.property_city ||
                        "No service info"}
                    </div>
                  </div>
                  <Link
                    href={`/admin/leads/${lead.id}`}
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
                      {new Date(event.created_at).toLocaleString()}
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
