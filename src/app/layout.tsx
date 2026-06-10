import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
