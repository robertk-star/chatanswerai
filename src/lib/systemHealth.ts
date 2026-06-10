import { existsSync } from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type HealthStatus = "ok" | "warning" | "error";

export type HealthItem = {
  name: string;
  status: HealthStatus;
  message: string;
  detail?: string;
};

export type SystemHealth = {
  checkedAt: string;
  environment: string;
  overallStatus: HealthStatus;
  env: HealthItem[];
  tables: HealthItem[];
  routes: HealthItem[];
  apiRoutes: HealthItem[];
  qaChecklist: HealthItem[];
};

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_DASHBOARD_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "CLIENT_SESSION_SECRET",
  "APP_URL",
];

const optionalEnv = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "LEAD_NOTIFICATION_EMAIL",
];

const tableChecks = [
  "businesses",
  "business_settings",
  "widget_sites",
  "business_users",
  "seller_leads",
  "conversations",
  "conversation_messages",
  "widget_events",
  "service_areas",
  "referral_areas",
  "property_buying_criteria",
  "managed_faq_items",
  "custom_qa_items",
];

const routeFileChecks = [
  { route: "/", file: "src/app/page.tsx", type: "public" },
  { route: "/widget-demo", file: "src/app/widget-demo/page.tsx", type: "public" },
  { route: "/widget.js", file: "public/widget.js", type: "public" },
  { route: "/admin/login", file: "src/app/admin/login/page.tsx", type: "public" },
  { route: "/admin", file: "src/app/admin/page.tsx", type: "admin" },
  { route: "/admin/system", file: "src/app/admin/system/page.tsx", type: "admin" },
  { route: "/admin/businesses", file: "src/app/admin/businesses/page.tsx", type: "admin" },
  { route: "/admin/businesses/[id]", file: "src/app/admin/businesses/[id]/page.tsx", type: "dynamic" },
  { route: "/admin/onboarding", file: "src/app/admin/onboarding/page.tsx", type: "admin" },
  { route: "/admin/sites", file: "src/app/admin/sites/page.tsx", type: "admin" },
  { route: "/admin/sites/[id]", file: "src/app/admin/sites/[id]/page.tsx", type: "dynamic" },
  { route: "/admin/clients", file: "src/app/admin/clients/page.tsx", type: "admin" },
  { route: "/admin/clients/[id]", file: "src/app/admin/clients/[id]/page.tsx", type: "dynamic" },
  { route: "/admin/settings", file: "src/app/admin/settings/page.tsx", type: "admin" },
  { route: "/admin/analytics", file: "src/app/admin/analytics/page.tsx", type: "admin" },
  { route: "/admin/leads/[id]", file: "src/app/admin/leads/[id]/page.tsx", type: "dynamic" },
  { route: "/client/login", file: "src/app/client/login/page.tsx", type: "public" },
  { route: "/client", file: "src/app/client/page.tsx", type: "client" },
  { route: "/client/leads/[id]", file: "src/app/client/leads/[id]/page.tsx", type: "dynamic" },
  { route: "/client/sites", file: "src/app/client/sites/page.tsx", type: "client" },
  { route: "/client/sites/[id]", file: "src/app/client/sites/[id]/page.tsx", type: "dynamic" },
  { route: "/client/analytics", file: "src/app/client/analytics/page.tsx", type: "client" },
  { route: "/client/integrations", file: "src/app/client/integrations/page.tsx", type: "client" },
  { route: "/client/settings", file: "src/app/client/settings/page.tsx", type: "client" },
  { route: "/client/account", file: "src/app/client/account/page.tsx", type: "client" },
];

const apiRouteFileChecks = [
  { route: "/api/admin/login", file: "src/app/api/admin/login/route.ts", type: "api" },
  { route: "/api/admin/logout", file: "src/app/api/admin/logout/route.ts", type: "api" },
  { route: "/api/admin/system/health", file: "src/app/api/admin/system/health/route.ts", type: "api" },
  { route: "/api/admin/businesses/[id]", file: "src/app/api/admin/businesses/[id]/route.ts", type: "dynamic" },
  { route: "/api/admin/onboarding", file: "src/app/api/admin/onboarding/route.ts", type: "api" },
  { route: "/api/admin/faqs", file: "src/app/api/admin/faqs/route.ts", type: "api" },
  { route: "/api/admin/sites", file: "src/app/api/admin/sites/route.ts", type: "api" },
  { route: "/api/admin/sites/[id]", file: "src/app/api/admin/sites/[id]/route.ts", type: "dynamic" },
  { route: "/api/admin/clients", file: "src/app/api/admin/clients/route.ts", type: "api" },
  { route: "/api/admin/clients/[id]", file: "src/app/api/admin/clients/[id]/route.ts", type: "dynamic" },
  { route: "/api/admin/settings", file: "src/app/api/admin/settings/route.ts", type: "api" },
  { route: "/api/admin/leads/[id]", file: "src/app/api/admin/leads/[id]/route.ts", type: "dynamic" },
  { route: "/api/admin/leads/export", file: "src/app/api/admin/leads/export/route.ts", type: "api" },
  { route: "/api/client/login", file: "src/app/api/client/login/route.ts", type: "api" },
  { route: "/api/client/logout", file: "src/app/api/client/logout/route.ts", type: "api" },
  { route: "/api/client/leads/[id]", file: "src/app/api/client/leads/[id]/route.ts", type: "dynamic" },
  { route: "/api/client/leads/export", file: "src/app/api/client/leads/export/route.ts", type: "api" },
  { route: "/api/client/sites/[id]", file: "src/app/api/client/sites/[id]/route.ts", type: "dynamic" },
  { route: "/api/client/settings", file: "src/app/api/client/settings/route.ts", type: "api" },
  { route: "/api/client/account/password", file: "src/app/api/client/account/password/route.ts", type: "api" },
  { route: "/api/client/integrations", file: "src/app/api/client/integrations/route.ts", type: "api" },
  { route: "/api/client/integrations/test", file: "src/app/api/client/integrations/test/route.ts", type: "api" },
  { route: "/api/chat", file: "src/app/api/chat/route.ts", type: "api" },
  { route: "/api/leads", file: "src/app/api/leads/route.ts", type: "api" },
  { route: "/api/widget/settings", file: "src/app/api/widget/settings/route.ts", type: "api" },
  { route: "/api/widget/events", file: "src/app/api/widget/events/route.ts", type: "api" },
];

