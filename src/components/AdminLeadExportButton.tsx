import Link from "next/link";

type AdminLeadExportButtonProps = {
  businessId?: string;
  siteId?: string;
  status?: string;
  label?: string;
};

export function AdminLeadExportButton({
  businessId,
  siteId,
  status,
  label = "Export Leads CSV",
}: AdminLeadExportButtonProps) {
  const params = new URLSearchParams();

  if (businessId) params.set("businessId", businessId);
  if (siteId) params.set("siteId", siteId);
  if (status) params.set("status", status);

  const query = params.toString();
  const href = query ? `/api/admin/leads/export?${query}` : "/api/admin/leads/export";

  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
