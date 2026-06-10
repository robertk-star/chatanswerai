import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { deleteLeadAndResetDuplicateState } from "../../../../../lib/deleteLeadReset";

const allowedStatuses = new Set([
  "new",
  "contacted",
  "appointment_set",
  "offer_made",
  "under_contract",
  "closed",
  "not_interested",
  "bad_lead",
  "referral",
]);

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=1`, request.url), { status: 303 });
  }

  const formData = await request.formData();
  const action = value(formData, "action");

  if (action === "delete") {
    const confirmDelete = String(formData.get("confirm_delete") || "").trim();
    if (confirmDelete !== "DELETE") {
      return NextResponse.redirect(new URL(`/admin/leads/${id}?deleteError=1`, request.url), { status: 303 });
    }

    const result = await deleteLeadAndResetDuplicateState({ supabase, leadId: id });

    if (!result.ok) {
      return NextResponse.redirect(new URL(`/admin/leads/${id}?deleteError=1`, request.url), { status: 303 });
    }

    const redirectUrl = result.lead?.business_id
      ? `/admin/businesses/${result.lead.business_id}?leadDeleted=1`
      : "/admin/businesses?leadDeleted=1";

    return NextResponse.redirect(new URL(redirectUrl, request.url), { status: 303 });
  }

  const status = value(formData, "status") || "new";

  if (!allowedStatuses.has(status)) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=1`, request.url), { status: 303 });
  }

  const markContactedNow = formData.get("mark_contacted_now") === "on";
  const updatePayload: Record<string, unknown> = {
    status,
    admin_notes: value(formData, "admin_notes"),
    updated_at: new Date().toISOString(),
  };

  if (markContactedNow || status === "contacted") {
    updatePayload.last_contacted_at = new Date().toISOString();
  }

  const { error } = await supabase.from("seller_leads").update(updatePayload).eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL(`/admin/leads/${id}?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/admin/leads/${id}?saved=1`, request.url), { status: 303 });
}
