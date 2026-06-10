import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/client/leads/${id}?error=1`, request.url), { status: 303 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") || "").trim();

  if (action === "delete") {
    const confirmDelete = String(formData.get("confirm_delete") || "").trim();
    if (confirmDelete !== "DELETE") {
      return NextResponse.redirect(new URL(`/client/leads/${id}?deleteError=1`, request.url), { status: 303 });
    }

    const result = await deleteLeadAndResetDuplicateState({
      supabase,
      leadId: id,
      businessId: session.businessId,
    });

    if (!result.ok) {
      return NextResponse.redirect(new URL(`/client/leads/${id}?deleteError=1`, request.url), { status: 303 });
    }

    return NextResponse.redirect(new URL("/client?leadDeleted=1", request.url), { status: 303 });
  }

  const status = String(formData.get("status") || "new");
  const adminNotes = String(formData.get("admin_notes") || "");
  const markContactedNow = formData.get("mark_contacted_now") === "on";

  if (!allowedStatuses.has(status)) {
    return NextResponse.redirect(new URL(`/client/leads/${id}?error=1`, request.url), { status: 303 });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    admin_notes: adminNotes,
    updated_at: new Date().toISOString(),
  };

  if (markContactedNow || status === "contacted") {
    updatePayload.last_contacted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("seller_leads")
    .update(updatePayload)
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) {
    return NextResponse.redirect(new URL(`/client/leads/${id}?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/client/leads/${id}?saved=1`, request.url), { status: 303 });
}
