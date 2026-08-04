"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?'-:/";

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
 * Top half: child is 200% of half-height (= full cell), glyph centered → top of letter shows.
 * Bottom half: same full-height child shifted up by 50% of itself → bottom of letter shows.
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
      <span className="block leading-none text-amber-100/95">{show}</span>
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

  // ~30% larger than the original sm/md/lg cells
  const dims =
    size === "lg"
      ? "h-[4.55rem] w-[3.25rem] sm:h-[5.2rem] sm:w-[3.6rem] text-[1.95rem] sm:text-[2.45rem]"
      : size === "sm"
        ? "h-10 w-[1.95rem] text-sm"
        : "h-[3.6rem] w-[2.6rem] sm:h-[3.9rem] sm:w-[2.9rem] text-[1.3rem] sm:text-[1.55rem]";

  const char = flipping ? next : display;
  const oldChar = display;

  return (
    <div
      className={cn(
        "relative select-none font-mono font-semibold tracking-tight",
        dims,
      )}
      style={{ perspective: "600px" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Top half — top of centered glyph */}
        <div className="absolute inset-x-0 top-0 z-[1] h-1/2 overflow-hidden">
          <FlapGlyph char={char} />
        </div>

        {/* Bottom half — bottom of centered glyph (full glyph box shifted up) */}
        <div className="absolute inset-x-0 bottom-0 z-[1] h-1/2 overflow-hidden">
          <FlapGlyph char={char} className="-translate-y-1/2" />
        </div>

        {/* Flipping top panel (outgoing letter) */}
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
            <FlapGlyph char={oldChar} className="text-amber-50" />
          </div>
        )}

        {/* Center hinge */}
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
    <div className={cn("flex flex-wrap gap-1 sm:gap-1.5", className)}>
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
