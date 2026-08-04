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

  const dims =
    size === "lg"
      ? "h-14 w-10 sm:h-16 sm:w-11 text-2xl sm:text-3xl"
      : size === "sm"
        ? "h-8 w-6 text-xs"
        : "h-11 w-8 text-base sm:h-12 sm:w-9 sm:text-lg";

  const char = flipping ? next : display;
  const show = char === " " ? "" : char;

  return (
    <div
      className={cn(
        "relative select-none font-mono font-semibold tracking-tight",
        dims,
      )}
      style={{ perspective: "600px" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* static top */}
        <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden">
          <div className="flex h-[200%] items-start justify-center pt-[8%]">
            <span className="text-amber-100/90">{show}</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/50" />
        </div>
        {/* static bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
          <div className="flex h-[200%] -translate-y-1/2 items-start justify-center pt-[8%]">
            <span className="text-amber-100/90">{show}</span>
          </div>
        </div>

        {/* flipping panel */}
        {flipping && (
          <div
            className="absolute inset-x-0 top-0 h-1/2 origin-bottom overflow-hidden rounded-t-md"
            style={{
              transformStyle: "preserve-3d",
              animation: "flap-down 280ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="flex h-[200%] items-start justify-center bg-gradient-to-b from-zinc-700 to-zinc-800 pt-[8%] shadow-lg">
              <span className="text-amber-50">{normalizeChar(display) === " " ? "" : normalizeChar(display)}</span>
            </div>
          </div>
        )}

        {/* center pin line */}
        <div className="pointer-events-none absolute inset-x-1 top-1/2 z-10 h-px -translate-y-px bg-black/60" />
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/5" />
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
        "flex flex-wrap gap-1 sm:gap-1.5",
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
