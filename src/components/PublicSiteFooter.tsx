import Link from "next/link";

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-xl font-black text-navy">
            Generic Business Chat
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            AI-powered lead capture chat for service-business websites.
          </p>
        </div>

        <div>
          <div className="font-bold text-navy">Product</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>
              <Link href="/widget-demo">Live Demo</Link>
            </div>
            <div>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <Link href="/client/login">Login</Link>
            </div>
          </div>
        </div>

        <div>
          <div className="font-bold text-navy">Company</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>
              <Link href="/privacy">Privacy</Link>
            </div>
            <div>
              <Link href="/terms">Terms</Link>
            </div>
            <div>
              <Link href="/admin/login">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
