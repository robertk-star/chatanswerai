import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Users | CashOfferChat" };

function getBusinessName(value: any) {
  if (!value) return "—";
  if (Array.isArray(value)) return value[0]?.name || "—";
  return value.name || "—";
}

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let businesses: any[] = [];
  let users: any[] = [];
  let errorMessage: string | null = query.error ? "Unable to save client user. Check required fields." : null;

  if (!supabase) errorMessage = "Supabase is not configured.";
  else {
    const br = await supabase.from("businesses").select("id, name").order("name", { ascending: true });
    const ur = await supabase.from("business_users").select("id, email, name, role, is_active, last_login_at, businesses(name)").order("created_at", { ascending: false });
    businesses = br.data || [];
    users = ur.data || [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div><Link href="/admin" className="text-sm font-bold text-slate-500 underline">Back to Admin</Link><h1 className="mt-2 text-2xl font-bold text-navy">Client Users</h1></div>
          <form action="/api/admin/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Client user saved.</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add Client User</h2>
          <form action="/api/admin/clients" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Business *<select name="business_id" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Select a business</option>{businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <label className="block text-sm font-semibold text-slate-700">Name<input name="name" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Email *<input name="email" type="email" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Temporary Password *<input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input name="is_active" type="checkbox" defaultChecked /> Active</label>
            <div className="md:col-span-2"><button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">Save Client User</button></div>
          </form>
        </div>
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Business</th><th className="px-5 py-4">Active</th><th className="px-5 py-4">Last Login</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No client users yet.</td></tr>}
              {users.map((u) => <tr key={u.id}><td className="px-5 py-4"><div className="font-bold text-navy">{u.name || "—"}</div><div className="text-slate-500">{u.email}</div></td><td className="px-5 py-4 text-slate-600">{getBusinessName(u.businesses)}</td><td className="px-5 py-4 text-slate-600">{u.is_active ? "Yes" : "No"}</td><td className="px-5 py-4 text-slate-600">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}</td><td className="px-5 py-4"><Link href={`/admin/clients/${u.id}`} className="text-sm font-bold text-navy underline">Open</Link></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
