import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { PortalRouteNav } from "@/components/PortalRouteNav";

export const metadata: Metadata = {
  title: "ChatarAI",
  description: "AI lead-capture chat assistant for service-business websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PortalRouteNav />
        {children}
        <Script
          src="/widget.js?v=chatarai-form-builder-20260610g"
          data-site-id="caai"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
