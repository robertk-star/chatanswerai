import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function mask(value?: string) {
  if (!value) return "missing";
  if (value.length <= 12) return `set (${value.length} chars)`;
  return `${value.slice(0, 6)}...${value.slice(-6)} (${value.length} chars)`;
}

function cleanUrl(value?: string) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function cleanKey(value?: string) {
  return String(value || "").trim();
}

async function probeTable({
  baseUrl,
  serviceKey,
  table,
}: {
  baseUrl: string;
  serviceKey: string;
  table: string;
}) {
  const url = `${baseUrl}/rest/v1/${table}?select=id&limit=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await response.text();

    return {
      table,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      bodyPreview: text.slice(0, 700),
    };
  } catch (error) {
    return {
      table,
      ok: false,
      status: "fetch_error",
      statusText: error instanceof Error ? error.message : "Unknown fetch error",
      contentType: null,
      bodyPreview: error instanceof Error ? error.stack?.slice(0, 700) : String(error),
    };
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = cleanUrl(rawUrl);
  const serviceKey = cleanKey(rawServiceKey);

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: rawUrl ? baseUrl : "missing",
    SUPABASE_SERVICE_ROLE_KEY: mask(rawServiceKey),
    serviceKeyStartsWithExpectedPrefix:
      serviceKey.startsWith("eyJ") || serviceKey.startsWith("sb_secret_"),
    serviceKeyHasWhitespaceProblem: rawServiceKey !== serviceKey,
    urlLooksLikeSupabase: /^https:\/\/[^/]+\.supabase\.co$/.test(baseUrl),
  };

  if (!baseUrl || !serviceKey) {
    return NextResponse.json({
      ok: false,
      error: "Missing Supabase URL or service role key at runtime.",
      env,
    });
  }

  const probes = await Promise.all([
    probeTable({ baseUrl, serviceKey, table: "businesses" }),
    probeTable({ baseUrl, serviceKey, table: "business_settings" }),
    probeTable({ baseUrl, serviceKey, table: "widget_sites" }),
  ]);

  return NextResponse.json({
    ok: probes.every((probe) => probe.ok),
    checkedAt: new Date().toISOString(),
    env,
    probes,
    nextSteps: [
      "If status is 401 or 403, the Supabase service role key is wrong or from another project.",
      "If status is 404 with relation missing, run the Chat Answer AI fresh database setup SQL.",
      "If status is fetch_error, check the Supabase project URL and whether the project is paused.",
      "If status is 200 here but System Check still fails, the issue is in the supabase-js table checker, not the database connection.",
    ],
  });
}
