import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { planLabel } from "@/lib/planLimits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Businesses | CashOfferChat" };

type Business = {
  id: string;
  created_at: string;
  name: string;
  slug: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  primary_market: string | null;
  is_active: boolean | null;
  plan_name: string | null;
  max_widget_sites: number | null;
};

type CountMap = Record<string, number>;

function countByBusiness(rows: Array<{ business_id: string | null }> | null | undefined) {
  const counts: CountMap = {};
  for (const row of rows || []) {
    if (!row.business_id) continue;
    counts[row.business_id] = (counts[row.business_id] || 0) + 1;
  }
  return counts;
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ leadDeleted?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let businesses: Business[] = [];
  let leadCounts: CountMap = {};
  let siteCounts: CountMap = {};
  let userCounts: CountMap = {};
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, created_at, name, slug, website, phone, email, primary_market, is_active, plan_name, max_widget_sites")
      .order("created_at", { ascending: false });

    if (error) errorMessage = error.message;
    businesses = (data || []) as Business[];

    const [leadsResult, sitesResult, usersResult] = await Promise.all([
      supabase.from("seller_leads").select("business_id"),
      supabase.from("widget_sites").select("business_id"),
      supabase.from("business_users").select("business_id"),
    ]);

    leadCounts = countByBusiness(leadsResult.data as Array<{ business_id: string | null }> | null);
    siteCounts = countByBusiness(sitesResult.data as Array<{ business_id: string | null }> | null);
    userCounts = countByBusiness(usersResult.data as Array<{ business_id: string | null }> | null);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/admin" className="text-sm font-bold text-slate-500 underline">Back to Admin</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Businesses</h1>
            <p className="text-sm text-slate-500">Master admin directory for onboarded businesses.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/onboarding" className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy">
              Onboard Business
            </Link>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.leadDeleted && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Lead deleted and reset.</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Business</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Leads</th>
                <th className="px-5 py-4">Sites</th>
                <th className="px-5 py-4">Users</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={8}>No businesses yet.</td></tr>
              )}
              {businesses.map((business) => {
                const siteCount = siteCounts[business.id] || 0;
                const maxSites = business.max_widget_sites || (business.plan_name === "pro" ? 4 : 1);
                return (
                  <tr key={business.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy">{business.name}</div>
                      <div className="text-xs text-slate-500">{business.slug || business.id}</div>
                      {business.website && <div className="mt-1 text-xs text-slate-500">{business.website}</div>}
                    </td>
                    <td className="px-5 py-4 text-slate-600"><div>{business.phone || "—"}</div><div>{business.email || ""}</div></td>
                    <td className="px-5 py-4 text-slate-600"><div className="font-bold text-navy">{planLabel(business.plan_name)}</div><div className="text-xs text-slate-500">{siteCount}/{maxSites} sites</div></td>
                    <td className="px-5 py-4 font-bold text-navy">{leadCounts[business.id] || 0}</td>
                    <td className="px-5 py-4 font-bold text-navy">{siteCount}</td>
                    <td className="px-5 py-4 font-bold text-navy">{userCounts[business.id] || 0}</td>
                    <td className="px-5 py-4"><span className={business.is_active === false ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700" : "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"}>{business.is_active === false ? "Inactive" : "Active"}</span></td>
                    <td className="px-5 py-4"><Link href={`/admin/businesses/${business.id}`} className="font-bold text-navy underline">Open</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
