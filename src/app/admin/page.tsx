import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-navy">Chat Answer AI Admin</h1>
            <p className="text-sm text-slate-500">Master admin dashboard</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-3">
        <Link className="rounded-3xl bg-white p-6 font-bold text-navy shadow-soft ring-1 ring-slate-200" href="/admin/businesses">Businesses</Link>
        <Link className="rounded-3xl bg-white p-6 font-bold text-navy shadow-soft ring-1 ring-slate-200" href="/admin/onboarding">Onboard Business</Link>
        <Link className="rounded-3xl bg-white p-6 font-bold text-navy shadow-soft ring-1 ring-slate-200" href="/admin/login">Admin Login</Link>
      </section>
    </main>
  );
}
