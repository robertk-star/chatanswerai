import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Form Builder | ChatarAI" };

const fieldTypes = ["text", "textarea", "email", "phone", "number", "date", "select", "yes_no"];

type Params = { saved?: string; error?: string };

function message(value?: string) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ClientFormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let fields: any[] = [];
  let businessName = "Your Business";
  let errorMessage: string | null = message(query.error);
  const savedMessage = message(query.saved);

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const [businessResult, fieldsResult] = await Promise.all([
      supabase.from("businesses").select("name").eq("id", session.businessId).maybeSingle(),
      supabase
        .from("widget_form_fields")
        .select("*")
        .eq("business_id", session.businessId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    businessName = businessResult.data?.name || businessName;
    if (fieldsResult.error) errorMessage = fieldsResult.error.message;
    fields = fieldsResult.data || [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link href="/client" className="text-sm font-bold text-slate-500 underline">
            Back to Client Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-black text-navy">Widget Form Builder</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose the fields visitors see when they submit an inquiry for {businessName}.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {savedMessage && <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">{savedMessage}</div>}
        {errorMessage && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Field Library</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Load the starter library with common fields for service businesses, B2B, appointments, legal, auto, home services, and med spa use cases.
              </p>
            </div>
            <form action="/api/client/form-fields" method="post">
              <input type="hidden" name="action" value="seed" />
              <button className="rounded-full bg-gold px-6 py-3 text-sm font-black text-navy" type="submit">
                Load / Refresh Field Library
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add Custom Field</h2>
          <form action="/api/client/form-fields" method="post" className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="action" value="create" />
            <label className="block text-sm font-semibold text-slate-700">
              Field Label
              <input name="label" required placeholder="Example: License Number" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Field Key
              <input name="field_key" placeholder="license_number" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Field Type
              <select name="field_type" defaultValue="text" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3">
                {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Sort Order
              <input name="sort_order" type="number" defaultValue="999" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              Placeholder
              <input name="placeholder" placeholder="Helper text shown inside the field" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              Options for dropdowns
              <textarea name="options" placeholder={"Option 1\nOption 2\nOption 3"} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="is_enabled" type="checkbox" defaultChecked className="h-5 w-5" /> Show field
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="is_required" type="checkbox" className="h-5 w-5" /> Required
            </label>
            <div className="md:col-span-2">
              <button className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white" type="submit">Add Field</button>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-navy">Your Widget Fields</h2>
              <p className="mt-1 text-sm text-slate-500">Enable, require, rename, reorder, or delete fields.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{fields.length} fields</div>
          </div>

          {fields.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No fields yet. Click <strong>Load / Refresh Field Library</strong> to start.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {fields.map((field) => (
                <details key={field.id} className="rounded-2xl border border-slate-200 bg-white p-4" open={field.is_enabled}>
                  <summary className="cursor-pointer font-bold text-navy">
                    {field.sort_order}. {field.label} <span className="text-xs text-slate-500">({field.field_type})</span> {!field.is_enabled && <span className="text-xs text-red-600"> Disabled</span>} {field.is_required && <span className="text-xs text-green-700"> Required</span>}
                  </summary>

                  <form action="/api/client/form-fields" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="id" value={field.id} />
                    <label className="block text-sm font-semibold text-slate-700">
                      Label
                      <input name="label" defaultValue={field.label || ""} required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Field Type
                      <select name="field_type" defaultValue={field.field_type || "text"} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3">
                        {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Sort Order
                      <input name="sort_order" type="number" defaultValue={field.sort_order || 0} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Field Key
                      <input value={field.field_key || ""} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                      Placeholder
                      <input name="placeholder" defaultValue={field.placeholder || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                      Options for dropdowns
                      <textarea name="options" defaultValue={field.options || ""} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input name="is_enabled" type="checkbox" defaultChecked={field.is_enabled} className="h-5 w-5" /> Show field
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input name="is_required" type="checkbox" defaultChecked={field.is_required} className="h-5 w-5" /> Required
                    </label>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white" type="submit">Save Field</button>
                    </div>
                  </form>

                  {!field.is_system && (
                    <form action="/api/client/form-fields" method="post" className="mt-3 border-t border-slate-100 pt-3">
                      <input type="hidden" name="action" value="delete" />
                      <input type="hidden" name="id" value={field.id} />
                      <button className="rounded-full border border-red-200 px-5 py-2 text-sm font-bold text-red-700" type="submit">Delete Field</button>
                    </form>
                  )}
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
