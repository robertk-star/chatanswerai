import Link from "next/link";
import Script from "next/script";

export const metadata = { title: "Widget Demo | ChatAnswerAI" };

export default function WidgetDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/demo" className="text-sm font-bold text-slate-500 underline">Open full demo page</Link>
        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-navy">ChatAnswerAI Widget Demo</h1>
          <p className="mt-3 text-slate-600">
            This route exists for system QA. The live widget should appear in the lower-right corner using the demo site ID.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Try opening the chat bubble, asking a question, and submitting a test quote request.
          </div>
        </div>
      </section>
      <Script src="/widget.js" data-site-id="demo" strategy="afterInteractive" />
    </main>
  );
}
