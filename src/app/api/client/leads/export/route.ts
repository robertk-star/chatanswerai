import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { csvResponse } from "@/lib/csv";
import { leadExportFilename, leadsToCsv } from "@/lib/leadExport";

export const dynamic = "force-dynamic";

function value(url: URL, key: string) {
  return (url.searchParams.get(key) || "").trim();
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const siteId = value(url, "siteId");
  const status = value(url, "status");

  let query = supabase
    .from("seller_leads")
    .select(
      "created_at, status, name, phone, email, company, service_needed, preferred_timeline, message, property_address, property_city, situation, timeline, property_condition, notes, admin_notes, source_url, site_id, business_id",
    )
    .eq("business_id", session.businessId)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (siteId) query = query.eq("site_id", siteId);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = leadsToCsv(data || []);
  return csvResponse(csv, leadExportFilename("client"));
}
