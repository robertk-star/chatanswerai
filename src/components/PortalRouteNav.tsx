"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/system", label: "System Dashboard" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/onboarding", label: "Onboarding" },
  { href: "/admin/sites", label: "Widget Sites" },
  { href: "/admin/clients", label: "Client Users" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/analytics", label: "Analytics" },
];

const clientLinks = [
  { href: "/client", label: "Client Dashboard" },
  { href: "/client/sites", label: "Widget Sites" },
  { href: "/client/analytics", label: "Analytics" },
  { href: "/client/integrations", label: "Integrations" },
  { href: "/client/settings", label: "Settings" },
  { href: "/client/account", label: "Account" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/client") return pathname === "/client";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function clarifyLegacyBackLinks(pathname: string) {
  if (typeof document === "undefined") return;

  const anchors = Array.from(document.querySelectorAll("a"));
  for (const anchor of anchors) {
    const text = (anchor.textContent || "").trim();
    const href = anchor.getAttribute("href") || "";

    if (pathname.startsWith("/admin") && href === "/admin" && text === "Back to Admin") {
      anchor.textContent = "Back to Admin Dashboard";
    }

    if (pathname.startsWith("/admin") && href === "/admin/system" && text === "System") {
      anchor.textContent = "System Dashboard";
    }

    if (pathname.startsWith("/client") && href === "/client" && text === "Back to Client") {
      anchor.textContent = "Back to Client Dashboard";
    }
  }
}

function hideDuplicateLogoutForms(isAdminRoute: boolean, isClientRoute: boolean) {
  if (typeof document === "undefined") return;

  const logoutAction = isAdminRoute ? "/api/admin/logout" : isClientRoute ? "/api/client/logout" : "";
  if (!logoutAction) return;

  const forms = Array.from(document.querySelectorAll(`form[action="${logoutAction}"]`));

  forms.forEach((form, index) => {
    const element = form as HTMLElement;

    if (index === 0) {
      element.style.display = "";
      element.setAttribute("data-coc-primary-logout", "true");
      return;
    }

    element.style.display = "none";
    element.setAttribute("data-coc-hidden-duplicate-logout", "true");
  });
}

export function PortalRouteNav() {
  const pathname = usePathname() || "";

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isClientRoute = pathname.startsWith("/client") && pathname !== "/client/login";

  useEffect(() => {
    clarifyLegacyBackLinks(pathname);
    hideDuplicateLogoutForms(isAdminRoute, isClientRoute);
  }, [pathname, isAdminRoute, isClientRoute]);

  if (!isAdminRoute && !isClientRoute) return null;

  const links = isAdminRoute ? adminLinks : clientLinks;
  const logoutAction = isAdminRoute ? "/api/admin/logout" : "/api/client/logout";
  const label = isAdminRoute ? "Chat Answer AI Admin" : "Chat Answer AI Client Portal";
  const homeHref = isAdminRoute ? "/admin" : "/client";
  const homeLabel = isAdminRoute ? "Back to Admin Dashboard" : "Back to Client Dashboard";

  return (
    <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <Link href={homeHref} className="font-bold text-slate-600 underline">
                {homeLabel}
              </Link>
              {isAdminRoute && (
                <Link href="/admin/system" className="font-bold text-slate-600 underline">
                  System Dashboard
                </Link>
              )}
              <span>Current route: {pathname}</span>
            </div>
          </div>

          <form action={logoutAction} method="post">
            <button
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="submit"
            >
              Log Out
            </button>
          </form>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
