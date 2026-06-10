export const metadata = { title: "Admin Login | CashOfferChat" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-navy">Admin Login</h1>
        <p className="mt-3 text-sm text-slate-600">Enter the dashboard password.</p>
        {params.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Invalid password.</p>}
        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input name="password" type="password" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-gold" />
          </label>
          <button className="w-full rounded-full bg-navy px-5 py-3 font-bold text-white" type="submit">Log In</button>
        </form>
      </div>
    </main>
  );
}
