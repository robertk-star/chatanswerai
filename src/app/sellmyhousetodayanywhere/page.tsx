import Script from "next/script";

export const metadata = {
  title: "Sell My House Today Anywhere | Cash Home Buyer Demo",
  description:
    "Need to sell your house fast? Sell My House Today Anywhere is a demo cash home buyer site for testing ChatAnswerAI seller intake.",
};

const serviceAreas = [
  "Plano",
  "Frisco",
  "McKinney",
  "Allen",
  "Richardson",
  "Carrollton",
  "Garland",
  "Lewisville",
  "Dallas",
];

const situations = [
  "House needs repairs",
  "Inherited property",
  "Behind on payments",
  "Vacant property",
  "Tenant-occupied rental",
  "Fire or water damage",
  "Relocation",
  "Tired landlord",
];

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-xl font-black tracking-tight text-slate-950">
          Sell My House Today Anywhere
        </a>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 lg:flex">
          <a href="#how-it-works">How It Works</a>
          <a href="#situations">Situations</a>
          <a href="#areas">Areas</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:9725550100"
            className="hidden rounded-full border border-slate-300 px-5 py-2 text-sm font-black text-slate-900 sm:inline-flex"
          >
            Call 972-555-0100
          </a>
          <a
            href="#request-offer"
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-slate-950 shadow-sm"
          >
            Request Cash Offer
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <div className="text-xl font-black">Sell My House Today Anywhere</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Demo cash home buyer website powered by ChatAnswerAI.
          </p>
        </div>
        <div>
          <div className="font-black">Helpful links</div>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <div><a href="#how-it-works">How It Works</a></div>
            <div><a href="#request-offer">Request Offer</a></div>
            <div><a href="#faq">FAQ</a></div>
          </div>
        </div>
        <div>
          <div className="font-black">Demo disclosure</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This is a demonstration site for ChatAnswerAI. It does not make real property offers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function SellMyHouseTodayAnywherePage() {
  return (
    <main id="top" className="min-h-screen bg-white text-slate-900">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #fbbf24 0, transparent 28%), radial-gradient(circle at 80% 0%, #38bdf8 0, transparent 22%)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-slate-950">
              Sell your house as-is. Skip repairs, showings, and long listing timelines.
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Need to sell your house fast for cash?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Tell us about the property and we’ll review the details. We can look at houses that need repairs, inherited homes, vacant houses, rentals with tenants, and other as-is situations.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#request-offer" className="rounded-full bg-amber-400 px-7 py-4 text-base font-black text-slate-950 shadow-xl">
                Get My Cash Offer
              </a>
              <a href="tel:9725550100" className="rounded-full border border-white/30 bg-white/10 px-7 py-4 text-base font-black text-white">
                Call 972-555-0100
              </a>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-bold text-slate-200 sm:grid-cols-2">
              <div>✓ No repairs required</div>
              <div>✓ No open houses</div>
              <div>✓ Flexible closing timeline</div>
              <div>✓ No obligation to review your options</div>
            </div>
          </div>

          <div id="request-offer" className="rounded-[2.5rem] bg-white p-6 text-slate-950 shadow-2xl">
            <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
              Fast property review
            </div>
            <h2 className="text-3xl font-black">Tell us about the house.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the chat widget in the bottom-right corner or click the button below to open the quote form.
            </p>

            <div className="mt-6 space-y-3">
              {[
                ["1", "Answer a few simple questions"],
                ["2", "Share the property city/address"],
                ["3", "Tell us your timeline"],
                ["4", "Someone can review the details"],
              ].map(([number, text]) => (
                <div key={number} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-black text-slate-950">{number}</div>
                  <div className="font-bold text-slate-700">{text}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-center text-sm font-black text-white">
              Open the bottom-right chat widget and click “Enter House Info for a Quote”
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black text-slate-950">A simple way to sell without listing.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Selling as-is can be helpful when you do not want repairs, showings, agent delays, or a long uncertain process.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Share the basics", "Tell us the city, address, condition, and your timeline."],
            ["Get a direct review", "The team can review the property details and discuss possible next steps."],
            ["Choose your timeline", "If there is a fit, you can discuss a closing date that works for your situation."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
              <h3 className="text-2xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="situations" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black text-slate-950">We review many as-is situations.</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            You do not need a perfect house to start a conversation. Share the basics and the team can review the situation.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {situations.map((item) => (
              <div key={item} className="rounded-2xl bg-white p-5 font-bold text-slate-700 ring-1 ring-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <h2 className="text-4xl font-black text-slate-950">Serving Plano and nearby North Texas areas.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              If your city is nearby but not listed, you can still submit the property details for review.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {serviceAreas.map((area) => (
              <div key={area} className="rounded-2xl bg-slate-50 p-4 text-center font-black text-slate-800 ring-1 ring-slate-200">
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-950">Want us to review your property?</h2>
            <p className="mt-3 text-lg font-semibold text-slate-800">
              Open the chat widget and enter the house information. There is no obligation.
            </p>
          </div>
          <a href="#request-offer" className="rounded-full bg-slate-950 px-8 py-4 text-center font-black text-white">
            Start Now
          </a>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-4xl font-black text-slate-950">Common questions</h2>
        <div className="mt-8 space-y-4">
          {[
            ["Do I need to make repairs first?", "Usually no. Many as-is buyers can review houses without repairs, cleaning, painting, or showings first."],
            ["How fast can closing happen?", "Some cash sale processes can move quickly if the title is clear and both sides are ready. The exact timeline depends on the property and your needs."],
            ["Am I obligated if I submit my information?", "No. Submitting information is a way to start a review. You are not obligated unless you choose to sign an agreement."],
            ["Can you review a tenant-occupied house?", "Tenant-occupied properties can often be reviewed. Share the basic details so the team can understand the situation."],
          ].map(([question, answer]) => (
            <details key={question} className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
              <summary className="cursor-pointer font-black text-slate-950">{question}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />

      <Script src="https://www.chatanswerai.com/widget.js?v=dynamic-settings-20260606b" strategy="afterInteractive" data-site-id="smhta" />
    </main>
  );
}
