import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";
import { getSystemHealth, type HealthItem } from "@/lib/systemHealth";

export const dynamic = "force-dynamic";
export const metadata = { title: "System Health | ChatAnswerAI" };

function StatusBadge({ status }: { status: HealthItem["status"] }) {
  const classes =
    status === "ok"
      ? "bg-green-50 text-green-700"
      : status === "warning"
        ? "bg-amber-50 text-amber-800"
        : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>{status.toUpperCase()}</span>;
}

function HealthSection({ title, items }: { title: string; items: HealthItem[] }) {
  const errorCount = items.filter((item) => item.status === "error").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const okCount = items.filter((item) => item.status === "ok").length;

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">OK: {okCount}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Warnings: {warningCount}</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Errors: {errorCount}</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.name}>
                <td className="px-4 py-3 font-semibold text-navy">{item.name}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-slate-600">{item.message}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{item.detail || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminSystemPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const health = await getSystemHealth();

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav title="System Health" subtitle="Check configuration, database tables, route availability, and manual QA items." />
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Overall Status</h2>
              <p className="mt-1 text-sm text-slate-500">Last checked: {new Date(health.checkedAt).toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-500">Runtime: {health.environment}</p>
            </div>
            <StatusBadge status={health.overallStatus} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-bold text-navy">How to use this page</div>
            <p className="mt-1">Fix red items first. Yellow items are usually optional services or manual checks.</p>
            <p className="mt-2">In Vercel production, source route files are not checked directly. Protected and dynamic routes are marked as manual checks so they do not create false errors.</p>
            <p className="mt-2">API JSON: <code className="rounded bg-white px-2 py-1">/api/admin/system/health</code></p>
          </div>
        </div>

        <HealthSection title="Environment Variables" items={health.env} />
        <HealthSection title="Supabase Tables" items={health.tables} />
        <HealthSection title="Page Routes" items={health.routes} />
        <HealthSection title="API Routes" items={health.apiRoutes} />
        <HealthSection title="Manual QA Checklist" items={health.qaChecklist} />

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Recommended End-to-End Test Flow</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Open <strong>/admin/onboarding</strong> and create a test business with a unique Site ID.</li>
            <li>Open <strong>/admin/sites</strong> and confirm the widget site exists.</li>
            <li>Open <strong>/admin/clients</strong> and create or confirm a client user.</li>
            <li>Log in at <strong>/client/login</strong>.</li>
            <li>Open <strong>/client/sites</strong> and copy the embed code.</li>
            <li>Open <strong>/widget-demo</strong> or your external demo site and submit a test lead.</li>
            <li>Confirm the lead appears in both <strong>/admin</strong> and <strong>/client</strong>.</li>
            <li>Open the lead detail page and update status/notes.</li>
            <li>Test CSV export and webhook test if configured.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
