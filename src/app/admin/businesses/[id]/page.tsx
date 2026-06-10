import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildWidgetEmbedCode } from "@/lib/widgetEmbed";
import {
  maxWidgetSitesForPlan,
  planDescription,
  planLabel,
  normalizePlanName,
} from "@/lib/planLimits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Business Detail | CashOfferChat" };

export default async function AdminBusinessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
    leadDeleted?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!business) notFound();

  const [sitesResult, usersResult, leadsResult] = await Promise.all([
    supabase
      .from("widget_sites")
      .select(
        "id, site_id, name, site_name, domain, allowed_domains, is_active",
      )
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("business_users")
      .select("id, email, name, role, is_active, last_login_at")
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("seller_leads")
      .select(
        "id, created_at, name, phone, property_address, property_city, service_needed, message, status",
      )
      .eq("business_id", id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const sites = (sitesResult.data || []) as Array<any>;
  const users = (usersResult.data || []) as Array<any>;
  const leads = (leadsResult.data || []) as Array<any>;
  const planName = normalizePlanName(business.plan_name);
  const maxSites = business.max_widget_sites || maxWidgetSitesForPlan(planName);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/businesses"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Businesses
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">
              {business.name}
            </h1>
            <p className="text-sm text-slate-500">
              {business.slug || business.id}
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
            Business saved.
          </div>
        )}
        {query.error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            Business could not be saved.
          </div>
        )}
        {query.leadDeleted && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
            Lead deleted and reset.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Business Profile</h2>
            <form
              action={`/api/admin/businesses/${id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-semibold text-slate-700">
                Business Name *
                <input
                  name="name"
                  defaultValue={business.name || ""}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Website
                <input
                  name="website"
                  defaultValue={business.website || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input
                  name="phone"
                  defaultValue={business.phone || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={business.email || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Primary Market
                <input
                  name="primary_market"
                  defaultValue={business.primary_market || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Description
                <textarea
                  name="description"
                  defaultValue={business.description || ""}
                  className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-navy">Plan</div>
                <p className="mt-1 text-xs text-slate-500">
                  Current: {planLabel(planName)} · {sites.length}/{maxSites}{" "}
                  widget sites used.
                </p>
                <label className="mt-3 block text-sm font-semibold text-slate-700">
                  Plan Name
                  <select
                    name="plan_name"
                    defaultValue={planName}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                  >
                    <option value="starter">Starter — $49/mo, 1 site</option>
                    <option value="pro">
                      Pro — $99/mo, up to 4 sites/accounts
                    </option>
                  </select>
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  {planDescription(planName)}
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={business.is_active !== false}
                />{" "}
                Active
              </label>
              <button
                className="rounded-full bg-gold px-7 py-3 font-bold text-navy"
                type="submit"
              >
                Save Business
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Widget Sites</h2>
                <Link
                  href="/admin/sites"
                  className="text-sm font-bold text-navy underline"
                >
                  Manage Sites
                </Link>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {planLabel(planName)} plan: {sites.length}/{maxSites} widget
                sites used.
              </p>
              <div className="mt-5 space-y-4">
                {sites.length === 0 && (
                  <p className="text-sm text-slate-500">No widget sites yet.</p>
                )}
                {sites.map((site) => {
                  const label = site.site_name || site.name || site.site_id;
                  return (
                    <div
                      key={site.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-bold text-navy">{label}</div>
                          <div className="text-sm text-slate-500">
                            {site.domain || "No domain set"}
                          </div>
                          <div className="text-xs text-slate-400">
                            Site ID: {site.site_id}
                          </div>
                        </div>
                        <span
                          className={
                            site.is_active === false
                              ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                              : "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                          }
                        >
                          {site.is_active === false ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                        {buildWidgetEmbedCode(site.site_id)}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Client Users</h2>
                <Link
                  href="/admin/clients"
                  className="text-sm font-bold text-navy underline"
                >
                  Manage Users
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {users.length === 0 && (
                  <p className="text-sm text-slate-500">No client users yet.</p>
                )}
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                  >
                    <div>
                      <div className="font-bold text-navy">
                        {user.name || user.email}
                      </div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                    <Link
                      href={`/admin/clients/${user.id}`}
                      className="text-sm font-bold text-navy underline"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">Recent Leads</h2>
              <div className="mt-5 space-y-3">
                {leads.length === 0 && (
                  <p className="text-sm text-slate-500">No leads yet.</p>
                )}
                {leads.map((lead) => (
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
                          lead.message ||
                          lead.property_city ||
                          lead.property_address ||
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
          </div>
        </div>
      </section>
    </main>
  );
}
