import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Pricing | ChatAnswerAI",
  description: "Simple ChatAnswerAI pricing for cash home buyer websites.",
};

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "$49/mo",
    badge: "Best for one website",
    description: "For a cash home buyer who wants the widget on one website.",
    features: [
      "1 widget site",
      "Everything included",
      "AI seller Q&A",
      "Structured quote form",
      "Lead dashboard",
      "Email lead notifications",
      "Widget title, subtitle, colors, and phone display controls",
      "Top 100 seller FAQ library",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$99/mo",
    badge: "Best for multiple sites",
    description: "For buyers or agencies managing more than one website/account.",
    features: [
      "Up to 4 widget sites/accounts",
      "Everything in Starter",
      "Multiple client/site setup",
      "Separate site IDs and embed scripts",
      "Business-specific settings",
      "Lead dashboard and email notifications",
      "FAQ and widget customization",
      "Good fit for multiple markets or demo/client sites",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            Simple early-access pricing
          </div>
          <h1 className="text-5xl font-black text-navy">Two plans. Everything included.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            ChatAnswerAI is built for cash home buyer websites. Pick Starter for one site or Pro if you need multiple sites/accounts.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
              <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600">
                {plan.badge}
              </div>
              <h2 className="mt-5 text-3xl font-black text-navy">{plan.name}</h2>
              <div className="mt-4 text-5xl font-black text-navy">{plan.price}</div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link href={`/checkout?plan=${plan.key}`} className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-black text-navy">
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] bg-slate-50 p-6 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
          <strong className="text-navy">Note:</strong> Stripe billing is not active yet. Choose a plan and enter your email so we can set up your account manually.
        </div>
      </section>
      <PublicSiteFooter />
    </main>
  );
}
