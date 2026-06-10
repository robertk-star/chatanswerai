import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Privacy Policy | ChatAnswerAI",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />
      <article className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-navy">Privacy Policy</h1>
        <p className="mt-5 text-slate-600">Last updated: 2026</p>
        <div className="prose prose-slate mt-8 max-w-none">
          <p>This is a placeholder privacy policy for ChatAnswerAI. It should be reviewed by a qualified attorney before public launch.</p>
          <h2>Information collected</h2>
          <p>ChatAnswerAI may collect contact information, property information, chat messages, widget events, and technical metadata submitted through the widget or client portal.</p>
          <h2>How information is used</h2>
          <p>Information may be used to deliver leads to the appropriate business, operate the dashboard, provide support, improve the product, and maintain security.</p>
          <h2>Third-party services</h2>
          <p>ChatAnswerAI may use infrastructure, analytics, email, AI, and webhook services to operate the platform.</p>
          <h2>Contact</h2>
          <p>Contact ChatAnswerAI for questions about this policy.</p>
        </div>
      </article>
      <PublicSiteFooter />
    </main>
  );
}
