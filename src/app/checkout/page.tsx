import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Start ChatAnswerAI | ChatAnswerAI",
  description: "Enter your email to request access to ChatAnswerAI while billing is being set up.",
};

const planDetails: Record<string, { name: string; price: string; limit: string; description: string }> = {
  starter: {
    name: "Starter",
    price: "$49/month",
    limit: "1 widget site",
    description: "Everything included for one cash home buyer website.",
  },
  pro: {
    name: "Pro",
    price: "$99/month",
    limit: "Up to 4 sites/accounts",
    description: "Everything included for multiple sites, markets, or client/demo accounts.",
  },
};

function cleanPlan(value?: string) {
  return value === "pro" ? "pro" : "starter";
}

export default async function CheckoutPlaceholderPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const params = await searchParams;
  const planKey = cleanPlan(params.plan);
  const plan = planDetails[planKey];
  const errorMessage = params.error ? "Please enter a valid email address." : null;

  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            Stripe placeholder
          </div>
          <h1 className="text-5xl font-black text-navy">Request access to {plan.name}.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Billing is not turned on yet. Enter your email and we will contact you to set up your ChatAnswerAI account manually.
          </p>

          <div className="mt-8 rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-navy">{plan.name}</h2>
            <div className="mt-3 text-4xl font-black text-navy">{plan.price}</div>
            <p className="mt-3 text-sm font-bold text-slate-700">{plan.limit}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{plan.description}</p>
            <Link href="/pricing" className="mt-5 inline-flex text-sm font-bold text-navy underline">
              Compare plans
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-navy">Where should we send your setup info?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This replaces Stripe for now. After you submit, we will have the plan and contact details needed to follow up.
          </p>

          {errorMessage && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}

          <form action="/api/checkout/request" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="plan" value={planKey} />
            <label className="block text-sm font-semibold text-slate-700">
              Email *
              <input name="email" type="email" required placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input name="name" placeholder="Your name" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Phone
              <input name="phone" placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Business / Website
              <input name="business" placeholder="Company name or website" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <button type="submit" className="w-full rounded-full bg-gold px-7 py-4 font-black text-navy">
              Continue with {plan.name}
            </button>
          </form>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
