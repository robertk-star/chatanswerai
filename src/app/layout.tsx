import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { PortalRouteNav } from "@/components/PortalRouteNav";

export const metadata: Metadata = {
  title: "Chat Answer AI",
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
          src="https://chatanswerai.vercel.app/widget.js?v=send-green-canonical-api-20260607a"
          data-site-id="caai"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
