import { rowsToCsv } from "@/lib/csv";

export const leadExportHeaders = [
  "Created At",
  "Status",
  "Lead Name",
  "Phone",
  "Email",
  "Company",
  "Service Needed",
  "Preferred Timeline",
  "Message",
  "Legacy Property Address",
  "Legacy Property City",
  "Legacy Property Condition",
  "Admin/Internal Notes",
  "Source URL",
  "Site ID",
  "Business ID",
];

export function normalizeLeadStatus(status?: string | null) {
  return status || "new";
}

export function leadsToCsv(leads: any[]) {
  return rowsToCsv(
    leadExportHeaders,
    leads.map((lead) => [
      lead.created_at || "",
      normalizeLeadStatus(lead.status),
      lead.name || "",
      lead.phone || "",
      lead.email || "",
      lead.company || "",
      lead.service_needed || lead.situation || "",
      lead.preferred_timeline || lead.timeline || "",
      lead.message || lead.notes || "",
      lead.property_address || "",
      lead.property_city || "",
      lead.property_condition || "",
      lead.admin_notes || "",
      lead.source_url || "",
      lead.site_id || "",
      lead.business_id || "",
    ]),
  );
}

export function leadExportFilename(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-leads-${date}.csv`;
}
