export const metadata = { title: "Client Login | CashOfferChat" };

export default async function ClientLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
        <p className="mb-4 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">CashOfferChat Client Portal</p>
        <h1 className="text-3xl font-bold text-navy">Client Login</h1>
        {params.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Invalid email or password.</p>}
        <form action="/api/client/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Email<input name="email" type="email" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
          <label className="block text-sm font-semibold text-slate-700">Password<input name="password" type="password" required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
          <button className="w-full rounded-full bg-navy px-5 py-3 font-bold text-white" type="submit">Log In</button>
        </form>
      </div>
    </main>
  );
}
