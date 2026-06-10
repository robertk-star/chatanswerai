import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Request Received | ChatAnswerAI",
  description: "Your ChatAnswerAI request was received.",
};

const planLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
};

function cleanPlan(value?: string) {
  return value === "pro" ? "pro" : "starter";
}

export default async function CheckoutThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const planKey = cleanPlan(params.plan);

  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mx-auto inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
          Request received
        </div>
        <h1 className="mt-6 text-5xl font-black text-navy">We have your {planLabels[planKey]} request.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Stripe checkout is not active yet, so we saved your request and will contact you with the next setup steps.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="https://www.sellmyhousetodayanywhere.com/" className="rounded-full bg-gold px-7 py-4 font-black text-navy">
            View Live Demo Site
          </Link>
          <Link href="/pricing" className="rounded-full border border-slate-300 bg-white px-7 py-4 font-black text-navy">
            Back to Pricing
          </Link>
        </div>
      </section>
      <PublicSiteFooter />
    </main>
  );
}
