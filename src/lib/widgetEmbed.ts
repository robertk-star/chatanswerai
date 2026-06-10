export const WIDGET_SCRIPT_VERSION = "send-green-canonical-api-20260607a";
export const CANONICAL_WIDGET_ORIGIN = "https://www.cashofferchat.com";

export function getWidgetScriptOrigin() {
  const rawUrl = process.env.NEXT_PUBLIC_WIDGET_SCRIPT_ORIGIN || process.env.APP_URL || CANONICAL_WIDGET_ORIGIN;

  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "cashofferchat.com" || hostname === "www.cashofferchat.com") {
      return CANONICAL_WIDGET_ORIGIN;
    }

    return parsed.origin;
  } catch {
    return CANONICAL_WIDGET_ORIGIN;
  }
}

export function buildWidgetScriptSrc() {
  return `${getWidgetScriptOrigin()}/widget.js?v=${WIDGET_SCRIPT_VERSION}`;
}

export function buildWidgetEmbedCode(siteId: string) {
  return `<script src="${buildWidgetScriptSrc()}" data-site-id="${siteId}"></script>`;
}
