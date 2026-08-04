"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?'-:/";

/** Cap cell width so short strings don't balloon; height follows aspect ratio. */
const SIZE_MAX_WIDTH: Record<"sm" | "md" | "lg", string> = {
  sm: "1.5rem",
  md: "2.25rem",
  lg: "2.75rem",
};

interface SplitFlapCellProps {
  value: string;
  delayMs?: number;
  size?: "sm" | "md" | "lg";
}

function normalizeChar(ch: string): string {
  if (!ch || ch === " ") return " ";
  const upper = ch.toUpperCase();
  return FLAP_CHARS.includes(upper) ? upper : upper;
}

/**
 * Full-cell glyph, vertically centered. Parent half-windows clip to top/bottom.
 * Font size is ~58% of the smaller cell dimension so letters fill the flap.
 */
function FlapGlyph({
  char,
  className,
}: {
  char: string;
  className?: string;
}) {
  const show = char === " " ? "\u00A0" : char;
  return (
    <div
      className={cn(
        "flex h-[200%] w-full items-center justify-center",
        className,
      )}
    >
      <span
        className="block scale-105 leading-none text-amber-100/95"
        style={{ fontSize: "58cqmin" }}
      >
        {show}
      </span>
    </div>
  );
}

function SplitFlapCell({ value, delayMs = 0, size = "md" }: SplitFlapCellProps) {
  const target = normalizeChar(value);
  const [display, setDisplay] = useState(target);
  const [flipping, setFlipping] = useState(false);
  const [next, setNext] = useState(target);

  useEffect(() => {
    if (target === display) return;
    let endTimer: number | undefined;
    const start = window.setTimeout(() => {
      setNext(target);
      setFlipping(true);
      endTimer = window.setTimeout(() => {
        setDisplay(target);
        setFlipping(false);
      }, 280);
    }, delayMs);
    return () => {
      window.clearTimeout(start);
      if (endTimer) window.clearTimeout(endTimer);
    };
  }, [target, display, delayMs]);

  const char = flipping ? next : display;
  const oldChar = display;

  return (
    <div
      className="relative min-w-0 shrink select-none font-mono font-semibold tracking-tight"
      style={{
        flex: "1 1 0%",
        maxWidth: SIZE_MAX_WIDTH[size],
        aspectRatio: "5 / 7",
        // size containment so 58cqmin resolves against this cell
        containerType: "size",
        perspective: "600px",
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="absolute inset-x-0 top-0 z-[1] h-1/2 overflow-hidden">
          <FlapGlyph char={char} />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[1] h-1/2 overflow-hidden">
          <FlapGlyph char={char} className="-translate-y-1/2" />
        </div>

        {flipping && (
          <div
            className="absolute inset-x-0 top-0 z-[2] h-1/2 origin-bottom overflow-hidden rounded-t-md bg-gradient-to-b from-zinc-700 to-zinc-800 shadow-lg"
            style={{
              transformStyle: "preserve-3d",
              animation:
                "flap-down 280ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
              backfaceVisibility: "hidden",
            }}
          >
            <FlapGlyph char={oldChar} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0.5 top-1/2 z-[3] h-px -translate-y-px bg-black/70" />
        <div className="pointer-events-none absolute inset-0 z-[3] rounded-md ring-1 ring-inset ring-white/5" />
      </div>
    </div>
  );
}

interface SplitFlapDisplayProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  maxChars?: number;
  padChar?: string;
  staggerMs?: number;
}

export function SplitFlapDisplay({
  text,
  className,
  size = "md",
  maxChars,
  padChar = " ",
  staggerMs = 28,
}: SplitFlapDisplayProps) {
  const chars = useMemo(() => {
    const raw = (text || "").toUpperCase();
    if (maxChars) {
      const sliced = raw.slice(0, maxChars);
      return sliced.padEnd(maxChars, padChar).split("");
    }
    return (raw.length ? raw : " ").split("");
  }, [text, maxChars, padChar]);

  return (
    <div
      className={cn(
        // Always one row: cells shrink evenly to fit the container width
        "flex w-full min-w-0 flex-nowrap items-stretch gap-1 sm:gap-1.5",
        className,
      )}
    >
      {chars.map((ch, i) => (
        <SplitFlapCell
          key={`${i}-${maxChars ?? "dyn"}`}
          value={ch}
          delayMs={Math.min(i * staggerMs, 600)}
          size={size}
        />
      ))}
    </div>
  );
}
