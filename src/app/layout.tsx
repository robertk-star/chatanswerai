import type { Metadata } from "next";
import "./globals.css";
import { PortalRouteNav } from "@/components/PortalRouteNav";

export const metadata: Metadata = {
  title: "CashOfferChat",
  description: "AI seller intake assistant for cash home buyer websites.",
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
