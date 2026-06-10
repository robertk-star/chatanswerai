import Link from "next/link";

type ClientLeadExportButtonProps = {
  siteId?: string;
  status?: string;
  label?: string;
};

export function ClientLeadExportButton({
  siteId,
  status,
  label = "Export Leads CSV",
}: ClientLeadExportButtonProps) {
  const params = new URLSearchParams();

  if (siteId) params.set("siteId", siteId);
  if (status) params.set("status", status);

  const query = params.toString();
  const href = query ? `/api/client/leads/export?${query}` : "/api/client/leads/export";

  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-navy hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
