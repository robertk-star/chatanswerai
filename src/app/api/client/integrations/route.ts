import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isValidUrl(url: string) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  const session = verifyClientSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(new URL("/client/integrations?error=1", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const webhookEnabled = formData.get("webhook_enabled") === "on";
  const webhookUrl = value(formData, "webhook_url");
  const webhookSecret = value(formData, "webhook_secret");

  if (webhookEnabled && !isValidUrl(webhookUrl)) {
    return NextResponse.redirect(new URL("/client/integrations?error=1", request.url), { status: 303 });
  }

  const { error } = await supabase
    .from("business_settings")
    .upsert(
      {
        business_id: session.businessId,
        webhook_enabled: webhookEnabled,
        webhook_url: webhookUrl || null,
        webhook_secret: webhookSecret || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" }
    );

  if (error) {
    return NextResponse.redirect(new URL("/client/integrations?error=1", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/client/integrations?saved=1", request.url), { status: 303 });
}
