import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client User Detail | ChatAnswerAI" };

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getBusinessName(value: any) {
  if (!value) return "—";
  if (Array.isArray(value)) return value[0]?.name || "—";
  return value.name || "—";
}

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; message?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const [userResult, businessesResult] = await Promise.all([
    supabase
      .from("business_users")
      .select(
        "id, created_at, updated_at, business_id, email, name, role, is_active, last_login_at, businesses(name)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("businesses")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const user = userResult.data;
  if (!user) notFound();

  const businesses = businessesResult.data || [];
  const businessName = getBusinessName(user.businesses);
  const errorMessages: Record<string, string> = {
    business_required: "Please select a business before saving.",
    email_required: "Email is required before saving.",
    role_invalid: "Please select a valid role before saving.",
    password_short:
      "Password must be at least 8 characters. Leave the password blank if you do not want to change it.",
    supabase:
      "Database connection is missing. Check the Supabase environment variables.",
    database: query.message
      ? decodeURIComponent(query.message)
      : "Database update failed. The email may already be used by another client user.",
    "1": "Client user could not be saved. Check required fields and password length.",
  };
  const saveMessage =
    query.saved === "password"
      ? "Client user saved and password updated."
      : "Client user saved.";
  const errorMessage = query.error
    ? errorMessages[query.error] || "Client user could not be saved."
    : "";

  const [leadStatsResult, recentLeadsResult, sitesResult] = await Promise.all([
    supabase
      .from("seller_leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", user.business_id),
    supabase
      .from("seller_leads")
      .select(
        "id, created_at, name, phone, property_city, property_address, service_needed, message, status",
      )
      .eq("business_id", user.business_id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("widget_sites")
      .select("id, site_id, name, site_name, domain, is_active")
      .eq("business_id", user.business_id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const recentLeads = recentLeadsResult.data || [];
  const sites = sitesResult.data || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/clients"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Client Users
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">
              {user.name || user.email}
            </h1>
            <p className="text-sm text-slate-500">
              {businessName} · {user.is_active ? "Active" : "Inactive"}
            </p>
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
              {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Edit Client User</h2>
            <form
              action={`/api/admin/clients/${user.id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-semibold text-slate-700">
                Business *
                <select
                  name="business_id"
                  required
                  defaultValue={user.business_id || ""}
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
                Name
                <input
                  name="name"
                  defaultValue={user.name || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email *
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Role
                <select
                  name="role"
                  defaultValue={user.role || "owner"}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                New Password
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current password"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
                <span className="mt-2 block text-xs font-medium text-slate-500">
                  Use at least 8 characters. Leave this blank if you only want
                  to update the name, email, role, business, or active status.
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={user.is_active !== false}
                />{" "}
                Active
              </label>

              <button
                className="rounded-full bg-gold px-7 py-3 font-bold text-navy"
                type="submit"
              >
                Save Client User
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Account Details</h2>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Created", formatDate(user.created_at)],
                ["Updated", formatDate(user.updated_at)],
                ["Last Login", formatDate(user.last_login_at)],
                ["Total Business Leads", String(leadStatsResult.count ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-navy">
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-navy">Business Access</h2>
              {user.business_id && (
                <Link
                  href={`/admin/businesses/${user.business_id}`}
                  className="text-sm font-bold text-navy underline"
                >
                  Open Business
                </Link>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              This client user can access leads and widget sites for{" "}
              {businessName}.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">
              Recent Business Leads
            </h2>
            <div className="mt-5 space-y-3">
              {recentLeads.length === 0 && (
                <p className="text-sm text-slate-500">No leads yet.</p>
              )}
              {recentLeads.map((lead: any) => (
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
            <h2 className="text-xl font-bold text-navy">Widget Sites</h2>
            <div className="mt-5 space-y-3">
              {sites.length === 0 && (
                <p className="text-sm text-slate-500">No widget sites yet.</p>
              )}
              {sites.map((site: any) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <div className="font-bold text-navy">
                      {site.site_name || site.name || site.site_id}
                    </div>
                    <div className="text-sm text-slate-500">
                      {site.domain || "No domain"} ·{" "}
                      {site.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <Link
                    href={`/admin/sites/${site.id}`}
                    className="text-sm font-bold text-navy underline"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
