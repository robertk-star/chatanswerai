import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Contact | ChatAnswerAI",
  description: "Request early access to ChatAnswerAI.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <h1 className="text-5xl font-black text-navy">Request early access.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            ChatAnswerAI is being prepared for cash home buyers who want better seller lead capture from their existing websites.
          </p>

          <div className="mt-8 rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="font-black text-navy">Good fit for:</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>✓ Cash home buyer websites</li>
              <li>✓ We-buy-houses companies</li>
              <li>✓ Real estate investor lead-gen sites</li>
              <li>✓ Motivated seller landing pages</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-navy">Early access form</h2>
          <p className="mt-2 text-sm text-slate-500">This form is a placeholder for now. Use email or your preferred contact workflow until the public inquiry backend is added.</p>

          <form className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Name<input className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Email<input type="email" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Company<input className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Website<input placeholder="example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Message<textarea className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
            <button type="button" className="rounded-full bg-gold px-7 py-3 font-black text-navy">Submit Request</button>
          </form>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
