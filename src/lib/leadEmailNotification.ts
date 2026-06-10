type SupabaseClientLike = {
  from: (table: string) => any;
};

type LeadRow = {
  id: string;
  created_at?: string | null;
  business_id?: string | null;
  site_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  service_needed?: string | null;
  message?: string | null;
  preferred_timeline?: string | null;
  property_address?: string | null;
  property_city?: string | null;
  situation?: string | null;
  timeline?: string | null;
  property_condition?: string | null;
  notes?: string | null;
  source_url?: string | null;
};

type NotificationResult = {
  skipped: boolean;
  sent: boolean;
  recipients: string[];
  error?: string;
};

function splitEmails(value?: string | null) {
  return String(value || "")
    .split(/[;,\n]/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function uniqueEmails(values: string[]) {
  return Array.from(new Set(values));
}

function escapeHtml(value?: string | null) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textValue(value?: string | null) {
  const cleaned = String(value || "").trim();
  return cleaned || "—";
}

function getAppUrl() {
  const rawUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.chatanswerai.com";

  try {
    const parsed = new URL(rawUrl);
    if (
      parsed.hostname === "chatanswerai.com" ||
      parsed.hostname === "www.chatanswerai.com"
    ) {
      return "https://www.chatanswerai.com";
    }
    return parsed.origin;
  } catch {
    return "https://www.chatanswerai.com";
  }
}

async function getLeadNotificationRecipients(
  supabase: SupabaseClientLike,
  businessId?: string | null,
) {
  const envRecipients = splitEmails(process.env.LEAD_NOTIFICATION_EMAIL);

  if (!businessId) return uniqueEmails(envRecipients);

  const { data, error } = await supabase
    .from("business_users")
    .select("email, is_active")
    .eq("business_id", businessId)
    .eq("is_active", true);

  if (error) {
    return uniqueEmails(envRecipients);
  }

  const clientRecipients = (data || []).flatMap(
    (user: { email?: string | null }) => splitEmails(user.email),
  );
  return uniqueEmails([...clientRecipients, ...envRecipients]);
}

function buildLeadEmail({
  lead,
  businessName,
}: {
  lead: LeadRow;
  businessName?: string | null;
}) {
  const appUrl = getAppUrl();
  const leadUrl = `${appUrl}/client/leads/${lead.id}`;
  const adminLeadUrl = `${appUrl}/admin/leads/${lead.id}`;
  const safeBusinessName = textValue(businessName);
  const subject = `New service inquiry: ${textValue(lead.name)}${lead.service_needed ? ` — ${lead.service_needed}` : ""}`;

  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Service Needed", lead.service_needed || lead.situation],
    ["Preferred Timeline", lead.preferred_timeline || lead.timeline],
    ["Message", lead.message || lead.notes],
    ["Legacy Property Address", lead.property_address],
    ["Legacy Property City", lead.property_city],
    ["Legacy Property Condition", lead.property_condition],
    ["Source URL", lead.source_url],
    ["Site ID", lead.site_id],
    [
      "Submitted",
      lead.created_at
        ? new Date(lead.created_at).toLocaleString("en-US", {
            timeZone: "America/Chicago",
          })
        : null,
    ],
  ];

  const htmlRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#334155;width:180px;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(textValue(value))}</td>
      </tr>`,
    )
    .join("");

  const textRows = rows
    .map(([label, value]) => `${label}: ${textValue(value)}`)
    .join("\n");

  return {
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
          <div style="background:#0f172a;color:#ffffff;padding:22px 24px;">
            <h1 style="margin:0;font-size:22px;line-height:1.3;">New Service Inquiry</h1>
            <p style="margin:8px 0 0;color:#cbd5e1;">${escapeHtml(safeBusinessName)}</p>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 18px;color:#334155;">A visitor submitted a service inquiry through the widget.</p>
            <table style="border-collapse:collapse;width:100%;font-size:14px;">${htmlRows}</table>
            <div style="margin-top:24px;">
              <a href="${escapeHtml(leadUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Open Lead</a>
              <a href="${escapeHtml(adminLeadUrl)}" style="display:inline-block;margin-left:10px;color:#0f172a;font-weight:700;">Admin view</a>
            </div>
          </div>
        </div>
      </div>`,
    text: `New Service Inquiry\nBusiness: ${safeBusinessName}\n\n${textRows}\n\nOpen lead: ${leadUrl}\nAdmin view: ${adminLeadUrl}`,
  };
}

export async function sendLeadEmailNotification({
  supabase,
  lead,
}: {
  supabase: SupabaseClientLike;
  lead: LeadRow;
}): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.FROM_EMAIL || "Chat Answer AI <leads@chatanswerai.com>";

  const recipients = await getLeadNotificationRecipients(
    supabase,
    lead.business_id,
  );

  if (!resendApiKey) {
    return {
      skipped: true,
      sent: false,
      recipients,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  if (recipients.length === 0) {
    return {
      skipped: true,
      sent: false,
      recipients,
      error: "No notification recipients found.",
    };
  }

  let businessName: string | null = null;
  if (lead.business_id) {
    const { data } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", lead.business_id)
      .maybeSingle();
    businessName = data?.name || null;
  }

  const email = buildLeadEmail({ lead, businessName });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      skipped: false,
      sent: false,
      recipients,
      error: `Resend failed with ${response.status}${detail ? `: ${detail}` : ""}`,
    };
  }

  return { skipped: false, sent: true, recipients };
}
