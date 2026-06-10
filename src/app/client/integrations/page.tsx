import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations | CashOfferChat" };

export default async function ClientIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; tested?: string; testError?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let businessName = "Your Business";
  let settings: any = {};
  let errorMessage: string | null = query.error ? "Integration settings could not be saved." : null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const [businessResult, settingsResult] = await Promise.all([
      supabase.from("businesses").select("name").eq("id", session.businessId).maybeSingle(),
      supabase.from("business_settings").select("webhook_enabled, webhook_url, webhook_secret").eq("business_id", session.businessId).maybeSingle(),
    ]);

    businessName = businessResult.data?.name || businessName;
    settings = settingsResult.data || {};
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/client" className="text-sm font-bold text-slate-500 underline">Back to Client Dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Integrations</h1>
            <p className="text-sm text-slate-500">{businessName} · Send leads to your CRM or automation tools.</p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Integration settings saved.</div>}
        {query.tested && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Test webhook sent successfully.</div>}
        {query.testError && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Test webhook failed: {query.testError}</div>}
        {errorMessage && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Lead Webhook</h2>
          <p className="mt-2 text-sm text-slate-600">
            Send new seller leads to Zapier, Make, GoHighLevel, Google Sheets, HubSpot, or another system that accepts webhooks.
          </p>

          <form action="/api/client/integrations" method="post" className="mt-6 space-y-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="webhook_enabled" type="checkbox" defaultChecked={settings.webhook_enabled === true} /> Enable webhook delivery
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Webhook URL
              <input
                name="webhook_url"
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                defaultValue={settings.webhook_url || ""}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Webhook Secret
              <input
                name="webhook_secret"
                placeholder="Optional signing secret"
                defaultValue={settings.webhook_secret || ""}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Optional. If set, CashOfferChat sends an X-CashOfferChat-Signature header.
              </span>
            </label>

            <button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">
              Save Integration Settings
            </button>
          </form>

          <form action="/api/client/integrations/test" method="post" className="mt-4">
            <button className="rounded-full border border-slate-300 px-7 py-3 font-bold text-navy" type="submit">
              Send Test Webhook
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Example Payload</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">{`{
  "event": "seller_lead.created",
  "sentAt": "2026-06-02T12:00:00.000Z",
  "businessId": "your-business-id",
  "siteId": "demo",
  "lead": {
    "id": "lead-id",
    "status": "new",
    "name": "Jane Seller",
    "phone": "555-555-5555",
    "email": "jane@example.com",
    "propertyAddress": "123 Main St",
    "propertyCity": "Plano",
    "situation": "Needs repairs",
    "timeline": "ASAP",
    "propertyCondition": "Needs roof work"
  }
}`}</pre>
        </div>
      </section>
    </main>
  );
}
