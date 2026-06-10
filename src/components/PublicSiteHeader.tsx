import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black tracking-tight text-navy">
          ChatarAI
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
          <Link href="/widget-demo" className="hover:text-navy">
            Live Demo
          </Link>
          <Link href="/pricing" className="hover:text-navy">
            Pricing
          </Link>
          <Link href="/contact" className="hover:text-navy">
            Contact
          </Link>
          <Link href="/client/login" className="hover:text-navy">
            Login
          </Link>
        </nav>

        <Link
          href="/contact"
          className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy"
        >
          Request Early Access
        </Link>
      </div>
    </header>
  );
}
