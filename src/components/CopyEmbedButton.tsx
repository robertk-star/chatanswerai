"use client";

import { useState } from "react";

export function CopyEmbedButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-slate-50"
    >
      {copied ? "Copied" : "Copy Script"}
    </button>
  );
}
