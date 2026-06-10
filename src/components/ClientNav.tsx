import Link from "next/link";

const clientLinks = [
  { href: "/client", label: "Dashboard" },
  { href: "/client/settings", label: "Settings" },
  { href: "/client/account", label: "Account" },
];

export function ClientNav({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xl font-bold text-navy">CashOfferChat Client Portal</div>
            {title && <h1 className="mt-2 text-2xl font-bold text-navy">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <form action="/api/client/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">Log Out</button>
          </form>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          {clientLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
