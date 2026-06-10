import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { defaultFaqItems } from "@/lib/defaultFaqKnowledge";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQs | ChatAnswerAI" };

type Business = { id: string; name: string };

type ManagedFaq = {
  id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  sort_order: number | null;
};

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; imported?: string; error?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  let businesses: Business[] = [];
  let selectedBusiness: Business | null = null;
  let managedFaqs: ManagedFaq[] = [];
  let errorMessage: string | null = query.error ? "The FAQ action could not be completed." : null;

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const { data: businessRows } = await supabase
      .from("businesses")
      .select("id, name")
      .order("created_at", { ascending: true });

    businesses = (businessRows || []) as Business[];
    selectedBusiness = businesses.find((business) => business.id === query.businessId) || businesses[0] || null;

    if (selectedBusiness) {
      const { data: faqRows } = await supabase
        .from("managed_faq_items")
        .select("id, question, answer, is_enabled, sort_order")
        .eq("business_id", selectedBusiness.id)
        .order("sort_order", { ascending: true });

      managedFaqs = (faqRows || []) as ManagedFaq[];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav title="FAQs" subtitle="Review the approved Top 100 FAQ library and import it into a business." />

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {query.imported && (
          <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
            Top 100 FAQs imported. They should now appear below as Managed FAQs for the selected business.
          </div>
        )}
        {errorMessage && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        {!selectedBusiness ? (
          <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
            No business found. Create a business before importing FAQs.
          </div>
        ) : (
          <>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy">Business FAQ Controls</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose the business, then import the approved Top 100 questions into that business's Managed FAQs.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <form method="get" action="/admin/faqs" className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="businessId">Business</label>
                    <select
                      id="businessId"
                      name="businessId"
                      defaultValue={selectedBusiness.id}
                      className="min-w-72 rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    >
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>{business.name}</option>
                      ))}
                    </select>
                    <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy" type="submit">
                      View Business FAQs
                    </button>
                  </form>

                  <form action="/api/admin/settings/faqs/import-defaults" method="post">
                    <input type="hidden" name="business_id" value={selectedBusiness.id} />
                    <input type="hidden" name="redirect_to" value={`/admin/faqs?businessId=${selectedBusiness.id}&imported=1`} />
                    <button className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy" type="submit">
                      Import Top 100 FAQs
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy">Managed FAQs for {selectedBusiness.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These are the business-specific FAQs the AI will check before the global FAQ library.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                  {managedFaqs.length} managed FAQs
                </div>
              </div>

              {managedFaqs.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No Managed FAQs have been imported for this business yet. Click <strong>Import Top 100 FAQs</strong> above.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {managedFaqs.map((faq, index) => (
                    <details key={faq.id} className="rounded-2xl border border-slate-200 p-4">
                      <summary className="cursor-pointer font-bold text-navy">
                        {index + 1}. {faq.question}
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{faq.answer}</p>
                      {!faq.is_enabled && <p className="mt-3 text-xs font-bold text-red-600">Disabled</p>}
                    </details>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Global Top 100 FAQ Library</h2>
              <p className="mt-1 text-sm text-slate-500">
                This built-in library is always available as a fallback. Import it above when you want the questions visible and editable for a business.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              {defaultFaqItems.length} default FAQs
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {defaultFaqItems.map((faq, index) => (
              <details key={faq.id} className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-bold text-navy">
                  {index + 1}. {faq.question}
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