const qaItems = [
  "Admin can log in",
  "Admin can open System Dashboard",
  "Admin can open Businesses",
  "Admin can open Onboarding",
  "Admin can open Widget Sites",
  "Admin can open Client Users",
  "Admin can open Settings",
  "Admin can open Analytics",
  "Client can log in",
  "Client can open Dashboard",
  "Client can open Widget Sites",
  "Client can open Analytics",
  "Client can open Integrations",
  "Widget settings API can resolve siteId",
  "Leads API exists",
  "CSV exports exist",
];

function isProductionRuntime() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function summarizeStatus(items: HealthItem[]): HealthStatus {
  const actionable = items.filter((item) => item.detail !== "Manual/auth-required check");
  if (actionable.some((item) => item.status === "error")) return "error";
  if (items.some((item) => item.status === "warning")) return "warning";
  return "ok";
}

function routeCheck(item: { route: string; file: string; type: string }): HealthItem {
  if (isProductionRuntime()) {
    return {
      name: item.route,
      status: "warning",
      message: item.type === "dynamic"
        ? "Dynamic route. Confirm manually from a real record link."
        : "Production route check. Confirm manually while logged in.",
      detail: "Manual/auth-required check",
    };
  }

  const fullPath = path.join(process.cwd(), item.file);
  const exists = existsSync(fullPath);

  return {
    name: item.route,
    status: exists ? "ok" : "error",
    message: exists ? "File exists locally" : "Missing route file locally",
    detail: item.file,
  };
}

function envValuePreview(name: string) {
  const value = process.env[name];
  if (!value) return "Not set";
  if (name.includes("KEY") || name.includes("SECRET") || name.includes("PASSWORD")) {
    return `Set (${value.length} characters)`;
  }
  return value;
}

function formatSupabaseError(error: any) {
  if (!error) return "Unknown Supabase error";

  const pieces = [
    error.message,
    error.code ? `code: ${error.code}` : "",
    error.details ? `details: ${error.details}` : "",
    error.hint ? `hint: ${error.hint}` : "",
  ].filter(Boolean);

  if (pieces.length) return pieces.join(" | ");

  try {
    const json = JSON.stringify(error);
    if (json && json !== "{}") return json;
  } catch {}

  return "Supabase returned an error object without a message. Check the service-role key, project URL, and whether the project is paused.";
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const envItems: HealthItem[] = [
    ...requiredEnv.map((name) => ({
      name,
      status: process.env[name] ? "ok" as const : "error" as const,
      message: process.env[name] ? "Configured" : "Missing required environment variable",
      detail: envValuePreview(name),
    })),
    ...optionalEnv.map((name) => ({
      name,
      status: process.env[name] ? "ok" as const : "warning" as const,
      message: process.env[name] ? "Configured" : "Optional but not configured",
      detail: envValuePreview(name),
    })),
  ];

  const supabase = getSupabaseAdmin();
  const tableItems: HealthItem[] = [];

  if (!supabase) {
    for (const table of tableChecks) {
      tableItems.push({
        name: table,
        status: "error",
        message: "Supabase admin client is not configured",
        detail: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing at runtime",
      });
    }
  } else {
    for (const table of tableChecks) {
      try {
        const { error, count } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true });

        tableItems.push({
          name: table,
          status: error ? "error" : "ok",
          message: error ? formatSupabaseError(error) : "Reachable",
          detail: error ? formatSupabaseError(error) : `Rows: ${count ?? "unknown"}`,
        });
      } catch (error) {
        tableItems.push({
          name: table,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown table check error",
          detail: error instanceof Error ? error.stack?.slice(0, 500) : String(error),
        });
      }
    }
  }

  const routes = routeFileChecks.map(routeCheck);
  const apiRoutes = apiRouteFileChecks.map(routeCheck);

  const qaChecklist: HealthItem[] = qaItems.map((name) => ({
    name,
    status: "warning",
    message: "Manual test recommended",
  }));

  const allItems = [...envItems, ...tableItems, ...routes, ...apiRoutes];

  return {
    checkedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    overallStatus: summarizeStatus(allItems),
    env: envItems,
    tables: tableItems,
    routes,
    apiRoutes,
    qaChecklist,
  };
}
