import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Terms of Service | ChatAnswerAI",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />
      <article className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-navy">Terms of Service</h1>
        <p className="mt-5 text-slate-600">Last updated: 2026</p>
        <div className="prose prose-slate mt-8 max-w-none">
          <p>These are placeholder terms for ChatAnswerAI. They should be reviewed by a qualified attorney before public launch.</p>
          <h2>Product use</h2>
          <p>ChatAnswerAI is a lead capture, intake, and website widget platform. It does not make property offers, provide legal advice, provide financial advice, or guarantee results.</p>
          <h2>Customer responsibility</h2>
          <p>Customers are responsible for their own advertising claims, follow-up practices, legal compliance, and use of lead information.</p>
          <h2>Service availability</h2>
          <p>The service may change over time and may depend on third-party infrastructure and integrations.</p>
          <h2>Contact</h2>
          <p>Contact ChatAnswerAI for questions about these terms.</p>
        </div>
      </article>
      <PublicSiteFooter />
    </main>
  );
}
