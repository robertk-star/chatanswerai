(() => {
  if (window.__chatarAiWidgetLoaded) return;
  window.__chatarAiWidgetLoaded = true;

  const script = document.currentScript;
  const siteId = script?.getAttribute("data-site-id") || "demo";
  const baseUrl = new URL(script?.src || window.location.href).origin;
  const sourceUrl = window.location.href;
  const sourceDomain = window.location.hostname;

  window.CHATARAI_WIDGET_VERSION = "chatarai-form-builder-20260610f";
  window.CHATARAI_WIDGET_API_BASE = baseUrl;

  const DEFAULT_QUICK_QUESTIONS = [
    "What services do you offer?",
    "What areas do you serve?",
    "How fast can someone follow up?",
    "Can I request information?",
  ];

  const LEGACY_FIELD_DEFS = [
    { key: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com", required: false },
    { key: "phone", label: "Phone", type: "phone", placeholder: "Best phone number", required: true },
    { key: "company", label: "Company", type: "text", placeholder: "Company name, if applicable", required: false },
    { key: "service_needed", label: "Service needed", type: "text", placeholder: "Tell us what you need help with", required: false },
    { key: "preferred_timeline", label: "Preferred timeline", type: "select", placeholder: "", options: ["ASAP", "This week", "Within 30 days", "1–3 months", "Just researching"], required: false },
    { key: "message", label: "Message", type: "textarea", placeholder: "Share any details that may help the team respond.", required: false },
  ];

  const LEGACY_KEY_MAP = {
    serviceNeeded: "service_needed",
    preferredTimeline: "preferred_timeline",
  };

  const DEFAULT_SETTINGS = {
    widgetTitle: "Service Inquiry Assistant",
    widgetSubtitle: "Answers questions and collects service inquiries",
    widgetBubbleText: "Questions? Chat with us",
    widgetQuoteButtonText: "Request Information",
    widgetSuccessMessage: "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widgetHeaderColor: "#0f172a",
    widgetHeaderTextColor: "#ffffff",
    widgetButtonColor: "#f5b51b",
    widgetButtonTextColor: "#0f172a",
    widgetShowCallButton: true,
    widgetCallButtonText: "Call Now",
    widgetQuickQuestions: DEFAULT_QUICK_QUESTIONS,
    formFields: [],
    businessPhone: "",
  };

  const state = {
    open: false,
    view: "chat",
    loading: false,
    settings: { ...DEFAULT_SETTINGS },
    conversationId: null,
    messages: [
      {
        role: "assistant",
        content: "Hi! I can answer questions about this business and help collect a service inquiry. What can I help you with today?",
      },
    ],
    form: {},
    formError: "",
  };

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) return;
      if (key === "class") node.className = value;
      else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, String(value));
    });
    children.forEach((child) => {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function cleanQuickQuestions(settings) {
    const questions = Array.isArray(settings.widgetQuickQuestions)
      ? settings.widgetQuickQuestions
      : [
          settings.widgetQuickQuestion1 || settings.widget_quick_question_1,
          settings.widgetQuickQuestion2 || settings.widget_quick_question_2,
          settings.widgetQuickQuestion3 || settings.widget_quick_question_3,
          settings.widgetQuickQuestion4 || settings.widget_quick_question_4,
        ];

    const cleaned = questions.map((question) => String(question || "").trim()).filter(Boolean).slice(0, 4);
    return cleaned.length ? cleaned : DEFAULT_QUICK_QUESTIONS;
  }

  function legacyVisibleFields(settings) {
    const fields = settings.widgetFormFields || settings.widget_form_fields || {};
    const isOn = (key) => fields[key] ?? settings[`widgetFormShow${key[0].toUpperCase()}${key.slice(1)}`] ?? true;
    return LEGACY_FIELD_DEFS.filter((field) => {
      if (field.key === "service_needed") return isOn("serviceNeeded");
      if (field.key === "preferred_timeline") return isOn("preferredTimeline");
      return isOn(field.key);
    });
  }

  function getActiveFormFields(settings = state.settings) {
    const builderFields = Array.isArray(settings.formFields) ? settings.formFields : [];
    const cleaned = builderFields
      .map((field, index) => ({
        key: String(field.key || field.field_key || "").trim(),
        label: String(field.label || "Field").trim(),
        type: String(field.type || field.field_type || "text").trim(),
        placeholder: String(field.placeholder || "").trim(),
        options: Array.isArray(field.options)
          ? field.options.map((option) => String(option || "").trim()).filter(Boolean)
          : String(field.options || "").split(/\r?\n|,/).map((option) => option.trim()).filter(Boolean),
        required: Boolean(field.required || field.is_required),
        sortOrder: Number(field.sortOrder ?? field.sort_order ?? index),
      }))
      .filter((field) => field.key && field.label)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return cleaned.length ? cleaned : legacyVisibleFields(settings);
  }

  function applyStyles() {
    const existing = document.getElementById("chatarai-widget-styles");
    if (existing) existing.remove();

    const header = state.settings.widgetHeaderColor || DEFAULT_SETTINGS.widgetHeaderColor;
    const headerText = state.settings.widgetHeaderTextColor || DEFAULT_SETTINGS.widgetHeaderTextColor;
    const button = state.settings.widgetButtonColor || DEFAULT_SETTINGS.widgetButtonColor;
    const buttonText = state.settings.widgetButtonTextColor || DEFAULT_SETTINGS.widgetButtonTextColor;

    const style = document.createElement("style");
    style.id = "chatarai-widget-styles";
    style.textContent = `
      #chatarai-root, #chatarai-root * { box-sizing: border-box; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      #chatarai-bubble { position: fixed; right: 22px; bottom: 22px; z-index: 2147483000; display: flex; align-items: center; gap: 10px; border: 0; border-radius: 999px; padding: 14px 18px; background: ${header}; color: ${headerText}; font-weight: 900; font-size: 15px; box-shadow: 0 18px 40px rgba(15,23,42,.25); cursor: pointer; }
      #chatarai-bubble-dot { width: 10px; height: 10px; border-radius: 999px; background: ${button}; }
      #chatarai-panel { position: fixed; right: 22px; bottom: 22px; z-index: 2147483001; width: min(420px, calc(100vw - 32px)); max-height: min(720px, calc(100vh - 32px)); overflow: hidden; border-radius: 26px; background: #fff; box-shadow: 0 24px 70px rgba(15,23,42,.28); border: 1px solid rgba(148,163,184,.35); display: flex; flex-direction: column; }
      #chatarai-header { background: ${header}; color: ${headerText}; padding: 18px; }
      .chatarai-header-row { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
      .chatarai-title { font-size: 16px; font-weight: 900; line-height: 1.2; }
      .chatarai-subtitle { margin-top: 4px; font-size: 12px; opacity: .82; line-height: 1.35; }
      .chatarai-close { border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: ${headerText}; border-radius: 999px; width: 34px; height: 34px; font-size: 20px; cursor: pointer; }
      .chatarai-actions { margin-top: 14px; display: grid; gap: 8px; }
      .chatarai-primary { border: 0; border-radius: 16px; padding: 13px 14px; background: ${button}; color: ${buttonText}; font-size: 14px; font-weight: 900; cursor: pointer; text-align: center; text-decoration: none; }
      .chatarai-secondary { border: 1px solid rgba(255,255,255,.35); border-radius: 16px; padding: 12px 14px; background: rgba(255,255,255,.12); color: ${headerText}; font-size: 14px; font-weight: 800; cursor: pointer; text-align: center; text-decoration: none; }
      #chatarai-body { background: #f8fafc; overflow: auto; flex: 1; min-height: 360px; }
      .chatarai-chat { padding: 16px; }
      .chatarai-message { max-width: 86%; margin-bottom: 12px; padding: 12px 14px; border-radius: 18px; line-height: 1.45; font-size: 14px; white-space: pre-wrap; }
      .chatarai-assistant { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; }
      .chatarai-user { margin-left: auto; background: #0f172a; color: #fff; }
      .chatarai-replies { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 14px; }
      .chatarai-chip { border: 1px solid #cbd5e1; background: #fff; color: #334155; border-radius: 999px; padding: 8px 10px; font-size: 12px; font-weight: 800; cursor: pointer; }
      .chatarai-composer { border-top: 1px solid #e2e8f0; background: #fff; padding: 12px; display: flex; gap: 8px; }
      .chatarai-input { flex: 1; min-width: 0; border: 1px solid #cbd5e1; border-radius: 999px; padding: 12px 14px; font-size: 14px; outline: none; }
      .chatarai-send { border: 0; border-radius: 999px; padding: 0 18px; background: #16a34a; color: #fff; font-weight: 900; cursor: pointer; }
      .chatarai-form { padding: 16px; }
      .chatarai-form-title { font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
      .chatarai-field { margin-bottom: 12px; }
      .chatarai-field label { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 900; color: #475569; }
      .chatarai-field input, .chatarai-field select, .chatarai-field textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 14px; padding: 11px 12px; font-size: 14px; background: #fff; color: #0f172a; outline: none; }
      .chatarai-field textarea { min-height: 88px; resize: vertical; }
      .chatarai-error { margin-bottom: 12px; border-radius: 14px; background: #fef2f2; color: #b91c1c; padding: 10px 12px; font-size: 13px; font-weight: 700; }
      .chatarai-help { margin: 10px 0 14px; font-size: 12px; line-height: 1.45; color: #64748b; }
      .chatarai-success { padding: 26px 18px; text-align: center; }
      .chatarai-success h3 { margin: 0; color: #0f172a; font-size: 20px; }
      .chatarai-success p { color: #475569; line-height: 1.55; font-size: 14px; }
      .chatarai-footer { padding: 10px 16px 14px; font-size: 11px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
      @media (max-width: 540px) { #chatarai-bubble { right: 14px; bottom: 14px; max-width: calc(100vw - 28px); font-size: 14px; } #chatarai-panel { left: 10px; right: 10px; bottom: 10px; width: auto; max-height: calc(100vh - 20px); border-radius: 22px; } }
    `;
    document.head.appendChild(style);
  }

  async function track(eventType, metadata = {}) {
    try {
      await fetch(`${baseUrl}/api/widget/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ eventType, siteId, sourceUrl, pageUrl: sourceUrl, domain: sourceDomain, conversationId: state.conversationId, leadId: metadata?.leadId || null, metadata }),
      });
    } catch (_) {}
  }

  async function loadSettings() {
    try {
      const url = `${baseUrl}/api/widget/settings?siteId=${encodeURIComponent(siteId)}&domain=${encodeURIComponent(sourceDomain)}&url=${encodeURIComponent(sourceUrl)}&v=${Date.now()}`;
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const settings = data.settings || data || {};
      state.settings = {
        ...state.settings,
        widgetTitle: settings.widgetTitle || settings.widget_title || settings.title || state.settings.widgetTitle,
        widgetSubtitle: settings.widgetSubtitle || settings.widget_subtitle || settings.subtitle || state.settings.widgetSubtitle,
        widgetBubbleText: settings.widgetBubbleText || settings.widget_bubble_text || settings.bubbleText || state.settings.widgetBubbleText,
        widgetQuoteButtonText: settings.widgetQuoteButtonText || settings.widget_quote_button_text || settings.quoteButtonText || state.settings.widgetQuoteButtonText,
        widgetSuccessMessage: settings.widgetSuccessMessage || settings.widget_success_message || state.settings.widgetSuccessMessage,
        widgetHeaderColor: settings.widgetHeaderColor || settings.widget_header_color || state.settings.widgetHeaderColor,
        widgetHeaderTextColor: settings.widgetHeaderTextColor || settings.widget_header_text_color || state.settings.widgetHeaderTextColor,
        widgetButtonColor: settings.widgetButtonColor || settings.widget_button_color || state.settings.widgetButtonColor,
        widgetButtonTextColor: settings.widgetButtonTextColor || settings.widget_button_text_color || state.settings.widgetButtonTextColor,
        widgetShowCallButton: settings.widgetShowCallButton ?? settings.widget_show_call_button ?? state.settings.widgetShowCallButton,
        widgetCallButtonText: settings.widgetCallButtonText || settings.widget_call_button_text || state.settings.widgetCallButtonText,
        widgetQuickQuestions: cleanQuickQuestions(settings),
        formFields: Array.isArray(settings.formFields) ? settings.formFields : [],
        businessPhone: settings.businessPhone || settings.phone || settings.business_phone || state.settings.businessPhone,
      };
    } catch (_) {}
  }

  function setOpen(open) {
    state.open = open;
    track(open ? "widget_opened" : "widget_closed");
    render();
  }

  function setView(view) {
    state.view = view;
    if (view === "form") track("lead_form_opened");
    render();
  }

  function updateForm(key, value) {
    state.form[key] = value;
  }

  function validateForm() {
    const fields = getActiveFormFields();
    for (const field of fields) {
      if (field.required && !String(state.form[field.key] || "").trim()) {
        return `${field.label} is required.`;
      }
    }
    return "";
  }

  function canonicalPayloadFromForm() {
    const customFields = { ...state.form };
    return {
      name: state.form.name || "",
      email: state.form.email || "",
      phone: state.form.phone || "",
      company: state.form.company || "",
      serviceNeeded: state.form.service_needed || state.form.serviceNeeded || "",
      preferredTimeline: state.form.preferred_timeline || state.form.preferredTimeline || "",
      message: state.form.message || "",
      customFields,
    };
  }

  async function submitLead() {
    const error = validateForm();
    state.formError = error;
    if (error) return render();

    state.loading = true;
    render();

    try {
      const payload = canonicalPayloadFromForm();
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: state.conversationId, siteId, ...payload, sourceUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Lead could not be submitted.");
      track("lead_saved", { leadId: data.leadId });
      state.view = "success";
    } catch (err) {
      state.formError = err instanceof Error ? err.message : "Lead could not be submitted.";
      track("lead_save_failed", { error: state.formError });
    } finally {
      state.loading = false;
      render();
    }
  }

  async function sendMessage(text) {
    const message = String(text || "").trim();
    if (!message || state.loading) return;
    state.messages.push({ role: "user", content: message });
    state.loading = true;
    render();

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, conversationId: state.conversationId, message, sourceUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.conversationId) state.conversationId = data.conversationId;
      state.messages.push({ role: "assistant", content: data.reply || data.message || data.answer || "I can help answer questions and collect your service inquiry. Use the request button when you are ready." });
    } catch (_) {
      state.messages.push({ role: "assistant", content: "I had trouble answering that. You can still send a service inquiry using the button above." });
    } finally {
      state.loading = false;
      render();
    }
  }

  function renderBubble(root) {
    root.appendChild(el("button", { id: "chatarai-bubble", type: "button", onclick: () => setOpen(true), "aria-label": "Open chat widget" }, [
      el("span", { id: "chatarai-bubble-dot" }),
      el("span", {}, [state.settings.widgetBubbleText || DEFAULT_SETTINGS.widgetBubbleText]),
    ]));
  }

  function renderHeader() {
    const phone = String(state.settings.businessPhone || "").trim();
    const showCall = state.settings.widgetShowCallButton && phone;
    const actions = [el("button", { class: "chatarai-primary", type: "button", onclick: () => setView("form") }, [state.settings.widgetQuoteButtonText || DEFAULT_SETTINGS.widgetQuoteButtonText])];
    if (showCall) actions.push(el("a", { class: "chatarai-secondary", href: `tel:${phone.replace(/[^\d+]/g, "")}` }, [`${state.settings.widgetCallButtonText || "Call Now"} ${phone}`]));
    return el("div", { id: "chatarai-header" }, [
      el("div", { class: "chatarai-header-row" }, [
        el("div", {}, [
          el("div", { class: "chatarai-title" }, [state.settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle]),
          el("div", { class: "chatarai-subtitle" }, [state.settings.widgetSubtitle || DEFAULT_SETTINGS.widgetSubtitle]),
        ]),
        el("button", { class: "chatarai-close", type: "button", onclick: () => setOpen(false), "aria-label": "Close" }, ["×"]),
      ]),
      el("div", { class: "chatarai-actions" }, actions),
    ]);
  }

  function renderChatBody() {
    const chat = el("div", { class: "chatarai-chat" });
    state.messages.forEach((m) => chat.appendChild(el("div", { class: `chatarai-message ${m.role === "user" ? "chatarai-user" : "chatarai-assistant"}` }, [m.content])));
    if (state.loading) chat.appendChild(el("div", { class: "chatarai-message chatarai-assistant" }, ["Thinking..."]));
    const quickQuestions = cleanQuickQuestions(state.settings);
    chat.appendChild(el("div", { class: "chatarai-replies" }, quickQuestions.map((reply) => el("button", { class: "chatarai-chip", type: "button", onclick: () => sendMessage(reply) }, [reply]))));
    const input = el("input", { class: "chatarai-input", placeholder: "Ask a question...", type: "text", onkeydown: (e) => { if (e.key === "Enter") { e.preventDefault(); const v = e.currentTarget.value; e.currentTarget.value = ""; sendMessage(v); } } });
    const composer = el("div", { class: "chatarai-composer" }, [input, el("button", { class: "chatarai-send", type: "button", disabled: state.loading, onclick: () => { const v = input.value; input.value = ""; sendMessage(v); } }, ["Send"])]);
    return [chat, composer];
  }

  function renderInputForField(field) {
    const common = {
      placeholder: field.placeholder || "",
      value: state.form[field.key] || "",
      oninput: (e) => updateForm(field.key, e.currentTarget.value),
    };

    if (field.type === "textarea") return el("textarea", common, [state.form[field.key] || ""]);

    if (field.type === "select" || field.type === "yes_no") {
      const options = field.type === "yes_no" ? ["Yes", "No"] : field.options || [];
      const select = el("select", { onchange: (e) => updateForm(field.key, e.currentTarget.value) });
      select.appendChild(el("option", { value: "" }, [field.placeholder || "Select one"]));
      options.forEach((option) => {
        const opt = el("option", { value: option }, [option]);
        if ((state.form[field.key] || "") === option) opt.selected = true;
        select.appendChild(opt);
      });
      return select;
    }

    const inputType = field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type;
    return el("input", { ...common, type: inputType || "text" });
  }

  function renderDynamicField(field) {
    return el("div", { class: "chatarai-field" }, [
      el("label", {}, [`${field.label}${field.required ? " *" : ""}`]),
      renderInputForField(field),
    ]);
  }

  function renderFormBody() {
    const formNodes = [
      el("div", { class: "chatarai-form-title" }, ["Send a service inquiry"]),
      state.formError ? el("div", { class: "chatarai-error" }, [state.formError]) : null,
      el("div", { class: "chatarai-help" }, ["Share the details requested below and the team can follow up."]),
    ];

    getActiveFormFields().forEach((field) => formNodes.push(renderDynamicField(field)));
    formNodes.push(el("button", { class: "chatarai-primary", type: "button", disabled: state.loading, onclick: submitLead }, [state.loading ? "Submitting..." : "Submit Inquiry"]));
    formNodes.push(el("button", { class: "chatarai-secondary", type: "button", style: { marginTop: "10px", color: "#334155", borderColor: "#cbd5e1", background: "#fff" }, onclick: () => setView("chat") }, ["Back to chat"]));

    return [el("div", { class: "chatarai-form" }, formNodes)];
  }

  function renderSuccessBody() {
    return [el("div", { class: "chatarai-success" }, [
      el("h3", {}, ["Information received"]),
      el("p", {}, [state.settings.widgetSuccessMessage || DEFAULT_SETTINGS.widgetSuccessMessage]),
      el("button", { class: "chatarai-primary", type: "button", onclick: () => setView("chat") }, ["Back to Chat"]),
    ])];
  }

  function renderPanel(root) {
    const panel = el("div", { id: "chatarai-panel", role: "dialog", "aria-label": "Chat widget" });
    panel.appendChild(renderHeader());
    const body = el("div", { id: "chatarai-body" });
    const nodes = state.view === "form" ? renderFormBody() : state.view === "success" ? renderSuccessBody() : renderChatBody();
    nodes.forEach((node) => body.appendChild(node));
    panel.appendChild(body);
    panel.appendChild(el("div", { class: "chatarai-footer" }, ["This chat helps collect service inquiries for follow-up."]));
    root.appendChild(panel);
  }

  function render() {
    applyStyles();
    let root = document.getElementById("chatarai-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "chatarai-root";
      document.body.appendChild(root);
    }
    root.innerHTML = "";
    if (state.open) renderPanel(root);
    else renderBubble(root);
  }

  async function init() {
    await loadSettings();
    render();
    track("widget_loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
