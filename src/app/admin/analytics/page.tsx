import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics | ChatAnswerAI" };

function countBy(rows: any[], key: string) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const value = row[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let events: any[] = [];
  let leads: any[] = [];
  let errorMessage: string | null = null;

  if (!supabase) errorMessage = "Supabase is not configured.";
  else {
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const er = await supabase.from("widget_events").select("*").gte("created_at", since7).order("created_at", { ascending: false }).limit(250);
    const lr = await supabase.from("seller_leads").select("*").gte("created_at", since7).order("created_at", { ascending: false }).limit(250);
    if (er.error) errorMessage = er.error.message;
    events = er.data || [];
    leads = lr.data || [];
  }

  const eventTypes = countBy(events, "event_type");
  const domains = countBy(events, "domain");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div><Link href="/admin" className="text-sm font-bold text-slate-500 underline">Back to Admin</Link><h1 className="mt-2 text-2xl font-bold text-navy">Analytics</h1><p className="text-sm text-slate-500">Widget events and leads from the last 7 days.</p></div><form action="/api/admin/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form></div></header>
      <section className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Events</p><p className="mt-2 text-4xl font-bold text-navy">{events.length}</p></div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Leads</p><p className="mt-2 text-4xl font-bold text-navy">{leads.length}</p></div>
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Lead Rate</p><p className="mt-2 text-4xl font-bold text-navy">{events.length ? Math.round((leads.length / events.length) * 100) : 0}%</p></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"><h2 className="text-xl font-bold text-navy">Events by Type</h2><div className="mt-4 space-y-2">{eventTypes.map(([label, count]) => <div key={label} className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"><span>{label}</span><strong>{count}</strong></div>)}</div></div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"><h2 className="text-xl font-bold text-navy">Events by Domain</h2><div className="mt-4 space-y-2">{domains.map(([label, count]) => <div key={label} className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-sm"><span>{label}</span><strong>{count}</strong></div>)}</div></div>
        </div>
      </section>
    </main>
  );
}
