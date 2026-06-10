import Link from "next/link";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";

const features = [
  [
    "Answers business questions",
    "Uses each business profile, services, service area, custom instructions, and managed FAQs before using a safe fallback.",
  ],
  [
    "Captures service inquiries",
    "Collects name, email, phone, company, service needed, message, and preferred timeline through a simple lead form.",
  ],
  [
    "Supports business types",
    "Start with General Service Business, Background Screening, Home Buyer, Roofing, HVAC, Plumbing, Med Spa, Law Firm, and Auto Services.",
  ],
  [
    "Sends lead notifications",
    "New leads save in the dashboard and can send email notifications to the business owner or active client users.",
  ],
  [
    "Works on existing sites",
    "Install the widget with one script tag. No full website rebuild is required.",
  ],
  [
    "Client dashboard included",
    "Clients can review leads, update settings, copy the embed script, manage FAQs, and customize their widget.",
  ],
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49/mo",
    label: "1 widget site",
    text: "Everything included for one business website.",
  },
  {
    name: "Pro",
    price: "$99/mo",
    label: "Up to 4 sites/accounts",
    text: "Everything included for businesses or agencies managing multiple sites or accounts.",
  },
];

const faqs = [
  [
    "Is this only for home buyers?",
    "No. Home Buyer is now one supported business template. The platform can also be configured for background screening, roofing, HVAC, plumbing, med spas, law firms, auto services, and general local service businesses.",
  ],
  [
    "Can each company customize the AI?",
    "Yes. Each business can set its business type, description, services offered, services not offered, service area, target customer, custom AI instructions, disclaimers, FAQs, widget text, colors, and phone button.",
  ],
  [
    "Will the assistant make up answers?",
    "The assistant should prioritize business-specific FAQs and settings. If the business knowledge does not support an answer, it uses a safe fallback and invites the visitor to send an inquiry.",
  ],
  [
    "Can I test SaffHire with this?",
    "Yes. SaffHire can be set up as a Background Screening business so the assistant answers general employer screening questions without giving legal advice.",
  ],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicSiteHeader />

      <section className="bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
              AI lead-capture chat for service businesses
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-navy md:text-6xl">
              Turn more website visitors into service inquiries.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Chat Answer AI answers visitor questions, uses business-specific
              FAQs, opens a service inquiry form, and sends leads to your team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/widget-demo"
                className="rounded-full bg-gold px-7 py-4 text-base font-black text-navy shadow-soft"
              >
                View Widget Demo
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-black text-navy"
              >
                Request Early Access
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-5 shadow-soft ring-1 ring-slate-200">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black">Service Inquiry Assistant</div>
                  <div className="text-sm text-slate-300">
                    Example conversation
                  </div>
                </div>
                <div className="rounded-full bg-gold px-3 py-1 text-xs font-black text-navy">
                  LIVE DEMO
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">
                  Hi! I can answer questions about this business and help
                  collect a service inquiry.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-gold p-4 text-sm font-semibold leading-6 text-navy">
                  Do you offer employment background checks?
                </div>
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-sm leading-6">
                  Yes, employment background screening is listed as a service.
                  Send an inquiry and the team can follow up with details.
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-gold p-4 text-center font-black text-navy">
                Request Information
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-navy">
          Built for service-business lead capture.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Visitors often have questions before they submit a form. The widget
          helps answer supported questions and moves ready visitors into a
          structured inquiry form.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <div
              key={title}
              className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"
            >
              <h3 className="text-xl font-black text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black text-navy">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              [
                "1",
                "Create profile",
                "Add the business type, services, service area, FAQs, and widget settings.",
              ],
              [
                "2",
                "Install widget",
                "Copy one script tag to the customer website.",
              ],
              [
                "3",
                "Capture leads",
                "The widget answers supported questions and opens the service inquiry form.",
              ],
              [
                "4",
                "Follow up",
                "Leads save in the dashboard and can trigger email notifications.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold font-black text-navy">
                  {number}
                </div>
                <h3 className="font-black text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black">Simple pricing</h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            Two early-access plans. Both include the widget, dashboard,
            settings, FAQs, and lead email notifications.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10"
              >
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-300">
                  {plan.label}
                </div>
                <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
                <div className="mt-4 text-4xl font-black text-gold">
                  {plan.price}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {plan.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-4xl font-black text-navy">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map(([q, a]) => (
            <details
              key={q}
              className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200"
            >
              <summary className="cursor-pointer font-black text-navy">
                {q}
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-amber-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-4xl font-black text-navy">
            Ready to test Chat Answer AI?
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Start with one business, configure the knowledge settings, and
            install the widget on the site.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/widget-demo"
              className="rounded-full bg-gold px-7 py-4 font-black text-navy"
            >
              View Widget Demo
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 bg-white px-7 py-4 font-black text-navy"
            >
              Request Early Access
            </Link>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
