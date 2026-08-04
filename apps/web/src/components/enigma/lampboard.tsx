"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ALPHABET } from "@restless/enigma";
import { cn } from "@/lib/utils";

/** QWERTZ-ish historical lamp order (3 rows) */
const ROWS = ["QWERTZUIO", "ASDFGHJK", "PYXCVBNML"];

interface LampboardProps {
  /** Most recently encoded output letter */
  activeLetter?: string | null;
  className?: string;
}

export function Lampboard({ activeLetter, className }: LampboardProps) {
  const [lit, setLit] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLetter) return;
    const upper = activeLetter.toUpperCase();
    if (!/[A-Z]/.test(upper)) return;
    setLit(upper);
    const id = window.setTimeout(() => setLit(null), 220);
    return () => window.clearTimeout(id);
  }, [activeLetter]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Lampboard
      </div>
      <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-zinc-950/70 p-4">
        {ROWS.map((row, ri) => (
          <div
            key={row}
            className="flex justify-center gap-1.5 sm:gap-2"
            style={{ paddingLeft: ri * 12 }}
          >
            {row.split("").map((letter) => {
              const on = lit === letter;
              return (
                <motion.div
                  key={letter}
                  animate={{
                    scale: on ? 1.08 : 1,
                    boxShadow: on
                      ? "0 0 24px rgba(251,191,36,0.55), inset 0 0 12px rgba(251,191,36,0.35)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm",
                    on
                      ? "border-amber-300/50 bg-amber-300/25 text-amber-50"
                      : "border-white/10 bg-zinc-900/90 text-zinc-500",
                  )}
                >
                  {letter}
                </motion.div>
              );
            })}
          </div>
        ))}
        {/* unused letters still in alphabet for completeness hint */}
        <div className="sr-only">{ALPHABET}</div>
      </div>
    </div>
  );
}
