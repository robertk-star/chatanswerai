(() => {
  if (window.__chatAnswerAiWidgetLoaded) return;
  window.__chatAnswerAiWidgetLoaded = true;

  const script = document.currentScript;
  const siteId = script?.getAttribute("data-site-id") || "demo";
  const baseUrl = "https://www.chatanswerai.com";
  const sourceUrl = window.location.href;
  const sourceDomain = window.location.hostname;
  window.CHATANSWERAI_WIDGET_VERSION = "generic-business-foundation-20260610a";
  window.CHATANSWERAI_WIDGET_API_BASE = baseUrl;

  const DEFAULT_SETTINGS = {
    widgetTitle: "Service Inquiry Assistant",
    widgetSubtitle: "Answers questions and collects service inquiries",
    widgetBubbleText: "Questions? Chat with us",
    widgetQuoteButtonText: "Request Information",
    widgetSuccessMessage:
      "Thanks. Your information was received. Someone from the team can review the details and follow up.",
    widgetHeaderColor: "#0f172a",
    widgetHeaderTextColor: "#ffffff",
    widgetButtonColor: "#f5b51b",
    widgetButtonTextColor: "#0f172a",
    widgetShowCallButton: true,
    widgetCallButtonText: "Call Now",
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
        content:
          "Hi! I can answer questions about this business and help collect a service inquiry. What can I help you with today?",
      },
    ],
    form: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceNeeded: "",
      message: "",
      preferredTimeline: "",
    },
    formError: "",
    formSuccess: false,
  };

  const quickReplies = [
    "What services do you offer?",
    "What areas do you serve?",
    "How fast can someone follow up?",
    "Can I request information?",
  ];

  function css(strings, ...values) {
    return strings.reduce(
      (result, string, i) => result + string + (values[i] || ""),
      "",
    );
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) return;
      if (key === "class") node.className = value;
      else if (key === "style" && typeof value === "object")
        Object.assign(node.style, value);
      else if (key.startsWith("on") && typeof value === "function")
        node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, String(value));
    });

    children.forEach((child) => {
      if (child === null || child === undefined) return;
      node.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child,
      );
    });

    return node;
  }

  function getSettingsValue(...keys) {
    for (const key of keys) {
      if (
        state.settings &&
        state.settings[key] !== undefined &&
        state.settings[key] !== null &&
        state.settings[key] !== ""
      ) {
        return state.settings[key];
      }
    }
    return "";
  }

  function titleCase(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function createStyles() {
    const style = document.createElement("style");
    style.id = "coc-widget-styles";
    style.textContent = css`
      :root {
        --coc-header: ${state.settings.widgetHeaderColor ||
        DEFAULT_SETTINGS.widgetHeaderColor};
        --coc-header-text: ${state.settings.widgetHeaderTextColor ||
        DEFAULT_SETTINGS.widgetHeaderTextColor};
        --coc-button: ${state.settings.widgetButtonColor ||
        DEFAULT_SETTINGS.widgetButtonColor};
        --coc-button-text: ${state.settings.widgetButtonTextColor ||
        DEFAULT_SETTINGS.widgetButtonTextColor};
      }

      #coc-root,
      #coc-root * {
        box-sizing: border-box;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      #coc-bubble {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 2147483000;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 0;
        border-radius: 999px;
        padding: 14px 18px;
        background: var(--coc-header);
        color: var(--coc-header-text);
        font-weight: 800;
        font-size: 15px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
        cursor: pointer;
      }

      #coc-bubble-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--coc-button);
      }

      #coc-panel {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 2147483001;
        width: min(420px, calc(100vw - 32px));
        max-height: min(720px, calc(100vh - 32px));
        overflow: hidden;
        border-radius: 26px;
        background: #fff;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
        border: 1px solid rgba(148, 163, 184, 0.35);
        display: flex;
        flex-direction: column;
      }

      #coc-header {
        background: var(--coc-header);
        color: var(--coc-header-text);
        padding: 18px 18px 16px;
      }

      .coc-header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .coc-title {
        font-weight: 900;
        font-size: 16px;
        line-height: 1.2;
      }

      .coc-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: var(--coc-header-text);
        opacity: 0.78;
        line-height: 1.35;
      }

      .coc-close {
        border: 1px solid
          color-mix(in srgb, var(--coc-header-text) 28%, transparent);
        background: rgba(255, 255, 255, 0.12);
        color: var(--coc-header-text);
        border-radius: 999px;
        width: 34px;
        height: 34px;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .coc-top-actions {
        margin-top: 14px;
        display: grid;
        gap: 8px;
      }

      .coc-primary-button {
        border: 0;
        border-radius: 16px;
        padding: 13px 14px;
        background: var(--coc-button);
        color: var(--coc-button-text);
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
      }

      .coc-secondary-button {
        border: 1px solid
          color-mix(in srgb, var(--coc-header-text) 28%, transparent);
        border-radius: 16px;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.12);
        color: var(--coc-header-text);
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
      }

      #coc-body {
        background: #f8fafc;
        overflow: auto;
        flex: 1;
        min-height: 360px;
      }

      .coc-chat {
        padding: 16px;
      }

      .coc-message {
        max-width: 86%;
        margin-bottom: 12px;
        padding: 12px 14px;
        border-radius: 18px;
        line-height: 1.45;
        font-size: 14px;
        white-space: pre-wrap;
      }

      .coc-assistant {
        background: #fff;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }

      .coc-user {
        margin-left: auto;
        background: #0f172a;
        color: #fff;
      }

      .coc-quick-replies {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0 14px;
      }

      .coc-chip {
        border: 1px solid #cbd5e1;
        background: #fff;
        color: #334155;
        border-radius: 999px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }

      .coc-composer {
        border-top: 1px solid #e2e8f0;
        background: #fff;
        padding: 12px;
        display: flex;
        gap: 8px;
      }

      .coc-input {
        flex: 1;
        min-width: 0;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 12px 14px;
        font-size: 14px;
        outline: none;
      }

      .coc-send {
        border: 0;
        border-radius: 999px;
        padding: 0 18px;
        background: #16a34a;
        color: #fff;
        font-weight: 900;
        cursor: pointer;
      }

      .coc-send:disabled,
      .coc-primary-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .coc-form {
        padding: 16px;
      }

      .coc-form-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .coc-form-title {
        font-size: 18px;
        font-weight: 900;
        color: #0f172a;
      }

      .coc-back {
        border: 1px solid #cbd5e1;
        background: #fff;
        color: #334155;
        border-radius: 999px;
        padding: 8px 12px;
        font-weight: 800;
        font-size: 12px;
        cursor: pointer;
      }

      .coc-grid {
        display: grid;
        gap: 12px;
      }

      .coc-field label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 900;
        color: #475569;
      }

      .coc-field input,
      .coc-field select,
      .coc-field textarea {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 11px 12px;
        font-size: 14px;
        background: #fff;
        color: #0f172a;
        outline: none;
      }

      .coc-field textarea {
        min-height: 88px;
        resize: vertical;
      }

      .coc-error {
        margin-bottom: 12px;
        border-radius: 14px;
        background: #fef2f2;
        color: #b91c1c;
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 700;
      }

      .coc-help {
        margin: 10px 0 14px;
        font-size: 12px;
        line-height: 1.45;
        color: #64748b;
      }

      .coc-success {
        padding: 26px 18px;
        text-align: center;
      }

      .coc-success-icon {
        width: 54px;
        height: 54px;
        margin: 0 auto 14px;
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 26px;
      }

      .coc-success h3 {
        margin: 0;
        color: #0f172a;
        font-size: 20px;
      }

      .coc-success p {
        color: #475569;
        line-height: 1.55;
        font-size: 14px;
      }

      .coc-footer-note {
        padding: 10px 16px 14px;
        font-size: 11px;
        color: #64748b;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
      }

      @media (max-width: 540px) {
        #coc-bubble {
          right: 14px;
          bottom: 14px;
          max-width: calc(100vw - 28px);
          font-size: 14px;
        }

        #coc-panel {
          left: 10px;
          right: 10px;
          bottom: 10px;
          width: auto;
          max-height: calc(100vh - 20px);
          border-radius: 22px;
        }

        #coc-body {
          min-height: 380px;
        }

        .coc-message {
          max-width: 92%;
        }

        .coc-composer {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
      }
    `;

    const existing = document.getElementById("coc-widget-styles");
    if (existing) existing.remove();
    document.head.appendChild(style);
  }

  async function track(eventType, metadata = {}) {
    try {
      await fetch(`${baseUrl}/api/widget/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          eventType,
          siteId,
          sourceUrl,
          pageUrl: sourceUrl,
          domain: sourceDomain,
          conversationId: state.conversationId,
          leadId: metadata && metadata.leadId ? metadata.leadId : null,
          metadata,
        }),
      });
    } catch (_) {}
  }

  async function loadSettings() {
    try {
      const settingsUrl = `${baseUrl}/api/widget/settings?siteId=${encodeURIComponent(siteId)}&domain=${encodeURIComponent(sourceDomain)}&url=${encodeURIComponent(sourceUrl)}&v=${Date.now()}`;
      const res = await fetch(settingsUrl, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) return;

      const data = await res.json();
      const settings = data.settings || data || {};

      state.settings = {
        ...state.settings,
        widgetTitle:
          settings.widgetTitle ||
          settings.widget_title ||
          settings.title ||
          state.settings.widgetTitle,
        widgetSubtitle:
          settings.widgetSubtitle ||
          settings.widget_subtitle ||
          settings.subtitle ||
          state.settings.widgetSubtitle,
        widgetBubbleText:
          settings.widgetBubbleText ||
          settings.widget_bubble_text ||
          settings.bubbleText ||
          state.settings.widgetBubbleText,
        widgetQuoteButtonText:
          settings.widgetQuoteButtonText ||
          settings.widget_quote_button_text ||
          settings.quoteButtonText ||
          state.settings.widgetQuoteButtonText,
        widgetSuccessMessage:
          settings.widgetSuccessMessage ||
          settings.widget_success_message ||
          state.settings.widgetSuccessMessage,
        widgetHeaderColor:
          settings.widgetHeaderColor ||
          settings.widget_header_color ||
          state.settings.widgetHeaderColor,
        widgetHeaderTextColor:
          settings.widgetHeaderTextColor ||
          settings.widget_header_text_color ||
          state.settings.widgetHeaderTextColor,
        widgetButtonColor:
          settings.widgetButtonColor ||
          settings.widget_button_color ||
          state.settings.widgetButtonColor,
        widgetButtonTextColor:
          settings.widgetButtonTextColor ||
          settings.widget_button_text_color ||
          state.settings.widgetButtonTextColor,
        widgetShowCallButton:
          settings.widgetShowCallButton ??
          settings.widget_show_call_button ??
          state.settings.widgetShowCallButton,
        widgetCallButtonText:
          settings.widgetCallButtonText ||
          settings.widget_call_button_text ||
          state.settings.widgetCallButtonText,
        businessPhone:
          settings.businessPhone ||
          settings.phone ||
          settings.business_phone ||
          state.settings.businessPhone,
      };
    } catch (_) {}
  }

  function setOpen(open) {
    state.open = open;
    if (open) track("widget_opened");
    else track("widget_closed");
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
    if (!state.form.name.trim()) return "Name is required.";
    if (!state.form.phone.trim()) return "Phone number is required.";
    if (!state.form.serviceNeeded.trim() && !state.form.message.trim()) {
      return "Service needed or message is required.";
    }
    return "";
  }

  async function submitLead() {
    const error = validateForm();
    state.formError = error;
    if (error) {
      render();
      return;
    }

    state.loading = true;
    state.formError = "";
    render();

    try {
      track("lead_form_submitted");

      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: state.conversationId,
          siteId,
          name: state.form.name,
          phone: state.form.phone,
          email: state.form.email,
          company: state.form.company,
          serviceNeeded: state.form.serviceNeeded,
          message: state.form.message,
          preferredTimeline: state.form.preferredTimeline,
          sourceUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Lead could not be submitted.");
      }

      track("lead_saved", { leadId: data.leadId });
      state.formSuccess = true;
      state.view = "success";
    } catch (err) {
      state.formError =
        err instanceof Error ? err.message : "Lead could not be submitted.";
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
      track("chat_message_sent", { message });

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          conversationId: state.conversationId,
          message,
          sourceUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.conversationId) state.conversationId = data.conversationId;

      const reply =
        data.reply ||
        data.message ||
        data.answer ||
        "I can help answer questions and collect your service inquiry. Use the request button when you are ready.";

      state.messages.push({ role: "assistant", content: reply });
      track("chat_response_received");
    } catch (err) {
      state.messages.push({
        role: "assistant",
        content:
          "I had trouble answering that. You can still send a service inquiry using the button above.",
      });
    } finally {
      state.loading = false;
      render();
    }
  }

  function renderBubble(root) {
    const bubble = el(
      "button",
      {
        id: "coc-bubble",
        type: "button",
        onclick: () => setOpen(true),
        "aria-label": "Open chat widget",
      },
      [
        el("span", { id: "coc-bubble-dot" }),
        el("span", {}, [
          state.settings.widgetBubbleText || DEFAULT_SETTINGS.widgetBubbleText,
        ]),
      ],
    );

    root.appendChild(bubble);
  }

  function renderHeader() {
    const phone = String(state.settings.businessPhone || "").trim();
    const showCall = state.settings.widgetShowCallButton && phone;

    const actions = [
      el(
        "button",
        {
          class: "coc-primary-button",
          type: "button",
          onclick: () => setView("form"),
        },
        [
          state.settings.widgetQuoteButtonText ||
            DEFAULT_SETTINGS.widgetQuoteButtonText,
        ],
      ),
    ];

    if (showCall) {
      actions.push(
        el(
          "a",
          {
            class: "coc-secondary-button",
            href: `tel:${phone.replace(/[^\d+]/g, "")}`,
          },
          [`${state.settings.widgetCallButtonText || "Call Now"} ${phone}`],
        ),
      );
    }

    return el("div", { id: "coc-header" }, [
      el("div", { class: "coc-header-row" }, [
        el("div", {}, [
          el("div", { class: "coc-title" }, [
            state.settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle,
          ]),
          el("div", { class: "coc-subtitle" }, [
            state.settings.widgetSubtitle || DEFAULT_SETTINGS.widgetSubtitle,
          ]),
        ]),
        el(
          "button",
          {
            class: "coc-close",
            type: "button",
            onclick: () => setOpen(false),
            "aria-label": "Close",
          },
          ["×"],
        ),
      ]),
      el("div", { class: "coc-top-actions" }, actions),
    ]);
  }

  function renderChatBody() {
    const chat = el("div", { class: "coc-chat" });

    state.messages.forEach((message) => {
      chat.appendChild(
        el(
          "div",
          {
            class: `coc-message ${message.role === "user" ? "coc-user" : "coc-assistant"}`,
          },
          [message.content],
        ),
      );
    });

    if (state.loading) {
      chat.appendChild(
        el("div", { class: "coc-message coc-assistant" }, ["Thinking..."]),
      );
    }

    chat.appendChild(
      el(
        "div",
        { class: "coc-quick-replies" },
        quickReplies.map((reply) =>
          el(
            "button",
            {
              class: "coc-chip",
              type: "button",
              onclick: () => sendMessage(reply),
            },
            [reply],
          ),
        ),
      ),
    );

    const input = el("input", {
      class: "coc-input",
      placeholder: "Ask a question...",
      type: "text",
      onkeydown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const value = event.currentTarget.value;
          event.currentTarget.value = "";
          sendMessage(value);
        }
      },
    });

    const composer = el("div", { class: "coc-composer" }, [
      input,
      el(
        "button",
        {
          class: "coc-send",
          type: "button",
          disabled: state.loading,
          onclick: () => {
            const value = input.value;
            input.value = "";
            sendMessage(value);
          },
        },
        ["Send"],
      ),
    ]);

    return [chat, composer];
  }

  function renderFormBody() {
    const form = el("div", { class: "coc-form" }, [
      el("div", { class: "coc-form-head" }, [
        el("div", { class: "coc-form-title" }, ["Send a service inquiry"]),
        el(
          "button",
          { class: "coc-back", type: "button", onclick: () => setView("chat") },
          ["Back to chat"],
        ),
      ]),
      state.formError
        ? el("div", { class: "coc-error" }, [state.formError])
        : null,
      el("div", { class: "coc-help" }, [
        "Required: name, phone, and either service needed or message.",
      ]),
      el("div", { class: "coc-grid" }, [
        field("Name *", "name", "Your name"),
        field("Email", "email", "you@example.com", "email"),
        field("Phone *", "phone", "Best phone number"),
        field("Company", "company", "Company name, if applicable"),
        field(
          "Service needed *",
          "serviceNeeded",
          "Tell us what you need help with",
        ),
        selectField("Preferred timeline", "preferredTimeline", [
          "",
          "ASAP",
          "This week",
          "Within 30 days",
          "1–3 months",
          "Just researching",
        ]),
        textareaField(
          "Message *",
          "message",
          "Share any details that may help the team respond.",
        ),
        el(
          "button",
          {
            class: "coc-primary-button",
            type: "button",
            disabled: state.loading,
            onclick: submitLead,
          },
          [state.loading ? "Submitting..." : "Submit Inquiry"],
        ),
      ]),
    ]);

    return [form];
  }

  function field(label, key, placeholder, type = "text") {
    return el("div", { class: "coc-field" }, [
      el("label", {}, [label]),
      el("input", {
        type,
        placeholder,
        value: state.form[key] || "",
        oninput: (event) => updateForm(key, event.currentTarget.value),
      }),
    ]);
  }

  function textareaField(label, key, placeholder) {
    return el("div", { class: "coc-field" }, [
      el("label", {}, [label]),
      el(
        "textarea",
        {
          placeholder,
          oninput: (event) => updateForm(key, event.currentTarget.value),
        },
        [state.form[key] || ""],
      ),
    ]);
  }

  function selectField(label, key, options) {
    const select = el("select", {
      onchange: (event) => updateForm(key, event.currentTarget.value),
    });

    options.forEach((option) => {
      const opt = el("option", { value: option }, [option || "Select one"]);
      if ((state.form[key] || "") === option) opt.selected = true;
      select.appendChild(opt);
    });

    return el("div", { class: "coc-field" }, [
      el("label", {}, [label]),
      select,
    ]);
  }

  function renderSuccessBody() {
    return [
      el("div", { class: "coc-success" }, [
        el("div", { class: "coc-success-icon" }, ["✓"]),
        el("h3", {}, ["Information received"]),
        el("p", {}, [
          state.settings.widgetSuccessMessage ||
            DEFAULT_SETTINGS.widgetSuccessMessage,
        ]),
        el(
          "button",
          {
            class: "coc-primary-button",
            type: "button",
            onclick: () => {
              state.view = "chat";
              render();
            },
          },
          ["Back to Chat"],
        ),
      ]),
    ];
  }

  function renderPanel(root) {
    const panel = el("div", {
      id: "coc-panel",
      role: "dialog",
      "aria-label": "Chat widget",
    });

    panel.appendChild(renderHeader());

    const body = el("div", { id: "coc-body" });

    if (state.view === "form") {
      renderFormBody().forEach((node) => body.appendChild(node));
    } else if (state.view === "success") {
      renderSuccessBody().forEach((node) => body.appendChild(node));
    } else {
      renderChatBody().forEach((node) => body.appendChild(node));
    }

    panel.appendChild(body);
    panel.appendChild(
      el("div", { class: "coc-footer-note" }, [
        "This chat helps collect service inquiries for follow-up. It does not provide legal, tax, medical, financial, or professional advice unless the business specifically provides that service.",
      ]),
    );

    root.appendChild(panel);
  }

  function render() {
    createStyles();

    let root = document.getElementById("coc-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "coc-root";
      document.body.appendChild(root);
    }

    root.innerHTML = "";

    if (state.open) renderPanel(root);
    else renderBubble(root);
  }

  async function init() {
    await loadSettings();
    createStyles();
    render();
    track("widget_loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
