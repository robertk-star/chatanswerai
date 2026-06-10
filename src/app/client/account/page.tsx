import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";

export const metadata = { title: "Client Account | ChatAnswerAI" };

export default async function ClientAccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  return (
    <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><div><Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link><h1 className="mt-2 text-2xl font-bold text-navy">Account</h1><p className="text-sm text-slate-500">{session.email}</p></div><form action="/api/client/logout" method="post"><button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button></form></div></header><section className="mx-auto max-w-5xl px-6 py-8">{query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Password updated.</div>}{query.error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Password could not be updated.</div>}<div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"><h2 className="text-xl font-bold text-navy">Change Password</h2><form action="/api/client/account/password" method="post" className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Current Password<input name="current_password" type="password" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label><label className="block text-sm font-semibold text-slate-700">New Password<input name="new_password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label><label className="block text-sm font-semibold text-slate-700">Confirm New Password<input name="confirm_password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label><button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">Update Password</button></form></div></section></main>
  );
}
