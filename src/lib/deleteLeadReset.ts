export type DeleteLeadResetResult = {
  ok: boolean;
  error?: string;
  notFound?: boolean;
  lead?: {
    id: string;
    conversation_id: string | null;
    business_id: string | null;
  };
  deletedConversation?: boolean;
};

function buildWidgetEventResetFilter(leadId: string, conversationId?: string | null) {
  const filters = [`lead_id.eq.${leadId}`];
  if (conversationId) filters.push(`conversation_id.eq.${conversationId}`);
  return filters.join(",");
}

export async function deleteLeadAndResetDuplicateState({
  supabase,
  leadId,
  businessId,
}: {
  supabase: any;
  leadId: string;
  businessId?: string | null;
}): Promise<DeleteLeadResetResult> {
  const leadQuery = supabase
    .from("seller_leads")
    .select("id, conversation_id, business_id")
    .eq("id", leadId);

  if (businessId) leadQuery.eq("business_id", businessId);

  const { data: lead, error: leadError } = await leadQuery.maybeSingle();

  if (leadError) return { ok: false, error: leadError.message };
  if (!lead) return { ok: false, notFound: true, error: "Lead was not found" };

  const conversationId = lead.conversation_id || null;

  const eventDelete = await supabase
    .from("widget_events")
    .delete()
    .or(buildWidgetEventResetFilter(lead.id, conversationId));

  if (eventDelete.error) {
    return { ok: false, error: eventDelete.error.message, lead };
  }

  const leadDeleteQuery = supabase.from("seller_leads").delete().eq("id", lead.id);
  if (businessId) leadDeleteQuery.eq("business_id", businessId);

  const leadDelete = await leadDeleteQuery;
  if (leadDelete.error) {
    return { ok: false, error: leadDelete.error.message, lead };
  }

  let deletedConversation = false;

  if (conversationId) {
    const { count, error: countError } = await supabase
      .from("seller_leads")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId);

    if (countError) {
      return { ok: false, error: countError.message, lead };
    }

    if ((count || 0) === 0) {
      const conversationDelete = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (conversationDelete.error) {
        return { ok: false, error: conversationDelete.error.message, lead };
      }

      deletedConversation = true;
    }
  }

  return { ok: true, lead, deletedConversation };
}
