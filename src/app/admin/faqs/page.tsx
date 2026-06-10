import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { defaultFaqItems } from "@/lib/defaultFaqKnowledge";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQs | Chat Answer AI" };

type Business = { id: string; name: string };

type ManagedFaq = {
  id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  sort_order: number | null;
};

function statusMessage(saved?: string) {
  if (saved === "created") return "FAQ added.";
  if (saved === "updated") return "FAQ updated.";
  if (saved === "toggled") return "FAQ status changed.";
  if (saved === "deleted") return "FAQ deleted.";
  return null;
}

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; imported?: string; error?: string; saved?: string }>;
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
  const savedMessage = statusMessage(query.saved);

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
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      managedFaqs = (faqRows || []) as ManagedFaq[];
    }
  }

  const selectedRedirect = selectedBusiness ? `/admin/faqs?businessId=${selectedBusiness.id}` : "/admin/faqs";

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav title="FAQs" subtitle="Create and manage the business-specific knowledge the AI should use first." />

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {query.imported && (
          <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
            Default FAQs imported. They should now appear below as Managed FAQs for the selected business.
          </div>
        )}
        {savedMessage && (
          <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
            {savedMessage}
          </div>
        )}
        {errorMessage && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

        {!selectedBusiness ? (
          <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
            No business found. Create a business before adding FAQs.
          </div>
        ) : (
          <>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy">Business FAQ Controls</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose the business, add custom FAQs, or import the starter FAQ library. The AI checks these managed FAQs before using general fallback answers.
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
                      Import Starter FAQs
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-navy">Add a business FAQ</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add question-and-answer pairs that reflect what this specific business wants the AI to say.
              </p>

              <form action="/api/admin/faqs" method="post" className="mt-5 grid gap-4">
                <input type="hidden" name="action" value="create" />
                <input type="hidden" name="business_id" value={selectedBusiness.id} />
                <input type="hidden" name="redirect_to" value={selectedRedirect} />
                <label className="block text-sm font-semibold text-slate-700">
                  Question
                  <input
                    name="question"
                    required
                    placeholder="Example: What services do you offer?"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Answer
                  <textarea
                    name="answer"
                    required
                    placeholder="Enter the approved answer the AI should use."
                    className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
                <div>
                  <button type="submit" className="rounded-full bg-gold px-6 py-3 text-sm font-black text-navy">
                    Add FAQ
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy">Managed FAQs for {selectedBusiness.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These are the business-specific FAQs the AI will check before general fallback answers. Edit, disable, or delete them below.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                  {managedFaqs.length} managed FAQs
                </div>
              </div>

              {managedFaqs.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No Managed FAQs have been added for this business yet. Add a custom FAQ above or click <strong>Import Starter FAQs</strong>.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {managedFaqs.map((faq, index) => (
                    <details key={faq.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <summary className="cursor-pointer font-bold text-navy">
                        {index + 1}. {faq.question} {!faq.is_enabled && <span className="text-xs text-red-600">(Disabled)</span>}
                      </summary>

                      <form action="/api/admin/faqs" method="post" className="mt-4 grid gap-4">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="business_id" value={selectedBusiness.id} />
                        <input type="hidden" name="faq_id" value={faq.id} />
                        <input type="hidden" name="redirect_to" value={selectedRedirect} />
                        <label className="block text-sm font-semibold text-slate-700">
                          Question
                          <input
                            name="question"
                            defaultValue={faq.question}
                            required
                            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          Answer
                          <textarea
                            name="answer"
                            defaultValue={faq.answer}
                            required
                            className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </label>
                        <div>
                          <button type="submit" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white">
                            Save FAQ
                          </button>
                        </div>
                      </form>

                      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                        <form action="/api/admin/faqs" method="post">
                          <input type="hidden" name="action" value="toggle" />
                          <input type="hidden" name="business_id" value={selectedBusiness.id} />
                          <input type="hidden" name="faq_id" value={faq.id} />
                          <input type="hidden" name="is_enabled" value={faq.is_enabled ? "false" : "true"} />
                          <input type="hidden" name="redirect_to" value={selectedRedirect} />
                          <button type="submit" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
                            {faq.is_enabled ? "Disable" : "Enable"}
                          </button>
                        </form>

                        <form action="/api/admin/faqs" method="post">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="business_id" value={selectedBusiness.id} />
                          <input type="hidden" name="faq_id" value={faq.id} />
                          <input type="hidden" name="redirect_to" value={selectedRedirect} />
                          <button type="submit" className="rounded-full border border-red-200 px-5 py-2 text-sm font-bold text-red-700">
                            Delete
                          </button>
                        </form>
                      </div>
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
              <h2 className="text-xl font-bold text-navy">Starter FAQ Library</h2>
              <p className="mt-1 text-sm text-slate-500">
                This built-in library is available as a starting point. Import it above when you want the questions visible and editable for a business.
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
