import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client FAQs | Chat Answer AI" };

const csvTemplate = `Question,Answer
"What services do you offer?","We offer [list your services here]."
"What areas do you serve?","We serve [list your service area here]."
"How can I get started?","Send a service inquiry and our team will follow up."`;

type ClientFaqSearchParams = {
  saved?: string;
  error?: string;
};

type ManagedFaq = {
  id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  sort_order: number | null;
};

function displayMessage(value?: string) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ClientFaqsPage({
  searchParams,
}: {
  searchParams: Promise<ClientFaqSearchParams>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  let managedFaqs: ManagedFaq[] = [];
  let businessName = "Your Business";
  let errorMessage: string | null = displayMessage(query.error);
  const savedMessage = displayMessage(query.saved);

  if (!supabase) {
    errorMessage = "Supabase is not configured.";
  } else {
    const [businessResult, faqResult] = await Promise.all([
      supabase
        .from("businesses")
        .select("name")
        .eq("id", session.businessId)
        .maybeSingle(),
      supabase
        .from("managed_faq_items")
        .select("id, question, answer, is_enabled, sort_order")
        .eq("business_id", session.businessId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (businessResult.data?.name) businessName = businessResult.data.name;
    if (faqResult.error) errorMessage = faqResult.error.message;
    managedFaqs = (faqResult.data || []) as ManagedFaq[];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {savedMessage && (
          <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
            {savedMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Import FAQs</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Download the CSV template, fill in your questions and answers, then paste the rows below. You can also paste tab-separated questions and answers from a spreadsheet.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplate)}`}
              download="chat-answer-ai-faq-template.csv"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy"
            >
              Download CSV Template
            </a>
          </div>

          <form action="/api/client/faqs" method="post" className="mt-5 grid gap-4">
            <input type="hidden" name="action" value="import" />
            <label className="block text-sm font-semibold text-slate-700">
              Paste FAQs to Import
              <textarea
                name="bulk_faqs"
                placeholder={'Question,Answer\n"What services do you offer?","We offer..."\n"What areas do you serve?","We serve..."'}
                className="mt-1 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm"
              />
            </label>
            <p className="text-xs leading-5 text-slate-500">
              Format: one FAQ per line. Use <strong>Question, Answer</strong> or paste two columns from a spreadsheet. Imports add to your current FAQs and do not delete existing ones.
            </p>
            <div>
              <button type="submit" className="rounded-full bg-gold px-6 py-3 text-sm font-black text-navy">
                Import FAQs
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">Add a FAQ for {businessName}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add approved question-and-answer pairs. The AI checks these business FAQs before using general fallback answers.
          </p>

          <form action="/api/client/faqs" method="post" className="mt-5 grid gap-4">
            <input type="hidden" name="action" value="create" />
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
                placeholder="Enter the answer Chat Answer AI should use."
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
              <h2 className="text-xl font-bold text-navy">Your Managed FAQs</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Edit, enable, disable, or delete FAQs below. Disabled FAQs are saved but not used by the AI.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              {managedFaqs.length} FAQs
            </div>
          </div>

          {managedFaqs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No FAQs have been added yet. Add your first FAQ above or import several FAQs at once.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {managedFaqs.map((faq, index) => (
                <details key={faq.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer font-bold text-navy">
                    {index + 1}. {faq.question} {!faq.is_enabled && <span className="text-xs text-red-600">(Disabled)</span>}
                  </summary>

                  <form action="/api/client/faqs" method="post" className="mt-4 grid gap-4">
                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="faq_id" value={faq.id} />
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
                    <form action="/api/client/faqs" method="post">
                      <input type="hidden" name="action" value="toggle" />
                      <input type="hidden" name="faq_id" value={faq.id} />
                      <input type="hidden" name="is_enabled" value={faq.is_enabled ? "false" : "true"} />
                      <button type="submit" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
                        {faq.is_enabled ? "Disable" : "Enable"}
                      </button>
                    </form>

                    <form action="/api/client/faqs" method="post">
                      <input type="hidden" name="action" value="delete" />
                      <input type="hidden" name="faq_id" value={faq.id} />
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
      </section>
    </main>
  );
}
