import { NextResponse } from "next/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function cleanPlan(value?: string | null) {
  return value === "pro" ? "pro" : "starter";
}

function planLabel(value?: string | null) {
  return cleanPlan(value) === "pro" ? "Pro" : "Starter";
}

function splitEmails(value?: string | null) {
  return String(value || "")
    .split(/[;,\n]/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function escapeHtml(value?: string | null) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendRequestEmail({
  plan,
  email,
  name,
  phone,
  business,
}: {
  plan: string;
  email: string;
  name: string;
  phone: string;
  business: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "CashOfferChat <leads@cashofferchat.com>";
  const recipients = splitEmails(process.env.SALES_REQUEST_EMAIL || process.env.LEAD_NOTIFICATION_EMAIL);

  if (!resendApiKey || recipients.length === 0) return;

  const safePlan = planLabel(plan);
  const rows = [
    ["Plan", safePlan],
    ["Email", email],
    ["Name", name || "—"],
    ["Phone", phone || "—"],
    ["Business / Website", business || "—"],
    ["Submitted", new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })],
  ];

  const htmlRows = rows
    .map(([label, rowValue]) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#334155;width:180px;">${escapeHtml(label)}</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(rowValue)}</td></tr>`)
    .join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject: `CashOfferChat ${safePlan} request: ${email}`,
      html: `<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;"><div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;"><div style="background:#0f172a;color:#ffffff;padding:22px 24px;"><h1 style="margin:0;font-size:22px;line-height:1.3;">New CashOfferChat Pricing Request</h1><p style="margin:8px 0 0;color:#cbd5e1;">Stripe placeholder form</p></div><div style="padding:24px;"><table style="border-collapse:collapse;width:100%;font-size:14px;">${htmlRows}</table></div></div></div>`,
      text: rows.map(([label, rowValue]) => `${label}: ${rowValue}`).join("\n"),
    }),
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = cleanPlan(value(formData, "plan"));
  const email = value(formData, "email").toLowerCase();
  const name = value(formData, "name");
  const phone = value(formData, "phone");
  const business = value(formData, "business");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL(`/checkout?plan=${plan}&error=1`, request.url), { status: 303 });
  }

  try {
    await sendRequestEmail({ plan, email, name, phone, business });
  } catch (error) {
    console.error("Checkout placeholder email failed", error instanceof Error ? error.message : error);
  }

  return NextResponse.redirect(new URL(`/checkout/thanks?plan=${plan}`, request.url), { status: 303 });
}
