export type PlanName = "starter" | "pro";

export function normalizePlanName(value?: string | null): PlanName {
  return value === "pro" ? "pro" : "starter";
}

export function maxWidgetSitesForPlan(value?: string | null) {
  return normalizePlanName(value) === "pro" ? 4 : 1;
}

export function planLabel(value?: string | null) {
  return normalizePlanName(value) === "pro" ? "Pro" : "Starter";
}

export function planDescription(value?: string | null) {
  return normalizePlanName(value) === "pro"
    ? "Pro includes up to 4 widget sites/accounts."
    : "Starter includes 1 widget site.";
}
