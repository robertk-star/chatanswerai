import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { buildLeadWebhookPayload, sendLeadWebhookForBusiness } from "@/lib/leadWebhook";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  }

  const payload = buildLeadWebhookPayload(
    {
      id: "test-lead",
      created_at: new Date().toISOString(),
      business_id: session.businessId,
      site_id: "test",
      status: "new",
      name: "Test Seller",
      phone: "555-555-5555",
      email: "test@example.com",
      property_address: "123 Test Street",
      property_city: "Plano",
      situation: "Testing webhook delivery",
      timeline: "ASAP",
      property_condition: "Test condition",
      notes: "This is a CashOfferChat test webhook.",
      source_url: "https://cashofferchat.com/client/integrations",
    },
    "seller_lead.test"
  );

  const result = await sendLeadWebhookForBusiness({
    businessId: session.businessId,
    payload,
  });

  if (!result.sent) {
    return NextResponse.redirect(
      new URL(`/client/integrations?testError=${encodeURIComponent(result.error || result.reason || "Webhook not sent")}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL("/client/integrations?tested=1", request.url), { status: 303 });
}
