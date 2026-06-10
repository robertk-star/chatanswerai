import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

export const metadata = {
  title: "Contact | Chat Answer AI",
  description: "Request early access to Chat Answer AI.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicSiteHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <h1 className="text-5xl font-black text-navy">Request early access.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Chat Answer AI is being prepared for service businesses that want to answer website visitor questions, capture better inquiries, and follow up with more qualified leads.
          </p>

          <div className="mt-8 rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="font-black text-navy">Good fit for:</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>✓ Background screening companies</li>
              <li>✓ Roofing, HVAC, plumbing, and home services</li>
              <li>✓ Med spas, auto services, and local service businesses</li>
              <li>✓ Law firms and professional-service intake pages</li>
              <li>✓ Home buyer websites as one supported template</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-navy">Early access form</h2>
          <p className="mt-2 text-sm text-slate-500">
            This form is a placeholder for now. Use email or your preferred contact workflow until the public inquiry backend is added.
          </p>

          <form className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input type="email" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Company
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Website
              <input placeholder="example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Business type or service area
              <input placeholder="Background screening, HVAC, med spa, law firm, etc." className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Message
              <textarea className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            <button type="button" className="rounded-full bg-gold px-7 py-3 font-black text-navy">
              Submit Request
            </button>
          </form>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
