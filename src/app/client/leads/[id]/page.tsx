import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Lead Detail | CashOfferChat" };

const statuses = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["appointment_set", "Appointment Set"],
  ["quote_sent", "Quote / Info Sent"],
  ["in_progress", "In Progress"],
  ["closed", "Closed"],
  ["not_interested", "Not Interested"],
  ["bad_lead", "Bad Lead"],
  ["referral", "Referral"],
];

export default async function ClientLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
    deleteError?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);
  if (!session) redirect("/client/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: lead } = await supabase
    .from("seller_leads")
    .select("*")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!lead) notFound();

  let messages: any[] = [];
  if (lead.conversation_id) {
    const { data } = await supabase
      .from("conversation_messages")
      .select("id, created_at, role, content")
      .eq("conversation_id", lead.conversation_id)
      .order("created_at", { ascending: true });
    messages = data || [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/client"
              className="text-sm font-bold text-slate-500 underline"
            >
              Back to Client Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">
              {lead.name || "Lead"}
            </h1>
            <p className="text-sm text-slate-500">
              {new Date(lead.created_at).toLocaleString()}
            </p>
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_.9fr]">
        <div className="space-y-6">
          {query.saved && (
            <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
              Lead saved.
            </div>
          )}
          {query.error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Lead could not be saved.
            </div>
          )}
          {query.deleteError && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Lead could not be deleted and reset.
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Lead Details</h2>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Status", lead.status || "new"],
                ["Name", lead.name],
                ["Phone", lead.phone],
                ["Email", lead.email],
                ["Company", lead.company],
                ["Service Needed", lead.service_needed || lead.situation],
                [
                  "Preferred Timeline",
                  lead.preferred_timeline || lead.timeline,
                ],
                ["Message", lead.message || lead.notes],
                ["Legacy Property Address", lead.property_address],
                ["Legacy Property City", lead.property_city],
                ["Legacy Property Condition", lead.property_condition],
                ["Source URL", lead.source_url],
                [
                  "Last Contacted",
                  lead.last_contacted_at
                    ? new Date(lead.last_contacted_at).toLocaleString()
                    : "",
                ],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-navy">
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Lead Message
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {lead.notes || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-red-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-red-700">
              Delete & Reset Lead
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This permanently deletes the lead and clears the related widget
              events, conversation transcript, and tracking records tied to this
              lead. After deletion, the same visitor can submit again without
              this deleted lead counting as already received.
            </p>
            <form
              action={`/api/client/leads/${lead.id}`}
              method="post"
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="action" value="delete" />
              <label className="block text-sm font-semibold text-slate-700">
                Type DELETE to confirm
                <input
                  name="confirm_delete"
                  pattern="DELETE"
                  required
                  className="mt-1 w-full rounded-xl border border-red-200 px-4 py-3"
                />
              </label>
              <button
                className="rounded-full bg-red-600 px-7 py-3 font-bold text-white"
                type="submit"
              >
                Delete Lead and Reset
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-navy">Update Lead</h2>
            <form
              action={`/api/client/leads/${lead.id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-semibold text-slate-700">
                Status
                <select
                  name="status"
                  defaultValue={lead.status || "new"}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  {statuses.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input name="mark_contacted_now" type="checkbox" /> Set last
                contacted to now
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Internal Notes
                <textarea
                  name="admin_notes"
                  defaultValue={lead.admin_notes || ""}
                  className="mt-1 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <button
                className="rounded-full bg-gold px-7 py-3 font-bold text-navy"
                type="submit"
              >
                Save Lead
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-navy">
            Conversation Transcript
          </h2>
          <div className="mt-6 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">No transcript available.</p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "rounded-2xl bg-gold/30 p-4"
                    : "rounded-2xl bg-slate-100 p-4"
                }
              >
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {message.role === "user" ? "Visitor" : "Assistant"}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
