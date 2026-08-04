"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders text with every occurrence of `crib` highlighted (case-insensitive).
 */
export function HighlightedText({
  text,
  crib,
  className,
}: {
  text: string;
  crib: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    const needle = crib.toUpperCase().trim();
    if (!needle || !text) {
      return [{ type: "text" as const, value: text }];
    }

    const upper = text.toUpperCase();
    const out: { type: "text" | "mark"; value: string }[] = [];
    let i = 0;
    while (i < text.length) {
      const idx = upper.indexOf(needle, i);
      if (idx === -1) {
        out.push({ type: "text", value: text.slice(i) });
        break;
      }
      if (idx > i) {
        out.push({ type: "text", value: text.slice(i, idx) });
      }
      out.push({ type: "mark", value: text.slice(idx, idx + needle.length) });
      i = idx + needle.length;
    }
    return out;
  }, [text, crib]);

  return (
    <p
      className={cn(
        "break-words font-mono text-sm leading-relaxed text-zinc-200",
        className,
      )}
    >
      {parts.map((p, i) =>
        p.type === "mark" ? (
          <mark
            key={i}
            className="rounded-sm bg-amber-400/35 px-0.5 text-amber-50 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
          >
            {p.value}
          </mark>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </p>
  );
}
