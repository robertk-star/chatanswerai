export function slugifySiteId(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function slugifyBusinessSlug(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || `business-${Date.now()}`;
}

export function normalizeDomain(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function normalizeWebsite(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return "";
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
}

export function normalizeDomainInput(input: string) {
  return input
    .replace(/\\n/g, "\n")
    .split(/\r?\n|,/)
    .map((item) => normalizeDomain(item))
    .filter(Boolean)
    .join("\n");
}

export function parseLines(input: string) {
  return input
    .replace(/\\n/g, "\n")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
