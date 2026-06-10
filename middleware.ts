import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isSellMyHouseDemoDomain =
    host === "sellmyhousetodayanywhere.com" ||
    host === "www.sellmyhousetodayanywhere.com";

  if (!isSellMyHouseDemoDomain) {
    return NextResponse.next();
  }

  // Allow Next.js internals, assets, API routes, and widget JS to work normally.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/widget.js") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml)$/)
  ) {
    return NextResponse.next();
  }

  // Rewrite only the home page and normal marketing paths to the demo home-buying site.
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = "/sellmyhousetodayanywhere";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
